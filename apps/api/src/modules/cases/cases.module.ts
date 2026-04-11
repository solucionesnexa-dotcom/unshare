import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';

@Module({ imports: [IamModule, AuditModule, AuthModule], controllers: [CasesController], providers: [CasesService], exports: [CasesService] })
export class CasesModule {}
