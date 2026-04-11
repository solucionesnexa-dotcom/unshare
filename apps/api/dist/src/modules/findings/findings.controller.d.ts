import { RequestUser } from '../../common/types/request-user';
import { CreateFindingDto } from './dto/create-finding.dto';
import { FindingsService } from './findings.service';
export declare class FindingsController {
    private readonly findingsService;
    constructor(findingsService: FindingsService);
    createFinding(user: RequestUser, caseId: string, dto: CreateFindingDto): Promise<{
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
    listFindings(user: RequestUser, caseId: string): Promise<{
        id: string;
        caseId: string;
        minorId: string;
        url: string;
        platform: string;
        ownershipType: import(".prisma/client").$Enums.OwnershipType;
        riskScore: number;
        status: import(".prisma/client").$Enums.FindingStatus;
        createdAt: Date;
        childName: import("@prisma/client/runtime/library").JsonValue | undefined;
        aliases: import("@prisma/client/runtime/library").JsonValue | undefined;
    }[]>;
    getFinding(user: RequestUser, findingId: string): Promise<{
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
    }>;
}
