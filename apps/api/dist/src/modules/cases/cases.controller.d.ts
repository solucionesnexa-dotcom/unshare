import { RequestUser } from '../../common/types/request-user';
import { CreateCaseDto } from './dto/create-case.dto';
import { CasesService } from './cases.service';
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    createCase(user: RequestUser, dto: CreateCaseDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CaseStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        primaryGuardianId: string;
        priority: number;
        summary: string | null;
    }>;
    getCase(user: RequestUser, caseId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CaseStatus;
        createdAt: Date;
        updatedAt: Date;
        familyId: string;
        primaryGuardianId: string;
        priority: number;
        summary: string | null;
    }>;
}
