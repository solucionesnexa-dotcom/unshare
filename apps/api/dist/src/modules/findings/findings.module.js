"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindingsModule = void 0;
const common_1 = require("@nestjs/common");
const iam_module_1 = require("../iam/iam.module");
const cases_module_1 = require("../cases/cases.module");
const audit_module_1 = require("../audit/audit.module");
const findings_controller_1 = require("./findings.controller");
const findings_service_1 = require("./findings.service");
let FindingsModule = class FindingsModule {
};
exports.FindingsModule = FindingsModule;
exports.FindingsModule = FindingsModule = __decorate([
    (0, common_1.Module)({ imports: [iam_module_1.IamModule, cases_module_1.CasesModule, audit_module_1.AuditModule], controllers: [findings_controller_1.FindingsController], providers: [findings_service_1.FindingsService], exports: [findings_service_1.FindingsService] })
], FindingsModule);
//# sourceMappingURL=findings.module.js.map