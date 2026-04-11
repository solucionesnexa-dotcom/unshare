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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindingsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const authorization_service_1 = require("../../common/policies/authorization.service");
const prisma_service_1 = require("../../prisma.service");
const cases_service_1 = require("../cases/cases.service");
const audit_service_1 = require("../audit/audit.service");
const face_matching_service_1 = require("./face-matching.service");
let FindingsService = class FindingsService {
    constructor(prisma, casesService, authz, audit, faceMatchingService, faceMatchQueue) {
        this.prisma = prisma;
        this.casesService = casesService;
        this.authz = authz;
        this.audit = audit;
        this.faceMatchingService = faceMatchingService;
        this.faceMatchQueue = faceMatchQueue;
    }
    async create(user, caseId, dto) {
        const caseRecord = await this.casesService.getById(user, caseId);
        if (!caseRecord)
            throw new Error('Case not found or not authorized');
        const minor = await this.prisma.minor.findFirst({
            where: { id: dto.minorId, familyId: user.familyId }
        });
        if (!minor)
            throw new Error('Minor not in user family or not found');
        this.authz.assert(user, 'finding:create', { caseId, familyId: caseRecord.familyId, ownershipType: dto.ownershipType });
        const fingerprint = (0, crypto_1.createHash)('sha256').update(dto.url).digest('hex');
        const record = await this.prisma.finding.create({
            data: {
                id: (0, uuid_1.v7)(),
                caseId,
                minorId: dto.minorId,
                url: dto.url,
                urlFingerprint: fingerprint,
                platform: dto.platform,
                ownershipType: dto.ownershipType,
                riskScore: dto.riskScore,
                matchScore: dto.matchScore ?? undefined,
                confidenceScore: dto.confidenceScore ?? undefined,
                duplicateGroupId: dto.duplicateGroupId ?? undefined,
                sourceType: dto.sourceType ?? undefined,
                sourceUrl: dto.sourceUrl ?? undefined,
                matchingMetadata: dto.matchingMetadata ? dto.matchingMetadata : undefined,
                status: 'detected'
            }
        });
        await this.audit.write({
            actorUserId: user.id,
            action: 'finding.create',
            objectType: 'finding',
            objectId: record.id,
            metadata: { fingerprint, sourceType: record.sourceType, matchScore: record.matchScore },
            sensitive: true
        });
        return record;
    }
    async scan(user, caseId, dto) {
        const caseRecord = await this.casesService.getById(user, caseId);
        if (!caseRecord)
            throw new Error('Case not found or not authorized');
        let reference = null;
        if (dto.faceReferenceId) {
            reference = await this.prisma.faceRepresentation.findUnique({ where: { id: dto.faceReferenceId } });
            if (!reference || reference.caseId !== caseId)
                throw new Error('Face reference not found');
        }
        let minorId;
        if (reference) {
            minorId = reference.minorId;
        }
        else if (dto.nameQuery) {
            const normalized = dto.nameQuery.trim().toLowerCase();
            const minors = await this.prisma.minor.findMany({ where: { familyId: user.familyId } });
            const minor = minors.find((m) => Array.isArray(m.aliasesJson) && m.aliasesJson.some((alias) => String(alias).toLowerCase().includes(normalized)));
            if (!minor)
                throw new Error('Minor not found for name query');
            minorId = minor.id;
        }
        else {
            throw new Error('Either faceReferenceId or nameQuery is required');
        }
        const platform = dto.platform ?? 'Instagram';
        const sourceType = reference ? 'image_reference' : 'name_reference';
        const sourceUrl = `https://public.${platform.toLowerCase()}.example.com/${caseId}/${Date.now()}`;
        const referencePayload = {
            normalizedVector: reference ? reference.normalizedVector : [],
            metadata: reference ? reference.metadata : { nameQuery: dto.nameQuery }
        };
        const candidate = {
            url: sourceUrl,
            platform,
            sourceType,
            normalizedVector: reference ? reference.normalizedVector : undefined
        };
        const scoring = this.faceMatchingService.scoreCandidate(referencePayload, candidate);
        const created = await this.create(user, caseId, {
            minorId,
            url: sourceUrl,
            platform,
            ownershipType: 'search_result',
            riskScore: Math.max(0, Math.min(100, scoring.matchScore)),
            matchScore: scoring.matchScore,
            confidenceScore: scoring.confidenceScore,
            sourceType,
            sourceUrl,
            matchingMetadata: {
                referenceId: dto.faceReferenceId ?? null,
                nameQuery: dto.nameQuery ?? null,
                explanation: scoring.explanation
            }
        });
        await this.faceMatchQueue.add('match', { findingId: created.id }, { attempts: 1, backoff: { type: 'fixed', delay: 1000 } });
        return created;
    }
    async listByCase(user, caseId) {
        const caseRecord = await this.casesService.getById(user, caseId);
        if (!caseRecord)
            return [];
        const findings = await this.prisma.finding.findMany({ where: { caseId } });
        const enriched = await Promise.all(findings.map(async (finding) => {
            const minor = await this.prisma.minor.findUnique({ where: { id: finding.minorId } });
            return {
                id: finding.id,
                caseId: finding.caseId,
                minorId: finding.minorId,
                url: finding.url,
                platform: finding.platform,
                ownershipType: finding.ownershipType,
                riskScore: finding.riskScore,
                matchScore: finding.matchScore,
                confidenceScore: finding.confidenceScore,
                duplicateGroupId: finding.duplicateGroupId,
                sourceType: finding.sourceType,
                sourceUrl: finding.sourceUrl,
                status: finding.status,
                createdAt: finding.createdAt,
                childName: minor && Array.isArray(minor.aliasesJson) && minor.aliasesJson.length > 0 ? minor.aliasesJson[0] : undefined,
                aliases: minor?.aliasesJson,
                matchingMetadata: finding.matchingMetadata
            };
        }));
        return enriched;
    }
    async getById(user, findingId) {
        const finding = await this.prisma.finding.findUnique({ where: { id: findingId } });
        if (!finding)
            return null;
        const caseRecord = await this.casesService.getById(user, finding.caseId);
        if (!caseRecord)
            return null;
        this.authz.assert(user, 'finding:read', { caseId: finding.caseId, familyId: caseRecord.familyId, ownershipType: finding.ownershipType });
        if (user.role === 'collaborator_limited') {
            return {
                id: finding.id,
                url: finding.url.replace(/^https?:\/\//, ''),
                platform: finding.platform,
                status: finding.status,
                recommendedAction: 'delete_own'
            };
        }
        return finding;
    }
};
exports.FindingsService = FindingsService;
exports.FindingsService = FindingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, bullmq_2.InjectQueue)('face.match')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cases_service_1.CasesService,
        authorization_service_1.AuthorizationService,
        audit_service_1.AuditService,
        face_matching_service_1.FaceMatchingService,
        bullmq_1.Queue])
], FindingsService);
//# sourceMappingURL=findings.service.js.map