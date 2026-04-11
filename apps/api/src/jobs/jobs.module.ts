import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EvidenceScanProcessor } from './processors/evidence-scan.processor';
import { NotificationsProcessor } from './processors/notifications.processor';
import { SlaReminderProcessor } from './processors/sla-reminder.processor';
import { ActionFollowupProcessor } from './processors/action-followup.processor';
import { RetentionPurgeProcessor } from './processors/retention-purge.processor';
import { FaceMatchingProcessor } from './processors/face-matching.processor';
import { EvidenceModule } from '../modules/evidence/evidence.module';
import { AuditModule } from '../modules/audit/audit.module';

@Module({
  imports: [
    EvidenceModule,
    AuditModule,
    BullModule.registerQueue(
      { name: 'evidence.scan' },
      { name: 'notifications.send' },
      { name: 'case.sla.reminder' },
      { name: 'action.followup' },
      { name: 'retention.purge' },
      { name: 'face.match' }
    )
  ],
  providers: [EvidenceScanProcessor, NotificationsProcessor, SlaReminderProcessor, ActionFollowupProcessor, RetentionPurgeProcessor, FaceMatchingProcessor]
})
export class JobsModule {}
