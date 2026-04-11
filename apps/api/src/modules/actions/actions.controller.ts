import { Body, Controller, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { RequestUser } from '../../common/types/request-user';
import { ActionsService } from './actions.service';
import { ApproveActionDto } from './dto/approve-action.dto';
import { CreateActionDto } from './dto/create-action.dto';

import { PolicyResource } from '../../common/decorators/policy-resource.decorator';

@Controller()
@UseGuards(JwtAuthGuard, PolicyGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Post('findings/:findingId/actions/delete-own')
  @PolicyResource('action')
  deleteOwn(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string, @Headers('idempotency-key') key: string) {
    return this.actionsService.create(user, findingId, { actionType: 'delete_own' }, key);
  }

  @Post('findings/:findingId/actions/friendly-request')
  @PolicyResource('action')
  friendly(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string, @Body() dto: CreateActionDto, @Headers('idempotency-key') key: string) {
    return this.actionsService.create(user, findingId, { ...dto, actionType: 'friendly_request' }, key);
  }

  @Post('findings/:findingId/actions/escalate-platform')
  @PolicyResource('action')
  escalate(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string, @Headers('idempotency-key') key: string) {
    return this.actionsService.create(user, findingId, { actionType: 'escalate_platform' }, key);
  }

  @Post('actions/:actionId/approve')
  @PolicyResource('action')
  approve(@CurrentUser() user: RequestUser, @Param('actionId') actionId: string, @Body() dto: ApproveActionDto) {
    return this.actionsService.approve(user, actionId, dto);
  }
}
