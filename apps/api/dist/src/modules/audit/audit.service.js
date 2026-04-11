"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async write(event) {
        try {
            const prev = await this.prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' } });
            const payload = JSON.stringify({
                action: event.action,
                actorUserId: event.actorUserId || null,
                objectType: event.objectType,
                objectId: event.objectId || null,
                metadata: event.metadata || {},
                ts: new Date().toISOString()
            });
            const prevHash = prev?.currHash || '';
            const currHash = (0, crypto_1.createHash)('sha256').update(`${prevHash}${payload}`).digest('hex');
            return await this.prisma.auditLog.create({
                data: {
                    id: (0, uuid_1.v7)(),
                    actorUserId: event.actorUserId,
                    action: event.action,
                    objectType: event.objectType,
                    objectId: event.objectId,
                    metadata: (event.metadata ?? {}),
                    prevHash: prevHash || null,
                    currHash
                }
            });
        }
        catch {
            if (event.sensitive)
                throw new common_1.InternalServerErrorException('Audit chain write failed');
            return null;
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map