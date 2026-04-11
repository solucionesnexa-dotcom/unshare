import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { IamModule } from './modules/iam/iam.module';
import { CasesModule } from './modules/cases/cases.module';
import { FindingsModule } from './modules/findings/findings.module';
import { ActionsModule } from './modules/actions/actions.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { AuditModule } from './modules/audit/audit.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PolicyGuard } from './common/guards/policy.guard';
import { SecretProviderService } from './common/secrets/secret-provider.service';

@Module({
  controllers: [HealthController],
  providers: [JwtAuthGuard, PolicyGuard, SecretProviderService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate: validateEnv }),
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379)
      }
    }),
    AuthModule,
    IamModule,
    CasesModule,
    FindingsModule,
    ActionsModule,
    EvidenceModule,
    AuditModule,
    JobsModule
  ]
})
export class AppModule {}
