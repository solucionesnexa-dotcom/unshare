import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const caseRecord = await prisma.case.findUnique({
    where: { id: '00000000-0000-4000-8000-000000000001' },
  });
  console.log('Case found:', caseRecord);
  
  const findings = await prisma.finding.findMany({
    where: { caseId: '00000000-0000-4000-8000-000000000001' },
  });
  console.log('Findings count:', findings.length);
  console.log('First finding:', findings[0]);
}

main().catch(console.error).finally(() => prisma.$disconnect());
