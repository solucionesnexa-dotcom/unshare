import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EvidenceService } from '../../modules/evidence/evidence.service';

@Processor('evidence.scan')
export class EvidenceScanProcessor extends WorkerHost {
  constructor(private readonly evidenceService: EvidenceService) {
    super();
  }

  async process(job: Job<{ evidenceId: string }>) {
    // MVP: assume clean=true. Replace with real AV integration in next increment.
    await this.evidenceService.setScanResult(job.data.evidenceId, true);
    return { evidenceId: job.data.evidenceId, clean: true };
  }
}
