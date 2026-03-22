import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';
import { PetSize, PetType, PostStatus, PostType } from '../../../domain/enums';

export class CreateReportDto {
  @ApiProperty({ enum: PetType, description: 'Especie de la mascota' })
  @IsEnum(PetType)
  species: PetType;

  @ApiProperty({ enum: PostType, description: 'Tipo de reporte' })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ enum: PostStatus, description: 'Estado del reporte' })
  @IsEnum(PostStatus)
  status: PostStatus;

  @ApiProperty({
    example: 'Mascota encontrada en el parque...',
    description: 'Descripción del reporte',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'Marrón', description: 'Color de la mascota' })
  @IsString()
  @MinLength(2)
  color: string;

  @ApiProperty({ example: 'Labrador', description: 'Raza de la mascota' })
  @IsString()
  @MinLength(2)
  breed: string;

  @ApiProperty({ enum: PetSize, description: 'Tamaño de la mascota' })
  @IsEnum(PetSize)
  size: PetSize;

  @ApiProperty({ example: '+573001234567', description: 'Contacto del reportante' })
  @IsString()
  @MinLength(5)
  contact: string;

  @ApiProperty({
    example: 'https://example.com/img.png',
    description: 'URL de imagen con protocolo',
  })
  @IsUrl({ require_protocol: true })
  imageUrl: string;

  @ApiProperty({ example: -12.34, description: 'Latitud de ubicación' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: -56.78, description: 'Longitud de ubicación' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lon: number;
}
