import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('retention.purge')
export class RetentionPurgeProcessor extends WorkerHost {
  async process(job: Job) { return { ok: true, id: job.id }; }
}
