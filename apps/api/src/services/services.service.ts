import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreatePromoCodeDto } from './dto/create-promo.dto';
import { ServiceCategory } from '@sehathub/db';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  findAll(onlyActive = false) {
    return this.prisma.service.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { category: 'asc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category ?? ServiceCategory.GENERAL_CONSULTATION,
        durationMinutes: dto.durationMinutes ?? 30,
        priceIDR: dto.priceIDR,
        priceUSD: dto.priceUSD,
      },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  // Promo codes
  findAllPromos() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPromo(dto: CreatePromoCodeDto) {
    if (!dto.discountPercent && !dto.discountIDR) {
      throw new BadRequestException('Either discountPercent or discountIDR is required');
    }
    const existing = await this.prisma.promoCode.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Promo code already exists');

    return this.prisma.promoCode.create({
      data: {
        code: dto.code.toUpperCase(),
        discountPercent: dto.discountPercent,
        discountIDR: dto.discountIDR,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async validatePromoCode(code: string, amountIDR: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) throw new NotFoundException('Invalid promo code');
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new BadRequestException('Promo code expired');
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    let discountIDR = 0;
    if (promo.discountPercent) discountIDR = Math.round(amountIDR * promo.discountPercent / 100);
    else if (promo.discountIDR) discountIDR = promo.discountIDR;

    return { promoId: promo.id, discountIDR, finalAmountIDR: Math.max(0, amountIDR - discountIDR) };
  }
}
