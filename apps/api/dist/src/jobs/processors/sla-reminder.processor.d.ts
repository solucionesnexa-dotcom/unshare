import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class SlaReminderProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job): Promise<{
        ok: boolean;
        id: string | undefined;
        status: string;
    }>;
}
