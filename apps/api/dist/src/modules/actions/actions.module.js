"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsModule = void 0;
const common_1 = require("@nestjs/common");
const iam_module_1 = require("../iam/iam.module");
const findings_module_1 = require("../findings/findings.module");
const audit_module_1 = require("../audit/audit.module");
const auth_module_1 = require("../auth/auth.module");
const actions_controller_1 = require("./actions.controller");
const actions_service_1 = require("./actions.service");
let ActionsModule = class ActionsModule {
};
exports.ActionsModule = ActionsModule;
exports.ActionsModule = ActionsModule = __decorate([
    (0, common_1.Module)({ imports: [iam_module_1.IamModule, findings_module_1.FindingsModule, audit_module_1.AuditModule, auth_module_1.AuthModule], controllers: [actions_controller_1.ActionsController], providers: [actions_service_1.ActionsService] })
], ActionsModule);
//# sourceMappingURL=actions.module.js.map