import { RequestUser } from '../../common/types/request-user';
import { EvidenceService } from './evidence.service';
export declare class EvidenceController {
    private readonly evidenceService;
    constructor(evidenceService: EvidenceService);
    createUpload(user: RequestUser, findingId: string): Promise<{
        evidenceId: string;
        uploadUrl: string;
        expiresInSeconds: number;
    }>;
    completeUpload(_findingId: string, body: {
        evidenceId: string;
        sha256: string;
        mimeType?: string;
    }): Promise<{
        id: string;
        sha256: string;
        findingId: string;
        status: import(".prisma/client").$Enums.EvidenceStatus;
        objectKey: string;
        mimeType: string;
        capturedBy: string;
        capturedAt: Date;
    }>;
    downloadUrl(user: RequestUser, evidenceId: string): Promise<{
        downloadUrl: string;
        expiresInSeconds: number;
    }>;
}
