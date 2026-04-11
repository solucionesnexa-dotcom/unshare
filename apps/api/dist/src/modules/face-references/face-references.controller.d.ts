import { RequestUser } from '../../common/types/request-user';
import { CreateFaceReferenceDto } from './dto/create-face-reference.dto';
import { FaceReferencesService } from './face-references.service';
export declare class FaceReferencesController {
    private readonly faceReferencesService;
    constructor(faceReferencesService: FaceReferencesService);
    createReference(user: RequestUser, caseId: string, dto: CreateFaceReferenceDto): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        minorId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        referenceType: string;
        normalizedVector: import("@prisma/client/runtime/library").JsonValue;
    }>;
    listReferences(user: RequestUser, caseId: string): Promise<{
        id: string;
        createdAt: Date;
        caseId: string;
        minorId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        referenceType: string;
        normalizedVector: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}
