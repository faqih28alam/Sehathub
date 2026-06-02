import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqItemDto, UpdateFaqItemDto } from './dto/faq-item.dto';

const MODEL = 'claude-haiku-4-5-20251001'; // fast + cheap for triage/FAQ

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: Anthropic | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY', '');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI features will return stubs');
    }
  }

  // ─── Triage ──────────────────────────────────────────────────────────────────

  async triage(symptoms: string, language = 'en') {
    if (!this.client) return this.triageStub(symptoms);

    const lang = language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English';

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: `You are a medical triage assistant for SehatHub clinic in South Tangerang, Indonesia.
Assess patient symptoms and respond in ${lang}.
Always respond with valid JSON only, no markdown.
Format: { "urgency": "emergency|urgent|routine|self-care", "summary": "one sentence", "recommendations": ["string", ...], "seekEmergencyIf": ["string", ...] }
- emergency: life-threatening, call ambulance immediately
- urgent: see a doctor within hours today
- routine: book an appointment within 1-3 days
- self-care: rest and home remedies, monitor symptoms`,
      messages: [
        {
          role: 'user',
          content: `Patient symptoms: ${symptoms}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    try {
      return JSON.parse(text);
    } catch {
      this.logger.error('Failed to parse triage response', text);
      return this.triageStub(symptoms);
    }
  }

  private triageStub(symptoms: string) {
    return {
      urgency: 'routine',
      summary: `Triage assessment for: ${symptoms.slice(0, 80)}`,
      recommendations: ['Please consult a doctor for proper assessment.'],
      seekEmergencyIf: ['Symptoms worsen significantly', 'Difficulty breathing', 'Loss of consciousness'],
      _stub: true,
    };
  }

  // ─── Consultation Summary ────────────────────────────────────────────────────

  async generateSummary(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        service: { select: { name: true } },
        prescription: { include: { items: true } },
      },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    const prescriptionText = appointment.prescription?.items.length
      ? appointment.prescription.items
          .map((i) => `${i.medication} ${i.dosage} — ${i.frequency} for ${i.duration}`)
          .join('; ')
      : 'No prescription issued';

    const context = `
Patient: ${appointment.patient.user.name}
Doctor: Dr. ${appointment.doctor.user.name}
Service: ${appointment.service.name}
Date: ${appointment.scheduledAt.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
Consultation Notes: ${appointment.consultationNotes ?? 'No notes recorded'}
Prescription: ${prescriptionText}
`.trim();

    if (!this.client) {
      return {
        summary: context,
        keyFindings: ['AI service not configured — showing raw notes'],
        followUp: [],
        _stub: true,
      };
    }

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: `You are a medical documentation assistant. Generate a concise, professional consultation summary in English from the provided consultation data.
Respond with valid JSON only: { "summary": "paragraph", "keyFindings": ["string", ...], "followUp": ["string", ...] }`,
      messages: [{ role: 'user', content: context }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    try {
      const result = JSON.parse(text) as Record<string, unknown>;
      // Persist generated summary back to consultation notes if empty
      if (!appointment.consultationNotes && result.summary) {
        await this.prisma.appointment.update({
          where: { id: appointmentId },
          data: { consultationNotes: result.summary as string },
        });
      }
      return result;
    } catch {
      return { summary: text, keyFindings: [], followUp: [], _stub: false };
    }
  }

  // ─── FAQ RAG ─────────────────────────────────────────────────────────────────

  async faqQuery(question: string) {
    const faqs = await this.prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });

    if (!this.client) {
      return {
        answer: 'AI service not configured. Please contact the clinic directly.',
        sources: [],
        _stub: true,
      };
    }

    const faqContext = faqs.length
      ? faqs.map((f, i) => `[${i + 1}] Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
      : 'No FAQ items available yet. Please contact the clinic.';

    const message = await this.client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: `You are a helpful assistant for SehatHub clinic in South Tangerang, Indonesia.
Answer patient questions using ONLY the FAQ content provided. If the answer is not in the FAQ, say so and suggest contacting the clinic.
Respond with valid JSON: { "answer": "string", "sources": [faq_numbers_used] }`,
          // Enable prompt caching for the FAQ context — it's large and reused across requests
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `FAQ Content:\n${faqContext}\n\nPatient question: ${question}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    try {
      return JSON.parse(text);
    } catch {
      return { answer: text, sources: [] };
    }
  }

  // ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

  async getFaqs() {
    return this.prisma.faqItem.findMany({ orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] });
  }

  async createFaq(dto: CreateFaqItemDto) {
    return this.prisma.faqItem.create({ data: dto });
  }

  async updateFaq(id: string, dto: UpdateFaqItemDto) {
    await this.prisma.faqItem.findUniqueOrThrow({ where: { id } });
    return this.prisma.faqItem.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: string) {
    return this.prisma.faqItem.delete({ where: { id } });
  }
}
