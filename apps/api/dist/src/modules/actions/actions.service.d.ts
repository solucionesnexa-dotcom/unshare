import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { FindingsService } from '../findings/findings.service';
import { AuditService } from '../audit/audit.service';
import { CreateActionDto } from './dto/create-action.dto';
import { ApproveActionDto } from './dto/approve-action.dto';
export declare class ActionsService {
    private readonly prisma;
    private readonly findingsService;
    private readonly authz;
    private readonly audit;
    constructor(prisma: PrismaService, findingsService: FindingsService, authz: AuthorizationService, audit: AuditService);
    create(user: RequestUser, findingId: string, dto: CreateActionDto, idempotencyKey: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        caseId: string;
        findingId: string;
        actionType: import(".prisma/client").$Enums.ActionType;
        idempotencyKey: string;
        requiresApproval: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue;
        preparedBy: string;
    }>;
    approve(user: RequestUser, actionId: string, dto: ApproveActionDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        caseId: string;
        findingId: string;
        actionType: import(".prisma/client").$Enums.ActionType;
        idempotencyKey: string;
        requiresApproval: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue;
        preparedBy: string;
    }>;
    private computeApproval;
}
