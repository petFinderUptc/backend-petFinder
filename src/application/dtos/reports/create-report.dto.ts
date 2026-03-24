import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { PetSize, PetType, PostStatus, PostType } from '../../../domain/enums';

export class CreateReportDto {
  @IsEnum(PetType)
  species: PetType;

  @IsEnum(PostType)
  type: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  @MinLength(2)
  color: string;

  @IsString()
  @MinLength(2)
  breed: string;

  @IsEnum(PetSize)
  size: PetSize;

  @IsString()
  @MinLength(5)
  contact: string;

  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  locationQuery?: string;
}
