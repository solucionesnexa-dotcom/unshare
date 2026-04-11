import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { FindingsModule } from '../findings/findings.module';
import { AuditModule } from '../audit/audit.module';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';

@Module({ imports: [IamModule, FindingsModule, AuditModule], controllers: [ActionsController], providers: [ActionsService] })
export class ActionsModule {}
