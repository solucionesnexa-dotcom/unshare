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
exports.EvidenceService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const authorization_service_1 = require("../../common/policies/authorization.service");
const prisma_service_1 = require("../../prisma.service");
const findings_service_1 = require("../findings/findings.service");
const minio_signer_service_1 = require("./minio-signer.service");
let EvidenceService = class EvidenceService {
    constructor(prisma, findingsService, authz, minioSigner, evidenceScanQueue) {
        this.prisma = prisma;
        this.findingsService = findingsService;
        this.authz = authz;
        this.minioSigner = minioSigner;
        this.evidenceScanQueue = evidenceScanQueue;
    }
    async createUploadUrl(user, findingId) {
        const finding = await this.findingsService.getById(user, findingId);
        if (!finding)
            throw new common_1.BadRequestException('Finding not found');
        const evidenceId = (0, uuid_1.v7)();
        const objectKey = `evidence/${findingId}/${evidenceId}.bin`;
        await this.prisma.findingEvidence.create({
            data: {
                id: evidenceId,
                findingId,
                objectKey,
                sha256: ''.padEnd(64, '0'),
                mimeType: 'application/octet-stream',
                status: 'uploaded_pending_scan',
                capturedBy: user.id
            }
        });
        return { evidenceId, uploadUrl: this.minioSigner.signUpload(objectKey, 300), expiresInSeconds: 300 };
    }
    async markUploaded(evidenceId, sha256, mimeType) {
        const evidence = await this.prisma.findingEvidence.findUnique({ where: { id: evidenceId } });
        if (!evidence)
            throw new common_1.BadRequestException('Evidence not found');
        const updated = await this.prisma.findingEvidence.update({
            where: { id: evidenceId },
            data: { sha256, mimeType: mimeType || evidence.mimeType, status: 'uploaded_pending_scan' }
        });
        await this.evidenceScanQueue.add('scan', { evidenceId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
        return updated;
    }
    async setScanResult(evidenceId, clean) {
        await this.prisma.findingEvidence.update({ where: { id: evidenceId }, data: { status: clean ? 'available' : 'quarantined' } });
    }
    async listByFinding(user, findingId) {
        const finding = await this.findingsService.getById(user, findingId);
        if (!finding)
            throw new common_1.BadRequestException('Finding not found');
        const evidence = await this.prisma.findingEvidence.findMany({ where: { findingId } });
        return evidence;
    }
    async getDownloadUrl(user, evidenceId) {
        const evidence = await this.prisma.findingEvidence.findUnique({ where: { id: evidenceId } });
        if (!evidence)
            throw new common_1.BadRequestException('Evidence not found');
        const finding = await this.prisma.finding.findUnique({ where: { id: evidence.findingId } });
        if (!finding)
            throw new common_1.BadRequestException('Finding not found');
        this.authz.assert(user, 'evidence:download', { caseId: finding.caseId, ownershipType: finding.ownershipType });
        if (evidence.status !== 'available')
            throw new common_1.BadRequestException('Evidence not available');
        return { downloadUrl: this.minioSigner.signDownload(evidence.objectKey, 300), expiresInSeconds: 300 };
    }
};
exports.EvidenceService = EvidenceService;
exports.EvidenceService = EvidenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, bullmq_2.InjectQueue)('evidence.scan')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        findings_service_1.FindingsService,
        authorization_service_1.AuthorizationService,
        minio_signer_service_1.MinioSignerService,
        bullmq_1.Queue])
], EvidenceService);
//# sourceMappingURL=evidence.service.js.map