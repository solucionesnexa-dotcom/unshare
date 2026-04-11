"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationService = void 0;
const common_1 = require("@nestjs/common");
let AuthorizationService = class AuthorizationService {
    can(user, action, resource) {
        if (user.role === 'admin')
            return true;
        if (user.role === 'operator') {
            if (resource.caseId && user.assignedCaseIds && !user.assignedCaseIds.includes(resource.caseId))
                return false;
            return true;
        }
        if (user.role === 'guardian') {
            if (resource.familyId && user.familyId !== resource.familyId)
                return false;
            return action !== 'action:approve' || Boolean(resource.caseId);
        }
        if (user.role === 'collaborator_limited') {
            if (action === 'evidence:download' || action === 'action:approve')
                return false;
            if (action === 'action:create')
                return resource.ownershipType === 'own_content';
            return action === 'finding:read' && resource.ownershipType === 'own_content';
        }
        return false;
    }
    assert(user, action, resource) {
        if (!this.can(user, action, resource)) {
            throw new common_1.ForbiddenException('Access denied by RBAC/ABAC policy');
        }
    }
};
exports.AuthorizationService = AuthorizationService;
exports.AuthorizationService = AuthorizationService = __decorate([
    (0, common_1.Injectable)()
], AuthorizationService);
//# sourceMappingURL=authorization.service.js.map