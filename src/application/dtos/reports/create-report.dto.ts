import { ApiProperty } from '@nestjs/swagger';
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
import { PetSize, PetType, PostStatus, PostType } from '../../../domain/enums';

export class CreateReportDto {
  @ApiProperty({ enum: PetType, description: 'Especie de la mascota' })
  @IsEnum(PetType)
  species: PetType;

  @ApiProperty({ enum: PostType, description: 'Tipo de reporte' })
  @IsEnum(PostType)
  type: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({
    example: 'Mascota encontrada en el parque...',
    description: 'Descripción del reporte',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ example: 'Marrón', description: 'Color de la mascota' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  color: string;

  @ApiProperty({ example: 'Labrador', description: 'Raza de la mascota' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  breed: string;

  @ApiProperty({ enum: PetSize, description: 'Tamaño de la mascota' })
  @IsEnum(PetSize)
  size: PetSize;

  @ApiProperty({ example: '+573001234567', description: 'Contacto del reportante' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  contact: string;

  @ApiProperty({
    example: 'https://example.com/img.png',
    description: 'URL de imagen con protocolo',
  })
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
  @MaxLength(200)
  locationQuery?: string;
}
