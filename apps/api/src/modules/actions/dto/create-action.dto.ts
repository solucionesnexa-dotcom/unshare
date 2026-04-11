import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateActionDto {
  @IsEnum(['delete_own', 'archive_own', 'privatize_own', 'friendly_request', 'escalate_platform'])
  actionType!: 'delete_own' | 'archive_own' | 'privatize_own' | 'friendly_request' | 'escalate_platform';

  @IsBoolean()
  @IsOptional()
  bulk?: boolean;

  @IsString()
  @IsOptional()
  customMessage?: string;
}
