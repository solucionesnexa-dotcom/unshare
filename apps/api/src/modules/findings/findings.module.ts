import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IamModule } from '../iam/iam.module';
import { CasesModule } from '../cases/cases.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { FindingsController } from './findings.controller';
import { FindingsService } from './findings.service';
import { FaceMatchingService } from './face-matching.service';

@Module({
  imports: [IamModule, CasesModule, AuditModule, AuthModule, BullModule.registerQueue({ name: 'face.match' })],
  controllers: [FindingsController],
  providers: [FindingsService, FaceMatchingService],
  exports: [FindingsService]
})
export class FindingsModule {}
