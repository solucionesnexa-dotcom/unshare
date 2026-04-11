import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCaseDto } from './dto/create-case.dto';

@Injectable()
export class CasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthorizationService,
    private readonly audit: AuditService
  ) {}

  async create(user: RequestUser, dto: CreateCaseDto) {
    this.authz.assert(user, 'case:create', { familyId: dto.familyId });

    const record = await this.prisma.case.create({
      data: {
        id: uuidv7(),
        familyId: dto.familyId,
        primaryGuardianId: dto.primaryGuardianId,
        summary: dto.summary,
        priority: dto.priority,
        status: 'open'
      }
    });

    await this.audit.write({ actorUserId: user.id, action: 'case.create', objectType: 'case', objectId: record.id, sensitive: true });
    return record;
  }

  async getById(user: RequestUser, caseId: string) {
    const record = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!record) return null;
    this.authz.assert(user, 'case:read', { familyId: record.familyId, caseId: record.id });
    return record;
  }
}
