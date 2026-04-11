import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PolicyGuard } from '../../common/guards/policy.guard';
import { PolicyResource } from '../../common/decorators/policy-resource.decorator';
import { RequestUser } from '../../common/types/request-user';
import { CreateFaceReferenceDto } from './dto/create-face-reference.dto';
import { FaceReferencesService } from './face-references.service';

@Controller()
@UseGuards(JwtAuthGuard, PolicyGuard)
export class FaceReferencesController {
  constructor(private readonly faceReferencesService: FaceReferencesService) {}

  @Post('cases/:caseId/face-references')
  @PolicyResource('finding')
  async createReference(
    @CurrentUser() user: RequestUser,
    @Param('caseId') caseId: string,
    @Body() dto: CreateFaceReferenceDto
  ) {
    return this.faceReferencesService.create(user, caseId, dto);
  }

  @Get('cases/:caseId/face-references')
  @PolicyResource('finding')
  async listReferences(@CurrentUser() user: RequestUser, @Param('caseId') caseId: string) {
    return this.faceReferencesService.listByCase(user, caseId);
  }
}
