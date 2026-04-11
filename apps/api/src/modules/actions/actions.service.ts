import { BadRequestException, Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { FindingsService } from '../findings/findings.service';
import { AuditService } from '../audit/audit.service';
import { CreateActionDto } from './dto/create-action.dto';
import { ApproveActionDto } from './dto/approve-action.dto';

@Injectable()
export class ActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findingsService: FindingsService,
    private readonly authz: AuthorizationService,
    private readonly audit: AuditService
  ) {}

  async create(user: RequestUser, findingId: string, dto: CreateActionDto, idempotencyKey: string) {
    if (!idempotencyKey) throw new BadRequestException('Idempotency key required');

    const finding = (await this.findingsService.getById(user, findingId)) as any;
    if (!finding) throw new BadRequestException('Finding not found');

    this.authz.assert(user, 'action:create', { caseId: finding.caseId, ownershipType: finding.ownershipType });

    if (dto.actionType === 'escalate_platform') {
      const availableEvidence = await this.prisma.findingEvidence.count({ where: { findingId, status: 'available' } });
      if (availableEvidence < 1) throw new BadRequestException('Escalation requires at least one available evidence');
    }

    const existing = await this.prisma.action.findUnique({ where: { idempotencyKey } });
    if (existing) return existing;

    const requiresApproval = this.computeApproval(dto.actionType, finding.ownershipType, user.role, Boolean(dto.bulk));
    const record = await this.prisma.action.create({
      data: {
        id: uuidv7(),
        caseId: finding.caseId,
        findingId,
        actionType: dto.actionType,
        requiresApproval,
        status: requiresApproval ? 'pending_approval' : 'sent',
        idempotencyKey,
        payload: { customMessage: dto.customMessage ?? null },
        preparedBy: user.id
      }
    });

    await this.audit.write({ actorUserId: user.id, action: 'action.create', objectType: 'action', objectId: record.id, sensitive: true });
    return record;
  }

  async approve(user: RequestUser, actionId: string, dto: ApproveActionDto) {
    const action = await this.prisma.action.findUnique({ where: { id: actionId } });
    if (!action) throw new BadRequestException('Action not found');

    this.authz.assert(user, 'action:approve', { caseId: action.caseId });

    const updated = await this.prisma.action.update({
      where: { id: action.id },
      data: { status: dto.decision === 'approve' ? 'approved' : 'cancelled' }
    });

    await this.prisma.actionApproval.create({
      data: {
        id: uuidv7(),
        actionId: action.id,
        approverId: user.id,
        decision: dto.decision,
        reason: dto.reason
      }
    });

    await this.audit.write({ actorUserId: user.id, action: 'action.approve', objectType: 'action', objectId: action.id, sensitive: true });
    return updated;
  }

  private computeApproval(type: CreateActionDto['actionType'], ownershipType: string, role: string, bulk: boolean) {
    if (type === 'escalate_platform') return true;
    if (type === 'friendly_request') return true;
    if (['delete_own', 'archive_own', 'privatize_own'].includes(type)) {
      if (bulk) return true;
      return !(role === 'guardian' && ownershipType === 'own_content');
    }
    return true;
  }
}
