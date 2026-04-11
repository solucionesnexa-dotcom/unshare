import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('action.followup')
export class ActionFollowupProcessor extends WorkerHost {
  async process(job: Job) { return { ok: true, id: job.id }; }
}
