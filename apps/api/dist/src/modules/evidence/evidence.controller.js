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
exports.EvidenceController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const policy_guard_1 = require("../../common/guards/policy.guard");
const policy_resource_decorator_1 = require("../../common/decorators/policy-resource.decorator");
const evidence_service_1 = require("./evidence.service");
const mark_uploaded_dto_1 = require("./dto/mark-uploaded.dto");
let EvidenceController = class EvidenceController {
    constructor(evidenceService) {
        this.evidenceService = evidenceService;
    }
    async createUpload(user, findingId) {
        return this.evidenceService.createUploadUrl(user, findingId);
    }
    async completeUpload(_findingId, body) {
        return this.evidenceService.markUploaded(body.evidenceId, body.sha256, body.mimeType);
    }
    async listEvidence(user, findingId) {
        return this.evidenceService.listByFinding(user, findingId);
    }
    async downloadUrl(user, evidenceId) {
        return this.evidenceService.getDownloadUrl(user, evidenceId);
    }
};
exports.EvidenceController = EvidenceController;
__decorate([
    (0, common_1.Post)('findings/:findingId/evidence/upload-url'),
    (0, policy_resource_decorator_1.PolicyResource)('evidence'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('findingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EvidenceController.prototype, "createUpload", null);
__decorate([
    (0, common_1.Post)('findings/:findingId/evidence'),
    (0, policy_resource_decorator_1.PolicyResource)('evidence'),
    __param(0, (0, common_1.Param)('findingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, mark_uploaded_dto_1.MarkUploadedDto]),
    __metadata("design:returntype", Promise)
], EvidenceController.prototype, "completeUpload", null);
__decorate([
    (0, common_1.Get)('findings/:findingId/evidence'),
    (0, policy_resource_decorator_1.PolicyResource)('evidence'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('findingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EvidenceController.prototype, "listEvidence", null);
__decorate([
    (0, common_1.Get)('evidence/:evidenceId/download-url'),
    (0, policy_resource_decorator_1.PolicyResource)('evidence'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('evidenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EvidenceController.prototype, "downloadUrl", null);
exports.EvidenceController = EvidenceController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, policy_guard_1.PolicyGuard),
    __metadata("design:paramtypes", [evidence_service_1.EvidenceService])
], EvidenceController);
//# sourceMappingURL=evidence.controller.js.map