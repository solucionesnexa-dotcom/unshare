import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCaseDto } from './dto/create-case.dto';
export declare class CasesService {
    private readonly prisma;
    private readonly authz;
    private readonly audit;
    constructor(prisma: PrismaService, authz: AuthorizationService, audit: AuditService);
    create(user: RequestUser, dto: CreateCaseDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CaseStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        primaryGuardianId: string;
        priority: number;
        summary: string | null;
    }>;
    getById(user: RequestUser, caseId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CaseStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        primaryGuardianId: string;
        priority: number;
        summary: string | null;
    } | null>;
}
