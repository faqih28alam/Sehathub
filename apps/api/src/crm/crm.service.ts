import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async findAllLeads(query: {
    status?: string;
    source?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, parseInt(query.page ?? '1'));
    const limit = Math.min(100, parseInt(query.limit ?? '20'));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;

    const [leads, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { activities: true } } },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads.map((l) => ({ ...l, activityCount: l._count.activities })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: dto });
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findOne(id);
    return this.prisma.lead.update({ where: { id }, data: dto });
  }

  async addActivity(leadId: string, dto: CreateActivityDto, actorId: string) {
    await this.findOne(leadId);
    return this.prisma.crmActivity.create({
      data: { leadId, actorId, type: dto.type, notes: dto.notes },
    });
  }

  async getStatusCounts() {
    const counts = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });
    return Object.fromEntries(counts.map((c) => [c.status, c._count]));
  }
}
