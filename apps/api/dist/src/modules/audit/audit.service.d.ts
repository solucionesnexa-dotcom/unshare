import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';
interface AuditEventInput {
    actorUserId?: string;
    action: string;
    objectType: string;
    objectId?: string;
    metadata?: Record<string, unknown>;
    sensitive?: boolean;
}
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    write(event: AuditEventInput): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        actorUserId: string | null;
        objectType: string;
        objectId: string | null;
        metadata: Prisma.JsonValue;
        prevHash: string | null;
        currHash: string;
    } | null>;
}
export {};
