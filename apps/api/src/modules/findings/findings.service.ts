import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';
import { CasesService } from '../cases/cases.service';
import { AuditService } from '../audit/audit.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { ScanFindingsDto } from './dto/scan-findings.dto';
import { FaceMatchingService } from './face-matching.service';

@Injectable()
export class FindingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly casesService: CasesService,
    private readonly authz: AuthorizationService,
    private readonly audit: AuditService,
    private readonly faceMatchingService: FaceMatchingService,
    @InjectQueue('face.match') private readonly faceMatchQueue: Queue
  ) {}

  async create(user: RequestUser, caseId: string, dto: CreateFindingDto) {
    const caseRecord = await this.casesService.getById(user, caseId);
    if (!caseRecord) throw new Error('Case not found or not authorized');

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
        matchScore: dto.matchScore ?? undefined,
        confidenceScore: dto.confidenceScore ?? undefined,
        duplicateGroupId: dto.duplicateGroupId ?? undefined,
        sourceType: dto.sourceType ?? undefined,
        sourceUrl: dto.sourceUrl ?? undefined,
        matchingMetadata: dto.matchingMetadata ? (dto.matchingMetadata as Prisma.InputJsonValue) : undefined,
        status: 'detected'
      }
    });

    await this.audit.write({
      actorUserId: user.id,
      action: 'finding.create',
      objectType: 'finding',
      objectId: record.id,
      metadata: { fingerprint, sourceType: record.sourceType, matchScore: record.matchScore },
      sensitive: true
    });
    return record;
  }

  async scan(user: RequestUser, caseId: string, dto: ScanFindingsDto) {
    const caseRecord = await this.casesService.getById(user, caseId);
    if (!caseRecord) throw new Error('Case not found or not authorized');

    let reference = null;
    if (dto.faceReferenceId) {
      reference = await this.prisma.faceRepresentation.findUnique({ where: { id: dto.faceReferenceId } });
      if (!reference || reference.caseId !== caseId) throw new Error('Face reference not found');
    }

    let minorId: string;
    if (reference) {
      minorId = reference.minorId;
    } else if (dto.nameQuery) {
      const normalized = dto.nameQuery.trim().toLowerCase();
      const minors = await this.prisma.minor.findMany({ where: { familyId: user.familyId } });
      const minor = minors.find((m) =>
        Array.isArray(m.aliasesJson) && m.aliasesJson.some((alias) => String(alias).toLowerCase().includes(normalized))
      );
      if (!minor) throw new Error('Minor not found for name query');
      minorId = minor.id;
    } else {
      throw new Error('Either faceReferenceId or nameQuery is required');
    }

    const platform = dto.platform ?? 'Instagram';
    const sourceType = reference ? 'image_reference' : 'name_reference';
    const sourceUrl = `https://public.${platform.toLowerCase()}.example.com/${caseId}/${Date.now()}`;
    const referencePayload = {
      normalizedVector: reference ? (reference.normalizedVector as number[]) : [],
      metadata: reference ? (reference.metadata as Record<string, unknown>) : { nameQuery: dto.nameQuery }
    };
    const candidate = {
      url: sourceUrl,
      platform,
      sourceType,
      normalizedVector: reference ? (reference.normalizedVector as number[]) : undefined
    };

    const scoring = this.faceMatchingService.scoreCandidate(referencePayload, candidate);
    const created = await this.create(user, caseId, {
      minorId,
      url: sourceUrl,
      platform,
      ownershipType: 'search_result',
      riskScore: Math.max(0, Math.min(100, scoring.matchScore)),
      matchScore: scoring.matchScore,
      confidenceScore: scoring.confidenceScore,
      sourceType,
      sourceUrl,
      matchingMetadata: {
        referenceId: dto.faceReferenceId ?? null,
        nameQuery: dto.nameQuery ?? null,
        explanation: scoring.explanation
      }
    } as CreateFindingDto);

    await this.faceMatchQueue.add('match', { findingId: created.id }, { attempts: 1, backoff: { type: 'fixed', delay: 1000 } });
    return created;
  }

  async listByCase(user: RequestUser, caseId: string) {
    const caseRecord = await this.casesService.getById(user, caseId);
    if (!caseRecord) return [];

    const findings = await this.prisma.finding.findMany({ where: { caseId } });
    const enriched = await Promise.all(
      findings.map(async (finding) => {
        const minor = await this.prisma.minor.findUnique({ where: { id: finding.minorId } });
        return {
          id: finding.id,
          caseId: finding.caseId,
          minorId: finding.minorId,
          url: finding.url,
          platform: finding.platform,
          ownershipType: finding.ownershipType,
          riskScore: finding.riskScore,
          matchScore: finding.matchScore,
          confidenceScore: finding.confidenceScore,
          duplicateGroupId: finding.duplicateGroupId,
          sourceType: finding.sourceType,
          sourceUrl: finding.sourceUrl,
          status: finding.status,
          createdAt: finding.createdAt,
          childName: minor && Array.isArray(minor.aliasesJson) && minor.aliasesJson.length > 0 ? minor.aliasesJson[0] : undefined,
          aliases: minor?.aliasesJson,
          matchingMetadata: finding.matchingMetadata
        };
      })
    );

    return enriched;
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
