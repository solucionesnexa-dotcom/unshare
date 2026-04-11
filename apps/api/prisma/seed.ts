import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Use fixed IDs for deterministic seeding
  const guardianId = '00000000-0000-4000-8000-000000000100';
  const familyId = '00000000-0000-4000-8000-000000000101';

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

  await prisma.roleAssignment.deleteMany({
    where: { userId: guardianId, scopeType: 'family' }
  });

  await prisma.roleAssignment.create({
    data: { id: uuidv7(), userId: guardianId, role: 'guardian', scopeType: 'family', scopeId: familyId }
  });

  const minorId = '00000000-0000-4000-8000-000000000004';
  await prisma.minor.upsert({
    where: { id: minorId },
    update: {},
    create: {
      id: minorId,
      familyId,
      firstNameEnc: Buffer.from('Mateo', 'utf8'),
      aliasesJson: ['Mateo'],
      sensitivityTagsJson: ['public_post']
    }
  });

  const minorValentinaId = '00000000-0000-4000-8000-000000000005';
  await prisma.minor.upsert({
    where: { id: minorValentinaId },
    update: {},
    create: {
      id: minorValentinaId,
      familyId,
      firstNameEnc: Buffer.from('Valentina', 'utf8'),
      aliasesJson: ['Valentina'],
      sensitivityTagsJson: ['public_post']
    }
  });

  const minorDiegoId = '00000000-0000-4000-8000-000000000006';
  await prisma.minor.upsert({
    where: { id: minorDiegoId },
    update: {},
    create: {
      id: minorDiegoId,
      familyId,
      firstNameEnc: Buffer.from('Diego', 'utf8'),
      aliasesJson: ['Diego'],
      sensitivityTagsJson: ['public_post']
    }
  });

  const caseId = '00000000-0000-4000-8000-000000000001';
  const findingId = '00000000-0000-4000-8000-000000000002';
  const evidenceId = '00000000-0000-4000-8000-000000000003';
  const findingUrl = 'https://www.instagram.com/p/CBn1w1xnVZ/';
  const urlFingerprint = createHash('sha256').update(findingUrl).digest('hex');

  await prisma.case.upsert({
    where: { id: caseId },
    update: {},
    create: {
      id: caseId,
      familyId,
      primaryGuardianId: guardianId,
      summary: 'Publicación con posible exposición de Mateo',
      priority: 2,
      status: 'open'
    }
  });

  await prisma.finding.upsert({
    where: { id: findingId },
    update: {},
    create: {
      id: findingId,
      caseId,
      minorId,
      url: findingUrl,
      urlFingerprint,
      platform: 'Instagram',
      ownershipType: 'own_content',
      riskScore: 82,
      status: 'detected'
    }
  });

  await prisma.findingEvidence.upsert({
    where: { id: evidenceId },
    update: {},
    create: {
      id: evidenceId,
      findingId,
      objectKey: `evidence/${findingId}/${evidenceId}.jpg`,
      sha256: ''.padEnd(64, '0'),
      mimeType: 'image/jpeg',
      status: 'available',
      capturedBy: guardianId
    }
  });
}

main().finally(() => prisma.$disconnect());
