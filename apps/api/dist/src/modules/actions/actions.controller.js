"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const policy_guard_1 = require("../../common/guards/policy.guard");
const actions_service_1 = require("./actions.service");
const approve_action_dto_1 = require("./dto/approve-action.dto");
const create_action_dto_1 = require("./dto/create-action.dto");
const policy_resource_decorator_1 = require("../../common/decorators/policy-resource.decorator");
let ActionsController = class ActionsController {
    constructor(actionsService) {
        this.actionsService = actionsService;
    }
    deleteOwn(user, findingId, key) {
        return this.actionsService.create(user, findingId, { actionType: 'delete_own' }, key);
    }
    friendly(user, findingId, dto, key) {
        return this.actionsService.create(user, findingId, { ...dto, actionType: 'friendly_request' }, key);
    }
    escalate(user, findingId, key) {
        return this.actionsService.create(user, findingId, { actionType: 'escalate_platform' }, key);
    }
    approve(user, actionId, dto) {
        return this.actionsService.approve(user, actionId, dto);
    }
};
exports.ActionsController = ActionsController;
__decorate([
    (0, common_1.Post)('findings/:findingId/actions/delete-own'),
    (0, policy_resource_decorator_1.PolicyResource)('action'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('findingId')),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "deleteOwn", null);
__decorate([
    (0, common_1.Post)('findings/:findingId/actions/friendly-request'),
    (0, policy_resource_decorator_1.PolicyResource)('action'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('findingId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_action_dto_1.CreateActionDto, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "friendly", null);
__decorate([
    (0, common_1.Post)('findings/:findingId/actions/escalate-platform'),
    (0, policy_resource_decorator_1.PolicyResource)('action'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('findingId')),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "escalate", null);
__decorate([
    (0, common_1.Post)('actions/:actionId/approve'),
    (0, policy_resource_decorator_1.PolicyResource)('action'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('actionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, approve_action_dto_1.ApproveActionDto]),
    __metadata("design:returntype", void 0)
], ActionsController.prototype, "approve", null);
exports.ActionsController = ActionsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, policy_guard_1.PolicyGuard),
    __metadata("design:paramtypes", [actions_service_1.ActionsService])
], ActionsController);
//# sourceMappingURL=actions.controller.js.map