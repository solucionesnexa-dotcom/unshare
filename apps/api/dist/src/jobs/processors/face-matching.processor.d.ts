import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../modules/audit/audit.service';
export declare class FaceMatchingProcessor extends WorkerHost {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    process(job: Job<{
        findingId: string;
    }>): Promise<{
        ok: boolean;
        reason: string;
        findingId?: undefined;
    } | {
        ok: boolean;
        findingId: string;
        reason?: undefined;
    }>;
}
