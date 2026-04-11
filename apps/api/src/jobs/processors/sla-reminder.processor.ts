import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('case.sla.reminder')
export class SlaReminderProcessor extends WorkerHost {
  async process(job: Job) { return { ok: true, id: job.id }; }
}
