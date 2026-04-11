import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { RequestUser } from '../../common/types/request-user';
import { CreateFindingDto } from './dto/create-finding.dto';
import { FindingsService } from './findings.service';

@Controller()
@UseGuards(JwtAuthGuard, PolicyGuard)
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Post('cases/:caseId/findings')
  async createFinding(@CurrentUser() user: RequestUser, @Param('caseId') caseId: string, @Body() dto: CreateFindingDto) {
    return this.findingsService.create(user, caseId, dto);
  }

  @Get('findings/:findingId')
  async getFinding(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string) {
    const finding = await this.findingsService.getById(user, findingId);
    if (!finding) throw new NotFoundException('Finding not found');
    return finding;
  }
}
