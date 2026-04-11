"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=test-db.js.map