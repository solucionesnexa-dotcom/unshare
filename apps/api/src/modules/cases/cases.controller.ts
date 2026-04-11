import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { PolicyResource } from '../../common/decorators/policy-resource.decorator';
import { RequestUser } from '../../common/types/request-user';
import { CreateCaseDto } from './dto/create-case.dto';
import { CasesService } from './cases.service';

@Controller('cases')
@UseGuards(JwtAuthGuard, PolicyGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @PolicyResource('case')
  async createCase(@CurrentUser() user: RequestUser, @Body() dto: CreateCaseDto) {
    return this.casesService.create(user, dto);
  }

  @Get(':caseId')
  @PolicyResource('case')
  async getCase(@CurrentUser() user: RequestUser, @Param('caseId') caseId: string) {
    const c = await this.casesService.getById(user, caseId);
    if (!c) throw new NotFoundException('Case not found');
    return c;
  }
}
