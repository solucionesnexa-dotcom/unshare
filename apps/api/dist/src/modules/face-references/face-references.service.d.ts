import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CasesService } from '../cases/cases.service';
import { CreateFaceReferenceDto } from './dto/create-face-reference.dto';
import { Prisma } from '@prisma/client';
export declare class FaceReferencesService {
    private readonly prisma;
    private readonly casesService;
    private readonly authz;
    private readonly audit;
    constructor(prisma: PrismaService, casesService: CasesService, authz: AuthorizationService, audit: AuditService);
    create(user: RequestUser, caseId: string, dto: CreateFaceReferenceDto): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        minorId: string;
        metadata: Prisma.JsonValue;
        referenceType: string;
        normalizedVector: Prisma.JsonValue;
    }>;
    listByCase(user: RequestUser, caseId: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        minorId: string;
        metadata: Prisma.JsonValue;
        referenceType: string;
        normalizedVector: Prisma.JsonValue;
    }[]>;
}
