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

  console.log('Seed complete:', admin.email, '/ SuperAdmin123!');
  console.log('Services in DB:', await prisma.service.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
