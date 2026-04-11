import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { RequestUser } from '../../common/types/request-user';
import { EvidenceService } from './evidence.service';

@Controller()
@UseGuards(JwtAuthGuard, PolicyGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post('findings/:findingId/evidence/upload-url')
  async createUpload(@CurrentUser() user: RequestUser, @Param('findingId') findingId: string) {
    return this.evidenceService.createUploadUrl(user, findingId);
  }

  @Post('findings/:findingId/evidence')
  completeUpload(@Param('findingId') _findingId: string, @Body() body: { evidenceId: string; sha256: string; mimeType?: string }) {
    return this.evidenceService.markUploaded(body.evidenceId, body.sha256, body.mimeType);
  }

  @Get('evidence/:evidenceId/download-url')
  async downloadUrl(@CurrentUser() user: RequestUser, @Param('evidenceId') evidenceId: string) {
    return this.evidenceService.getDownloadUrl(user, evidenceId);
  }
}
