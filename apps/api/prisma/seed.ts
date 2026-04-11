import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const guardianId = uuidv7();
  const familyId = uuidv7();

  await prisma.user.upsert({
    where: { email: 'guardian@example.com' },
    update: {},
    create: {
      id: guardianId,
      email: 'guardian@example.com',
      passwordHash: createHash('sha256').update('Password123!').digest('hex')
    }
  });

  await prisma.family.upsert({ where: { id: familyId }, update: {}, create: { id: familyId, createdBy: guardianId } });

  await prisma.roleAssignment.create({
    data: { id: uuidv7(), userId: guardianId, role: 'guardian', scopeType: 'family', scopeId: familyId }
  }).catch(() => undefined);
}

main().finally(() => prisma.$disconnect());
