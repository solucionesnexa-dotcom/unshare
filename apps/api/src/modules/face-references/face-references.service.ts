import { Injectable, BadRequestException } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CasesService } from '../cases/cases.service';
import { CreateFaceReferenceDto } from './dto/create-face-reference.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaceReferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly casesService: CasesService,
    private readonly authz: AuthorizationService,
    private readonly audit: AuditService
  ) {}

  async create(user: RequestUser, caseId: string, dto: CreateFaceReferenceDto) {
    const caseRecord = await this.casesService.getById(user, caseId);
    if (!caseRecord) throw new BadRequestException('Case not found or not authorized');

    const minor = await this.prisma.minor.findFirst({
      where: { id: dto.minorId, familyId: user.familyId }
    });
    if (!minor) throw new BadRequestException('Minor not found in user family');

    this.authz.assert(user, 'finding:create', { caseId, familyId: caseRecord.familyId, ownershipType: 'own_content' });

    const record = await this.prisma.faceRepresentation.create({
      data: {
        id: uuidv7(),
        caseId,
        minorId: dto.minorId,
        referenceType: dto.referenceType,
        normalizedVector: dto.normalizedVector as Prisma.InputJsonValue,
        metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue
      }
    });

    await this.audit.write({
      actorUserId: user.id,
      action: 'face_reference.create',
      objectType: 'face_reference',
      objectId: record.id,
      metadata: { referenceType: record.referenceType, minorId: record.minorId },
      sensitive: true
    });

    return record;
  }

  async listByCase(user: RequestUser, caseId: string) {
    const caseRecord = await this.casesService.getById(user, caseId);
    if (!caseRecord) return [];

    return this.prisma.faceRepresentation.findMany({ where: { caseId } });
  }
}
