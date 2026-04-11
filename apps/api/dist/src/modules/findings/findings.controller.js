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
exports.FindingsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const policy_guard_1 = require("../../common/guards/policy.guard");
const policy_resource_decorator_1 = require("../../common/decorators/policy-resource.decorator");
const create_finding_dto_1 = require("./dto/create-finding.dto");
const findings_service_1 = require("./findings.service");
let FindingsController = class FindingsController {
    constructor(findingsService) {
        this.findingsService = findingsService;
    }
    async createFinding(user, caseId, dto) {
        return this.findingsService.create(user, caseId, dto);
    }
    async getFinding(user, findingId) {
        const finding = await this.findingsService.getById(user, findingId);
        if (!finding)
            throw new common_1.NotFoundException('Finding not found');
        return finding;
    }
};
exports.FindingsController = FindingsController;
__decorate([
    (0, common_1.Post)('cases/:caseId/findings'),
    (0, policy_resource_decorator_1.PolicyResource)('finding'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('caseId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_finding_dto_1.CreateFindingDto]),
    __metadata("design:returntype", Promise)
], FindingsController.prototype, "createFinding", null);
__decorate([
    (0, common_1.Get)('findings/:findingId'),
    (0, policy_resource_decorator_1.PolicyResource)('finding'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('findingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FindingsController.prototype, "getFinding", null);
exports.FindingsController = FindingsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, policy_guard_1.PolicyGuard),
    __metadata("design:paramtypes", [findings_service_1.FindingsService])
], FindingsController);
//# sourceMappingURL=findings.controller.js.map