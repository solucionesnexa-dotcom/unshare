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
exports.CasesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const authorization_service_1 = require("../../common/policies/authorization.service");
const prisma_service_1 = require("../../prisma.service");
const audit_service_1 = require("../audit/audit.service");
let CasesService = class CasesService {
    constructor(prisma, authz, audit) {
        this.prisma = prisma;
        this.authz = authz;
        this.audit = audit;
    }
    async create(user, dto) {
        this.authz.assert(user, 'case:create', { familyId: dto.familyId });
        const record = await this.prisma.case.create({
            data: {
                id: (0, uuid_1.v7)(),
                familyId: dto.familyId,
                primaryGuardianId: dto.primaryGuardianId,
                summary: dto.summary,
                priority: dto.priority,
                status: 'open'
            }
        });
        await this.audit.write({ actorUserId: user.id, action: 'case.create', objectType: 'case', objectId: record.id, sensitive: true });
        return record;
    }
    async getById(user, caseId) {
        const record = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!record)
            return null;
        this.authz.assert(user, 'case:read', { familyId: record.familyId, caseId: record.id });
        return record;
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        authorization_service_1.AuthorizationService,
        audit_service_1.AuditService])
], CasesService);
//# sourceMappingURL=cases.service.js.map