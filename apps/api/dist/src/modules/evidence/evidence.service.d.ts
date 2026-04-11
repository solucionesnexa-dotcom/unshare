import { Queue } from 'bullmq';
import { AuthorizationService } from '../../common/policies/authorization.service';
import { RequestUser } from '../../common/types/request-user';
import { PrismaService } from '../../prisma.service';
import { FindingsService } from '../findings/findings.service';
import { MinioSignerService } from './minio-signer.service';
export declare class EvidenceService {
    private readonly prisma;
    private readonly findingsService;
    private readonly authz;
    private readonly minioSigner;
    private readonly evidenceScanQueue;
    constructor(prisma: PrismaService, findingsService: FindingsService, authz: AuthorizationService, minioSigner: MinioSignerService, evidenceScanQueue: Queue);
    createUploadUrl(user: RequestUser, findingId: string): Promise<{
        evidenceId: string;
        uploadUrl: string;
        expiresInSeconds: number;
    }>;
    markUploaded(evidenceId: string, sha256: string, mimeType?: string): Promise<{
        id: string;
        sha256: string;
        findingId: string;
        status: import(".prisma/client").$Enums.EvidenceStatus;
        objectKey: string;
        mimeType: string;
        capturedBy: string;
        capturedAt: Date;
    }>;
    setScanResult(evidenceId: string, clean: boolean): Promise<void>;
    getDownloadUrl(user: RequestUser, evidenceId: string): Promise<{
        downloadUrl: string;
        expiresInSeconds: number;
    }>;
}
