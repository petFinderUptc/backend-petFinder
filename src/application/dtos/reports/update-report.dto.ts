import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PetSize, PetType, PostStatus } from '../../../domain/enums';

export class UpdateReportDto {
  @ApiPropertyOptional({ enum: PetType, description: 'Especie de la mascota' })
  @IsOptional()
  @IsEnum(PetType)
  species?: PetType;

  @ApiPropertyOptional({ enum: PostStatus, description: 'Estado del reporte' })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    example: 'Actualización de descripción',
    description: 'Texto del reporte',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'Negro', description: 'Color' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({ example: 'Criollo', description: 'Raza' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  breed?: string;

  @ApiPropertyOptional({ enum: PetSize, description: 'Tamaño' })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({ example: '+573001234567', description: 'Contacto' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  contact?: string;

  @ApiPropertyOptional({ example: 'https://example.com/img.png', description: 'URL de imagen' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  imageUrl?: string;

  @ApiPropertyOptional({ example: -12.34, description: 'Latitud' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({ example: -56.78, description: 'Longitud' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon?: number;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  locationQuery?: string;
}
