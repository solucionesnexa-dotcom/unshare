import { IsString, IsOptional } from 'class-validator';

export class MarkUploadedDto {
  @IsString()
  evidenceId!: string;

  @IsString()
  sha256!: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}
