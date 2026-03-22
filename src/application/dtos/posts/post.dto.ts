/**
 * DTOs para el módulo de publicaciones
 *
 * Capa de Aplicación - Define contratos de entrada/salida
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  Max,
  IsDateString,
  ValidateNested,
  IsEmail,
  IsPhoneNumber,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostType, PostStatus, PetType, PetSize } from '../../../domain/enums';

/**
 * DTO para coordenadas
 */
export class CoordinatesDto {
  @ApiProperty({ example: -12.34, description: 'Latitud' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -56.78, description: 'Longitud' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

/**
 * DTO para ubicación
 */
export class LocationDto {
  @ApiProperty({ example: 'Bogotá', description: 'Ciudad' })
  @IsString()
  @MinLength(2)
  city: string;

  @ApiProperty({ example: 'Chapinero', description: 'Barrio' })
  @IsString()
  @MinLength(2)
  neighborhood: string;

  @ApiPropertyOptional({ example: 'Carrera 15 # 23-45', description: 'Dirección' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ type: CoordinatesDto, description: 'Coordenadas' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

/**
 * DTO para crear una publicación
 */
export class CreatePostDto {
  @ApiProperty({ enum: PostType, description: 'Tipo de publicación', example: 'lost' })
  @IsEnum(PostType, { message: 'Tipo de publicación debe ser "lost" o "found"' })
  type: PostType;

  @ApiPropertyOptional({ example: 'Firulais', description: 'Nombre de la mascota' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  petName?: string;

  @ApiProperty({ enum: PetType, description: 'Tipo de mascota', example: 'dog' })
  @IsEnum(PetType, { message: 'Tipo de mascota inválido' })
  petType: PetType;

  @ApiPropertyOptional({ example: 'Labrador', description: 'Raza' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @ApiProperty({ example: 'Marrón', description: 'Color' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  color: string;

  @ApiProperty({ enum: PetSize, description: 'Tamaño' })
  @IsEnum(PetSize)
  size: PetSize;

  @ApiPropertyOptional({ example: 3, description: 'Edad aproximada en años' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  age?: number;

  @ApiProperty({
    example: 'Descripción detallada de la mascota',
    description: 'Descripción del reporte',
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({
    example: ['https://example.com/pic1.jpg'],
    description: 'Listado de URLs de imágenes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: LocationDto, description: 'Ubicación' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ example: '+573001234567', description: 'Teléfono de contacto' })
  @IsPhoneNumber('CO', { message: 'Teléfono inválido para Colombia' })
  contactPhone: string;

  @ApiPropertyOptional({ example: 'contacto@example.com', description: 'Email de contacto' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ example: '2025-12-15T00:00:00.000Z', description: 'Fecha de pérdida/encontrado' })
  @IsDateString()
  lostOrFoundDate: string;
}

/**
 * DTO para actualizar publicación
 */
export class UpdatePostDto {
  @ApiPropertyOptional({ enum: PostStatus, description: 'Estado de la publicación' })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ example: 'Firulais', description: 'Nombre de la mascota' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  petName?: string;

  @ApiPropertyOptional({ example: 'Labrador', description: 'Raza' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @ApiPropertyOptional({ example: 'Marrón', description: 'Color' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({ example: 'Descripción actualizada', description: 'Descripción' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: ['https://example.com/img1.jpg'], description: 'Imágenes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: LocationDto, description: 'Ubicación' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ example: '+573001234567', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsPhoneNumber('CO')
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'contacto@example.com', description: 'Email de contacto' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

/**
 * DTO para filtrar publicaciones
 */
export class FilterPostDto {
  @ApiPropertyOptional({ enum: PostType, description: 'Filtrar por tipo de publicación' })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({ enum: PostStatus, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ enum: PetType, description: 'Filtrar por especie' })
  @IsOptional()
  @IsEnum(PetType)
  petType?: PetType;

  @ApiPropertyOptional({ enum: PetSize, description: 'Filtrar por tamaño' })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Filtrar por ciudad' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Chapinero', description: 'Filtrar por barrio' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Marrón', description: 'Filtrar por color' })
  @IsOptional()
  @IsString()
  color?: string;
}
