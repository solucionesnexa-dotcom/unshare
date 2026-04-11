"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RetentionPurgeProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetentionPurgeProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let RetentionPurgeProcessor = RetentionPurgeProcessor_1 = class RetentionPurgeProcessor extends bullmq_1.WorkerHost {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(RetentionPurgeProcessor_1.name);
    }
    async process(job) {
        this.logger.warn(`[TODO] Retention purge processor stub: job ${job.id}`);
        return { ok: true, id: job.id, status: 'pending_implementation' };
    }
};
exports.RetentionPurgeProcessor = RetentionPurgeProcessor;
exports.RetentionPurgeProcessor = RetentionPurgeProcessor = RetentionPurgeProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('retention.purge')
], RetentionPurgeProcessor);
//# sourceMappingURL=retention-purge.processor.js.map