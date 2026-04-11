"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const evidence_scan_processor_1 = require("./processors/evidence-scan.processor");
const notifications_processor_1 = require("./processors/notifications.processor");
const sla_reminder_processor_1 = require("./processors/sla-reminder.processor");
const action_followup_processor_1 = require("./processors/action-followup.processor");
const retention_purge_processor_1 = require("./processors/retention-purge.processor");
const evidence_module_1 = require("../modules/evidence/evidence.module");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [evidence_module_1.EvidenceModule,
            bullmq_1.BullModule.registerQueue({ name: 'evidence.scan' }, { name: 'notifications.send' }, { name: 'case.sla.reminder' }, { name: 'action.followup' }, { name: 'retention.purge' })
        ],
        providers: [evidence_scan_processor_1.EvidenceScanProcessor, notifications_processor_1.NotificationsProcessor, sla_reminder_processor_1.SlaReminderProcessor, action_followup_processor_1.ActionFollowupProcessor, retention_purge_processor_1.RetentionPurgeProcessor]
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map