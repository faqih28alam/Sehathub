import { PrismaClient } from '../generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Seed complete:', admin.email, '/ SuperAdmin123!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
