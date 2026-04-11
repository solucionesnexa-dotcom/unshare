import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('notifications.send')
export class NotificationsProcessor extends WorkerHost {
  async process(job: Job) { return { ok: true, id: job.id }; }
}
