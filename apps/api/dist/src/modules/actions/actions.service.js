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
exports.ActionsService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const authorization_service_1 = require("../../common/policies/authorization.service");
const prisma_service_1 = require("../../prisma.service");
const findings_service_1 = require("../findings/findings.service");
const audit_service_1 = require("../audit/audit.service");
let ActionsService = class ActionsService {
    constructor(prisma, findingsService, authz, audit) {
        this.prisma = prisma;
        this.findingsService = findingsService;
        this.authz = authz;
        this.audit = audit;
    }
    async create(user, findingId, dto, idempotencyKey) {
        if (!idempotencyKey)
            throw new common_1.BadRequestException('Idempotency key required');
        const finding = await this.findingsService.getById(user, findingId);
        if (!finding)
            throw new common_1.BadRequestException('Finding not found');
        if (!('caseId' in finding) || !('ownershipType' in finding))
            throw new common_1.BadRequestException('Finding missing required fields');
        this.authz.assert(user, 'action:create', { caseId: finding.caseId, ownershipType: finding.ownershipType });
        if (dto.actionType === 'escalate_platform') {
            const availableEvidence = await this.prisma.findingEvidence.count({ where: { findingId, status: 'available' } });
            if (availableEvidence < 1)
                throw new common_1.BadRequestException('Escalation requires at least one available evidence');
        }
        const existing = await this.prisma.action.findUnique({ where: { idempotencyKey } });
        if (existing)
            return existing;
        const requiresApproval = this.computeApproval(dto.actionType, finding.ownershipType, user.role, Boolean(dto.bulk));
        const record = await this.prisma.action.create({
            data: {
                id: (0, uuid_1.v7)(),
                caseId: finding.caseId,
                findingId,
                actionType: dto.actionType,
                requiresApproval,
                status: requiresApproval ? 'pending_approval' : 'sent',
                idempotencyKey,
                payload: { customMessage: dto.customMessage ?? null },
                preparedBy: user.id
            }
        });
        await this.audit.write({ actorUserId: user.id, action: 'action.create', objectType: 'action', objectId: record.id, sensitive: true });
        return record;
    }
    async approve(user, actionId, dto) {
        const action = await this.prisma.action.findUnique({ where: { id: actionId } });
        if (!action)
            throw new common_1.BadRequestException('Action not found');
        this.authz.assert(user, 'action:approve', { caseId: action.caseId });
        const updated = await this.prisma.action.update({
            where: { id: action.id },
            data: { status: dto.decision === 'approve' ? 'approved' : 'cancelled' }
        });
        await this.prisma.actionApproval.create({
            data: {
                id: (0, uuid_1.v7)(),
                actionId: action.id,
                approverId: user.id,
                decision: dto.decision,
                reason: dto.reason
            }
        });
        await this.audit.write({ actorUserId: user.id, action: 'action.approve', objectType: 'action', objectId: action.id, sensitive: true });
        return updated;
    }
    computeApproval(type, ownershipType, role, bulk) {
        if (type === 'escalate_platform')
            return true;
        if (type === 'friendly_request')
            return true;
        if (['delete_own', 'archive_own', 'privatize_own'].includes(type)) {
            if (bulk)
                return true;
            return !(role === 'guardian' && ownershipType === 'own_content');
        }
        return true;
    }
};
exports.ActionsService = ActionsService;
exports.ActionsService = ActionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        findings_service_1.FindingsService,
        authorization_service_1.AuthorizationService,
        audit_service_1.AuditService])
], ActionsService);
//# sourceMappingURL=actions.service.js.map