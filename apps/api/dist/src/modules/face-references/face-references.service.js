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
exports.FaceReferencesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const authorization_service_1 = require("../../common/policies/authorization.service");
const prisma_service_1 = require("../../prisma.service");
const audit_service_1 = require("../audit/audit.service");
const cases_service_1 = require("../cases/cases.service");
let FaceReferencesService = class FaceReferencesService {
    constructor(prisma, casesService, authz, audit) {
        this.prisma = prisma;
        this.casesService = casesService;
        this.authz = authz;
        this.audit = audit;
    }
    async create(user, caseId, dto) {
        const caseRecord = await this.casesService.getById(user, caseId);
        if (!caseRecord)
            throw new common_1.BadRequestException('Case not found or not authorized');
        const minor = await this.prisma.minor.findFirst({
            where: { id: dto.minorId, familyId: user.familyId }
        });
        if (!minor)
            throw new common_1.BadRequestException('Minor not found in user family');
        this.authz.assert(user, 'finding:create', { caseId, familyId: caseRecord.familyId, ownershipType: 'own_content' });
        const record = await this.prisma.faceRepresentation.create({
            data: {
                id: (0, uuid_1.v7)(),
                caseId,
                minorId: dto.minorId,
                referenceType: dto.referenceType,
                normalizedVector: dto.normalizedVector,
                metadata: (dto.metadata ?? {})
            }
        });
        await this.audit.write({
            actorUserId: user.id,
            action: 'face_reference.create',
            objectType: 'face_reference',
            objectId: record.id,
            metadata: { referenceType: record.referenceType, minorId: record.minorId },
            sensitive: true
        });
        return record;
    }
    async listByCase(user, caseId) {
        const caseRecord = await this.casesService.getById(user, caseId);
        if (!caseRecord)
            return [];
        return this.prisma.faceRepresentation.findMany({ where: { caseId } });
    }
};
exports.FaceReferencesService = FaceReferencesService;
exports.FaceReferencesService = FaceReferencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cases_service_1.CasesService,
        authorization_service_1.AuthorizationService,
        audit_service_1.AuditService])
], FaceReferencesService);
//# sourceMappingURL=face-references.service.js.map