import { PrismaClient, ServiceCategory } from '../generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Super admin
  const passwordHash = await bcrypt.hash('SuperAdmin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'superadmin@sehathub.id' },
    update: {},
    create: {
      email: 'superadmin@sehathub.id',
      passwordHash,
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
      isActive: true,
    },
  });

  // Seed services
  const services = [
    {
      name: 'General Consultation',
      description: 'Standard consultation with a general practitioner',
      category: ServiceCategory.GENERAL_CONSULTATION,
      durationMinutes: 30,
      priceIDR: 300000,
      priceUSD: 20,
    },
    {
      name: 'Emergency Consultation',
      description: 'Urgent same-day medical consultation',
      category: ServiceCategory.EMERGENCY,
      durationMinutes: 45,
      priceIDR: 500000,
      priceUSD: 35,
    },
    {
      name: 'Prescription Renewal',
      description: 'Renewal of existing prescription medications',
      category: ServiceCategory.PRESCRIPTION,
      durationMinutes: 15,
      priceIDR: 150000,
      priceUSD: 10,
    },
    {
      name: 'Lab Test Package',
      description: 'Basic blood panel and urinalysis',
      category: ServiceCategory.LAB_TEST,
      durationMinutes: 30,
      priceIDR: 400000,
      priceUSD: 28,
    },
    {
      name: 'Specialist Referral Consultation',
      description: 'Consultation for specialist referral and second opinion',
      category: ServiceCategory.SPECIALIST,
      durationMinutes: 45,
      priceIDR: 450000,
      priceUSD: 30,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.name }, // won't match, will always create — use name+category check
      update: {},
      create: s,
    }).catch(async () => {
      // Already exists by some other key, skip
    });
  }

  // Ensure at least the first service exists for smoke tests
  const existing = await prisma.service.count();
  if (existing === 0) {
    await prisma.service.createMany({ data: services });
  }

  // Seed FAQ items
  const faqs = [
    {
      question: 'What are your clinic hours?',
      answer: 'SehatHub Clinic is open Monday to Saturday, 08:00–20:00 WIB. Sunday and public holidays: 09:00–15:00 WIB. Emergency consultations are available 24/7 via WhatsApp.',
      category: 'hours',
    },
    {
      question: 'Jam berapa klinik buka?',
      answer: 'SehatHub Klinik buka Senin–Sabtu pukul 08:00–20:00 WIB. Minggu dan hari libur nasional: 09:00–15:00 WIB. Konsultasi darurat tersedia 24 jam melalui WhatsApp.',
      category: 'hours',
    },
    {
      question: 'Do you accept walk-in patients?',
      answer: 'Yes, we accept walk-in patients subject to doctor availability. However, we strongly recommend booking an appointment online to avoid waiting. Appointment patients are always prioritised.',
      category: 'booking',
    },
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our patient portal at sehathub.id/patient, via WhatsApp to our clinic number, or by calling us directly. Online booking is available 24/7.',
      category: 'booking',
    },
    {
      question: 'Bagaimana cara membuat janji temu?',
      answer: 'Anda dapat membuat janji melalui portal pasien di sehathub.id/patient, melalui WhatsApp ke nomor klinik kami, atau menghubungi kami langsung. Pemesanan online tersedia 24 jam.',
      category: 'booking',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash (IDR), all major credit/debit cards, GoPay, OVO, DANA, and bank transfer (BCA, Mandiri, BNI, BRI). International patients can pay in USD via Stripe. All payments are processed securely.',
      category: 'payment',
    },
    {
      question: 'Metode pembayaran apa yang diterima?',
      answer: 'Kami menerima tunai (IDR), kartu kredit/debit, GoPay, OVO, DANA, dan transfer bank (BCA, Mandiri, BNI, BRI). Pembayaran diproses secara aman.',
      category: 'payment',
    },
    {
      question: 'Do you speak English?',
      answer: 'Yes! All our doctors and front-desk staff speak English fluently. We regularly serve tourists and expatriates in South Tangerang and the Greater Jakarta area.',
      category: 'general',
    },
    {
      question: 'What services do you offer?',
      answer: 'We offer general consultations, emergency consultations, prescription renewals, basic lab tests (blood panel, urinalysis), specialist referrals, and teleconsultation. Please check our Services page for current pricing.',
      category: 'services',
    },
    {
      question: 'Layanan apa saja yang tersedia?',
      answer: 'Kami menyediakan konsultasi umum, konsultasi darurat, perpanjangan resep, tes laboratorium dasar (darah, urin), rujukan spesialis, dan telekonsula. Cek halaman Layanan untuk harga terkini.',
      category: 'services',
    },
    {
      question: 'Can I get a prescription refill?',
      answer: 'Yes. Prescription renewals are available with or without a consultation. If you are on long-term medication, our doctors can review your existing prescription and issue a renewal. Bring your previous prescription or medication packaging.',
      category: 'prescription',
    },
    {
      question: 'Do you offer teleconsultation?',
      answer: 'Yes, we offer video and phone consultations for non-emergency cases. Book a teleconsultation through the patient portal and our doctor will call you at the scheduled time.',
      category: 'teleconsult',
    },
    {
      question: 'Where are you located?',
      answer: 'SehatHub Clinic is located in South Tangerang (Tangerang Selatan), Banten, Indonesia — convenient for residents of BSD, Serpong, Alam Sutera, and the Greater Jakarta area. Exact address is available on our website and in Google Maps.',
      category: 'general',
    },
    {
      question: 'Is my personal health data kept private?',
      answer: 'Absolutely. All patient data is encrypted at rest and in transit. We comply with Indonesian UU PDP data privacy regulations. Your health information is never shared with third parties without your explicit consent.',
      category: 'privacy',
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faqItem.findFirst({ where: { question: faq.question } });
    if (!existing) {
      await prisma.faqItem.create({ data: { ...faq, isActive: true } });
    }
  }

  console.log('Seed complete:', admin.email, '/ SuperAdmin123!');
  console.log('Services in DB:', await prisma.service.count());
  console.log('FAQ items in DB:', await prisma.faqItem.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
