import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { CasesService } from '../cases/cases.service';
import { AuditService } from '../audit/audit.service';
import { CreateFindingDto } from './dto/create-finding.dto';
export declare class FindingsService {
    private readonly prisma;
    private readonly casesService;
    private readonly authz;
    private readonly audit;
    constructor(prisma: PrismaService, casesService: CasesService, authz: AuthorizationService, audit: AuditService);
    create(user: RequestUser, caseId: string, dto: CreateFindingDto): Promise<{
        id: string;
        caseId: string;
        minorId: string;
        url: string;
        urlFingerprint: string;
        platform: string;
        ownershipType: import(".prisma/client").$Enums.OwnershipType;
        riskScore: number;
        status: import(".prisma/client").$Enums.FindingStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getById(user: RequestUser, findingId: string): Promise<{
        id: string;
        caseId: string;
        minorId: string;
        url: string;
        urlFingerprint: string;
        platform: string;
        ownershipType: import(".prisma/client").$Enums.OwnershipType;
        riskScore: number;
        status: import(".prisma/client").$Enums.FindingStatus;
        createdAt: Date;
        updatedAt: Date;
    } | {
        id: string;
        url: string;
        platform: string;
        status: import(".prisma/client").$Enums.FindingStatus;
        recommendedAction: string;
    } | null>;
}
