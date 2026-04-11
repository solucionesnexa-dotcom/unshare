import { BadRequestException, Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { FindingsService } from '../findings/findings.service';
import { MinioSignerService } from './minio-signer.service';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findingsService: FindingsService,
    private readonly authz: AuthorizationService,
    private readonly minioSigner: MinioSignerService,
    @InjectQueue('evidence.scan') private readonly evidenceScanQueue: Queue
  ) {}

  async createUploadUrl(user: RequestUser, findingId: string) {
    const finding = await this.findingsService.getById(user, findingId);
    if (!finding) throw new BadRequestException('Finding not found');

    const evidenceId = uuidv7();
    const objectKey = `evidence/${findingId}/${evidenceId}.bin`;

    await this.prisma.findingEvidence.create({
      data: {
        id: evidenceId,
        findingId,
        objectKey,
        sha256: ''.padEnd(64, '0'),
        mimeType: 'application/octet-stream',
        status: 'uploaded_pending_scan',
        capturedBy: user.id
      }
    });

    return { evidenceId, uploadUrl: this.minioSigner.signUpload(objectKey, 300), expiresInSeconds: 300 };
  }

  async markUploaded(evidenceId: string, sha256: string, mimeType?: string) {
    const evidence = await this.prisma.findingEvidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) throw new BadRequestException('Evidence not found');

    const updated = await this.prisma.findingEvidence.update({
      where: { id: evidenceId },
      data: { sha256, mimeType: mimeType || evidence.mimeType, status: 'uploaded_pending_scan' }
    });

    await this.evidenceScanQueue.add('scan', { evidenceId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
    return updated;
  }

  async setScanResult(evidenceId: string, clean: boolean) {
    await this.prisma.findingEvidence.update({ where: { id: evidenceId }, data: { status: clean ? 'available' : 'quarantined' } });
  }

  async getDownloadUrl(user: RequestUser, evidenceId: string) {
    const evidence = await this.prisma.findingEvidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) throw new BadRequestException('Evidence not found');

    const finding = await this.prisma.finding.findUnique({ where: { id: evidence.findingId } });
    if (!finding) throw new BadRequestException('Finding not found');

    this.authz.assert(user, 'evidence:download', { caseId: finding.caseId, ownershipType: finding.ownershipType });
    if (evidence.status !== 'available') throw new BadRequestException('Evidence not available');

    return { downloadUrl: this.minioSigner.signDownload(evidence.objectKey, 300), expiresInSeconds: 300 };
  }
}
