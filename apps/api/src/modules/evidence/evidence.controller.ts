import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { PolicyResource } from '../../common/decorators/policy-resource.decorator';
import { RequestUser } from '../../common/types/request-user';
import { EvidenceService } from './evidence.service';
import { MarkUploadedDto } from './dto/mark-uploaded.dto';

@Controller()
@UseGuards(JwtAuthGuard, PolicyGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post('findings/:findingId/evidence/upload-url')
  @PolicyResource('evidence')
  async createUpload(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string) {
    return this.evidenceService.createUploadUrl(user, findingId);
  }

  @Post('findings/:findingId/evidence')
  @PolicyResource('evidence')
  async completeUpload(@Param('findingId') _findingId: string, @Body() body: MarkUploadedDto) {
    return this.evidenceService.markUploaded(body.evidenceId, body.sha256, body.mimeType);
  }

  @Get('findings/:findingId/evidence')
  @PolicyResource('evidence')
  async listEvidence(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string) {
    return this.evidenceService.listByFinding(user, findingId);
  }

  @Get('evidence/:evidenceId/download-url')
  @PolicyResource('evidence')
  async downloadUrl(@CurrentUser() user: RequestUser, @Param('evidenceId') evidenceId: string) {
    return this.evidenceService.getDownloadUrl(user, evidenceId);
  }
}
