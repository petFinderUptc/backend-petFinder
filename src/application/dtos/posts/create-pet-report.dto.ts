import { IsEnum, IsNumber, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';
import { PetSize, PetType, PostStatus, PostType } from '../../../domain/enums';

/**
 * DTO para crear reportes de mascota con contrato simplificado para frontend.
 */
export class CreatePetReportDto {
  @IsEnum(PetType)
  species: PetType;

  @IsEnum(PostStatus)
  status: PostStatus;

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

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;

  @IsEnum(PostType)
  type: PostType;
}
