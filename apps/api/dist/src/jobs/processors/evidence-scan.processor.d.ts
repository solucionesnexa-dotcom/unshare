import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EvidenceService } from '../../modules/evidence/evidence.service';
export declare class EvidenceScanProcessor extends WorkerHost {
    private readonly evidenceService;
    constructor(evidenceService: EvidenceService);
    process(job: Job<{
        evidenceId: string;
    }>): Promise<{
        evidenceId: string;
        clean: boolean;
    }>;
}
