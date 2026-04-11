import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../../prisma.service';

interface AuditEventInput {
  actorUserId?: string;
  action: string;
  objectType: string;
  objectId?: string;
  metadata?: Record<string, unknown>;
  sensitive?: boolean;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(event: AuditEventInput) {
    try {
      const prev = await this.prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' } });
      const payload = JSON.stringify({
        action: event.action,
        actorUserId: event.actorUserId || null,
        objectType: event.objectType,
        objectId: event.objectId || null,
        metadata: event.metadata || {},
        ts: new Date().toISOString()
      });
      const prevHash = prev?.currHash || '';
      const currHash = createHash('sha256').update(`${prevHash}${payload}`).digest('hex');

      return await this.prisma.auditLog.create({
        data: {
          id: uuidv7(),
          actorUserId: event.actorUserId,
          action: event.action,
          objectType: event.objectType,
          objectId: event.objectId,
          metadata: event.metadata || {},
          prevHash: prevHash || null,
          currHash
        }
      });
    } catch {
      if (event.sensitive) throw new InternalServerErrorException('Audit chain write failed');
      return null;
    }
  }
}
