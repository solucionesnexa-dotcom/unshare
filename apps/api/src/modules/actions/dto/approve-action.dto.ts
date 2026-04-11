import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ApproveActionDto {
  @IsEnum(['approve', 'reject'])
  decision!: 'approve' | 'reject';

  @IsString()
  @IsOptional()
  reason?: string;
}
