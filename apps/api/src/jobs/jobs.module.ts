import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EvidenceScanProcessor } from './processors/evidence-scan.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { SlaReminderProcessor } from './processors/sla-reminder.processor';
import { ActionFollowupProcessor } from './processors/action-followup.processor';
import { RetentionPurgeProcessor } from './processors/retention-purge.processor';
import { EvidenceModule } from '../modules/evidence/evidence.module';

@Module({
  imports: [EvidenceModule,
    BullModule.registerQueue(
      { name: 'evidence.scan' },
      { name: 'notifications.send' },
      { name: 'case.sla.reminder' },
      { name: 'action.followup' },
      { name: 'retention.purge' }
    )
  ],
  providers: [EvidenceScanProcessor, NotificationsProcessor, SlaReminderProcessor, ActionFollowupProcessor, RetentionPurgeProcessor]
})
export class JobsModule {}
