import { ArrayNotEmpty, ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateFaceReferenceDto {
  @IsUUID()
  minorId!: string;

  @IsIn(['image', 'name'])
  referenceType!: 'image' | 'name';

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  normalizedVector!: number[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
