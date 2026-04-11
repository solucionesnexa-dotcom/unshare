import { RequestUser } from '../../common/types/request-user';
import { EvidenceService } from './evidence.service';
import { MarkUploadedDto } from './dto/mark-uploaded.dto';
export declare class EvidenceController {
    private readonly evidenceService;
    constructor(evidenceService: EvidenceService);
    createUpload(user: RequestUser, findingId: string): Promise<{
        evidenceId: string;
        uploadUrl: string;
        expiresInSeconds: number;
    }>;
    completeUpload(_findingId: string, body: MarkUploadedDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EvidenceStatus;
        sha256: string;
        findingId: string;
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
