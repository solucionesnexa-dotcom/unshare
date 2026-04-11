"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validation_1 = require("./config/env.validation");
const auth_module_1 = require("./modules/auth/auth.module");
const iam_module_1 = require("./modules/iam/iam.module");
const cases_module_1 = require("./modules/cases/cases.module");
const findings_module_1 = require("./modules/findings/findings.module");
const actions_module_1 = require("./modules/actions/actions.module");
const evidence_module_1 = require("./modules/evidence/evidence.module");
const audit_module_1 = require("./modules/audit/audit.module");
const jobs_module_1 = require("./jobs/jobs.module");
const health_controller_1 = require("./health.controller");
const prisma_module_1 = require("./prisma.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const policy_guard_1 = require("./common/guards/policy.guard");
const secret_provider_service_1 = require("./common/secrets/secret-provider.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        providers: [jwt_auth_guard_1.JwtAuthGuard, policy_guard_1.PolicyGuard, secret_provider_service_1.SecretProviderService],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [configuration_1.default], validate: env_validation_1.validateEnv }),
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: Number(process.env.REDIS_PORT || 6379)
                }
            }),
            auth_module_1.AuthModule,
            iam_module_1.IamModule,
            cases_module_1.CasesModule,
            findings_module_1.FindingsModule,
            actions_module_1.ActionsModule,
            evidence_module_1.EvidenceModule,
            audit_module_1.AuditModule,
            jobs_module_1.JobsModule
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map