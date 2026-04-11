import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { CasesModule } from '../cases/cases.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { FaceReferencesController } from './face-references.controller';
import { FaceReferencesService } from './face-references.service';

@Module({
  imports: [IamModule, CasesModule, AuditModule, AuthModule],
  controllers: [FaceReferencesController],
  providers: [FaceReferencesService],
  exports: [FaceReferencesService]
})
export class FaceReferencesModule {}
