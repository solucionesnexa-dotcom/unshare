import { IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

type OwnershipType = 'own_content' | 'family_third_party' | 'external_third_party' | 'platform_copy' | 'search_result';

export class CreateFindingDto {
  @IsUUID()
  minorId!: string;

  @IsString()
  url!: string;

  @IsString()
  platform!: string;

  @IsIn(['own_content', 'family_third_party', 'external_third_party', 'platform_copy', 'search_result'])
  ownershipType!: OwnershipType;

  @IsInt()
  @Min(0)
  @Max(100)
  riskScore!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  matchScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsObject()
  matchingMetadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  duplicateGroupId?: string;
}
