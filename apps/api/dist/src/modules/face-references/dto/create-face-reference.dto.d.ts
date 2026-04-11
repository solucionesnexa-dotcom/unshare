export declare class CreateFaceReferenceDto {
    minorId: string;
    referenceType: 'image' | 'name';
    normalizedVector: number[];
    metadata?: Record<string, unknown>;
}
