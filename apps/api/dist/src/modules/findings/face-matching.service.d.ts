export interface FaceReferencePayload {
    normalizedVector: number[];
    metadata?: Record<string, unknown>;
}
export interface CandidatePayload {
    url: string;
    platform: string;
    sourceType: string;
    normalizedVector?: number[];
}
export interface FaceMatchingResult {
    matchScore: number;
    confidenceScore: number;
    explanation: string;
}
export declare class FaceMatchingService {
    scoreCandidate(reference: FaceReferencePayload, candidate: CandidatePayload): FaceMatchingResult;
}
