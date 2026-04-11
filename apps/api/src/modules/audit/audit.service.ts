import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { PrismaService } from '../../prisma.service';
<<<<<<< HEAD
import { Prisma } from '@prisma/client';
=======
>>>>>>> 9069c8d9b71721fbb19ed54c1d54ea63a2fd96dc

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
<<<<<<< HEAD
          metadata: (event.metadata ?? {}) as Prisma.InputJsonValue,
=======
          metadata: event.metadata || {},
>>>>>>> 9069c8d9b71721fbb19ed54c1d54ea63a2fd96dc
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
