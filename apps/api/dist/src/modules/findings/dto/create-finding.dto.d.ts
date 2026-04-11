type OwnershipType = 'own_content' | 'family_third_party' | 'external_third_party' | 'platform_copy' | 'search_result';
export declare class CreateFindingDto {
    minorId: string;
    url: string;
    platform: string;
    ownershipType: OwnershipType;
    riskScore: number;
    matchScore?: number;
    confidenceScore?: number;
    sourceType?: string;
    sourceUrl?: string;
    matchingMetadata?: Record<string, unknown>;
    duplicateGroupId?: string;
}
export {};
