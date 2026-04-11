import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class ScanFindingsDto {
  @IsOptional()
  @IsUUID()
  faceReferenceId?: string;

  @IsOptional()
  @IsString()
  nameQuery?: string;

  @IsOptional()
  @IsIn(['Instagram', 'TikTok', 'Facebook'])
  platform?: string;
}
