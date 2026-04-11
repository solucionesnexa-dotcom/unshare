import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class ActionFollowupProcessor extends WorkerHost {
    process(job: Job): Promise<{
        ok: boolean;
        id: string | undefined;
    }>;
}
