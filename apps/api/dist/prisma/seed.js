"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const prisma = new client_1.PrismaClient();
async function main() {
    const guardianId = (0, uuid_1.v7)();
    const familyId = (0, uuid_1.v7)();
    await prisma.user.upsert({
        where: { email: 'guardian@example.com' },
        update: {},
        create: {
            id: guardianId,
            email: 'guardian@example.com',
            passwordHash: (0, crypto_1.createHash)('sha256').update('Password123!').digest('hex')
        }
    });
    await prisma.family.upsert({ where: { id: familyId }, update: {}, create: { id: familyId, createdBy: guardianId } });
    await prisma.roleAssignment.create({
        data: { id: (0, uuid_1.v7)(), userId: guardianId, role: 'guardian', scopeType: 'family', scopeId: familyId }
    }).catch(() => undefined);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map