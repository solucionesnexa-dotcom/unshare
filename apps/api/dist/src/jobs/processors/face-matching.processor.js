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
exports.FaceMatchingProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const audit_service_1 = require("../../modules/audit/audit.service");
let FaceMatchingProcessor = class FaceMatchingProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, audit) {
        super();
        this.prisma = prisma;
        this.audit = audit;
    }
    async process(job) {
        const findingId = job.data.findingId;
        const finding = await this.prisma.finding.findUnique({ where: { id: findingId } });
        if (!finding)
            return { ok: false, reason: 'Finding not found' };
        await this.prisma.finding.update({
            where: { id: findingId },
            data: {
                matchingMetadata: {
                    processedAt: new Date().toISOString(),
                    processor: 'face.match',
                    note: 'Face matching job completed. This is a stub for phase 2.'
                }
            }
        });
        await this.audit.write({
            action: 'finding.matching.processed',
            objectType: 'finding',
            objectId: findingId,
            metadata: { jobId: job.id, queue: job.queueName },
            sensitive: false
        });
        return { ok: true, findingId };
    }
};
exports.FaceMatchingProcessor = FaceMatchingProcessor;
exports.FaceMatchingProcessor = FaceMatchingProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)('face.match'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], FaceMatchingProcessor);
//# sourceMappingURL=face-matching.processor.js.map