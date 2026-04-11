import { RequestUser } from '../../common/types/request-user';
import { ActionsService } from './actions.service';
import { ApproveActionDto } from './dto/approve-action.dto';
import { CreateActionDto } from './dto/create-action.dto';
export declare class ActionsController {
    private readonly actionsService;
    constructor(actionsService: ActionsService);
    deleteOwn(user: RequestUser, findingId: string, key: string): Promise<{
        id: string;
        caseId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        findingId: string;
        idempotencyKey: string;
        actionType: import(".prisma/client").$Enums.ActionType;
        requiresApproval: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue;
        preparedBy: string;
    }>;
    friendly(user: RequestUser, findingId: string, dto: CreateActionDto, key: string): Promise<{
        id: string;
        caseId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        findingId: string;
        idempotencyKey: string;
        actionType: import(".prisma/client").$Enums.ActionType;
        requiresApproval: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue;
        preparedBy: string;
    }>;
    escalate(user: RequestUser, findingId: string, key: string): Promise<{
        id: string;
        caseId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        findingId: string;
        idempotencyKey: string;
        actionType: import(".prisma/client").$Enums.ActionType;
        requiresApproval: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue;
        preparedBy: string;
    }>;
    approve(user: RequestUser, actionId: string, dto: ApproveActionDto): Promise<{
        id: string;
        caseId: string;
        status: import(".prisma/client").$Enums.ActionStatus;
        createdAt: Date;
        findingId: string;
        idempotencyKey: string;
        actionType: import(".prisma/client").$Enums.ActionType;
        requiresApproval: boolean;
        payload: import("@prisma/client/runtime/library").JsonValue;
        preparedBy: string;
    }>;
}
