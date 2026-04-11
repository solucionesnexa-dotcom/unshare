import { RequestUser } from '../../common/types/request-user';
import { CreateFindingDto } from './dto/create-finding.dto';
import { FindingsService } from './findings.service';
export declare class FindingsController {
    private readonly findingsService;
    constructor(findingsService: FindingsService);
    createFinding(user: RequestUser, caseId: string, dto: CreateFindingDto): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        status: import(".prisma/client").$Enums.FindingStatus;
        minorId: string;
        url: string;
        urlFingerprint: string;
        platform: string;
        ownershipType: import(".prisma/client").$Enums.OwnershipType;
        riskScore: number;
        updatedAt: Date;
    }>;
    getFinding(user: RequestUser, findingId: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        status: import(".prisma/client").$Enums.FindingStatus;
        minorId: string;
        url: string;
        urlFingerprint: string;
        platform: string;
        ownershipType: import(".prisma/client").$Enums.OwnershipType;
        riskScore: number;
        updatedAt: Date;
    } | {
        id: string;
        url: string;
        platform: string;
        status: import(".prisma/client").$Enums.FindingStatus;
        recommendedAction: string;
    }>;
}
