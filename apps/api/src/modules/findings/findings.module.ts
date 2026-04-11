import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { CasesModule } from '../cases/cases.module';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { FindingsController } from './findings.controller';
import { FindingsService } from './findings.service';

@Module({ imports: [IamModule, CasesModule, AuditModule, AuthModule], controllers: [FindingsController], providers: [FindingsService], exports: [FindingsService] })
export class FindingsModule {}
