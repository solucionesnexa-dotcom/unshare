import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IamModule } from '../iam/iam.module';
import { FindingsModule } from '../findings/findings.module';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { MinioSignerService } from './minio-signer.service';

@Module({
  imports: [IamModule, FindingsModule, BullModule.registerQueue({ name: 'evidence.scan' })],
  controllers: [EvidenceController],
  providers: [EvidenceService, MinioSignerService],
  exports: [EvidenceService]
})
export class EvidenceModule {}
