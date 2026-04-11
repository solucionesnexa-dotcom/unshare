import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
@Processor('face.match')
export class FaceMatchingProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {
    super();
  }

  async process(job: Job<{ findingId: string }>) {
    const findingId = job.data.findingId;
    const finding = await this.prisma.finding.findUnique({ where: { id: findingId } });
    if (!finding) return { ok: false, reason: 'Finding not found' };

    await this.prisma.finding.update({
      where: { id: findingId },
      data: {
        matchingMetadata: {
          processedAt: new Date().toISOString(),
          processor: 'face.match',
          note: 'Face matching job completed. This is a stub for phase 2.'
        }
      }
    });

    await this.audit.write({
      action: 'finding.matching.processed',
      objectType: 'finding',
      objectId: findingId,
      metadata: { jobId: job.id, queue: job.queueName },
      sensitive: false
    });

    return { ok: true, findingId };
  }
}
