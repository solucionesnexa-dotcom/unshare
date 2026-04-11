import { Module } from '@nestjs/common';
import { AuthorizationService } from '../../common/policies/authorization.service';

@Module({ providers: [AuthorizationService], exports: [AuthorizationService] })
export class IamModule {}
