"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const iam_module_1 = require("../iam/iam.module");
const findings_module_1 = require("../findings/findings.module");
const evidence_controller_1 = require("./evidence.controller");
const evidence_service_1 = require("./evidence.service");
const minio_signer_service_1 = require("./minio-signer.service");
let EvidenceModule = class EvidenceModule {
};
exports.EvidenceModule = EvidenceModule;
exports.EvidenceModule = EvidenceModule = __decorate([
    (0, common_1.Module)({
        imports: [iam_module_1.IamModule, findings_module_1.FindingsModule, bullmq_1.BullModule.registerQueue({ name: 'evidence.scan' })],
        controllers: [evidence_controller_1.EvidenceController],
        providers: [evidence_service_1.EvidenceService, minio_signer_service_1.MinioSignerService],
        exports: [evidence_service_1.EvidenceService]
    })
], EvidenceModule);
//# sourceMappingURL=evidence.module.js.map