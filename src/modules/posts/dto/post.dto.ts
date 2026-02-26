/**
 * DTOs para el módulo de publicaciones
 */

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
import { PostType, PostStatus, PetType, PetSize } from '../interfaces/post.interface';

/**
 * DTO para coordenadas
 */
export class CoordinatesDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

/**
 * DTO para ubicación
 */
export class LocationDto {
  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  neighborhood: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

/**
 * DTO para crear una publicación
 */
export class CreatePostDto {
  @IsEnum(PostType, { message: 'Tipo de publicación debe ser "lost" o "found"' })
  type: PostType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  petName?: string;

  @IsEnum(PetType, { message: 'Tipo de mascota inválido' })
  petType: PetType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  color: string;

  @IsEnum(PetSize)
  size: PetSize;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  age?: number;

  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsPhoneNumber('CO', { message: 'Teléfono inválido para Colombia' })
  contactPhone: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsDateString()
  lostOrFoundDate: string;
}

/**
 * DTO para actualizar publicación
 */
export class UpdatePostDto {
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  petName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  breed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsPhoneNumber('CO')
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}

/**
 * DTO para filtrar publicaciones
 */
export class FilterPostDto {
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsEnum(PetType)
  petType?: PetType;

  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
