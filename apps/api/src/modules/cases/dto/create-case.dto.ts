import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateCaseDto {
  @IsUUID()
  familyId!: string;

  @IsUUID()
  primaryGuardianId!: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsInt()
  @Min(1)
  @Max(3)
  priority!: number;
}
