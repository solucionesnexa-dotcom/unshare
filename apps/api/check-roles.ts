import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'guardian@example.com' },
  });
  console.log('User:', user?.id, user?.email);
  
  if (user) {
    const roles = await prisma.roleAssignment.findMany({
      where: { userId: user.id },
    });
    console.log('Role assignments:', roles);
  }
  
  const cases = await prisma.case.findMany();
  console.log('Cases:', cases.length, cases[0]?.familyId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
