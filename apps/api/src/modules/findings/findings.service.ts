import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { CasesService } from '../cases/cases.service';
import { AuditService } from '../audit/audit.service';
import { CreateFindingDto } from './dto/create-finding.dto';

@Injectable()
export class FindingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly casesService: CasesService,
    private readonly authz: AuthorizationService,
    private readonly audit: AuditService
  ) {}

  async create(user: RequestUser, caseId: string, dto: CreateFindingDto) {
    const caseRecord = await this.casesService.getById(user, caseId);
    if (!caseRecord) throw new Error('Case not found or not authorized');

    // Validar que el minorId pertenece a la familia del usuario
    const minor = await this.prisma.minor.findFirst({
      where: { id: dto.minorId, familyId: user.familyId }
    });
    if (!minor) throw new Error('Minor not in user family or not found');

    this.authz.assert(user, 'finding:create', { caseId, familyId: caseRecord.familyId, ownershipType: dto.ownershipType });
    const fingerprint = createHash('sha256').update(dto.url).digest('hex');

    const record = await this.prisma.finding.create({
      data: {
        id: uuidv7(),
        caseId,
        minorId: dto.minorId,
        url: dto.url,
        urlFingerprint: fingerprint,
        platform: dto.platform,
        ownershipType: dto.ownershipType,
        riskScore: dto.riskScore,
        status: 'detected'
      }
    });

    await this.audit.write({ actorUserId: user.id, action: 'finding.create', objectType: 'finding', objectId: record.id, metadata: { fingerprint }, sensitive: true });
    return record;
  }

  async getById(user: RequestUser, findingId: string) {
    const finding = await this.prisma.finding.findUnique({ where: { id: findingId } });
    if (!finding) return null;

    const caseRecord = await this.casesService.getById(user, finding.caseId);
    if (!caseRecord) return null;

    this.authz.assert(user, 'finding:read', { caseId: finding.caseId, familyId: caseRecord.familyId, ownershipType: finding.ownershipType });

    if (user.role === 'collaborator_limited') {
      return {
        id: finding.id,
        url: finding.url.replace(/^https?:\/\//, ''),
        platform: finding.platform,
        status: finding.status,
        recommendedAction: 'delete_own'
      };
    }

    return finding;
  }
}
