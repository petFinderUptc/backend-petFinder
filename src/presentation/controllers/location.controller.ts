import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PetSize, PetType, PostType } from '../../domain/enums';
import { LocationService } from '../../application/services/location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('geocode')
  async geocode(
    @Query('q') q?: string,
    @Query('limit') limit = '5',
  ): Promise<Array<{ displayName: string; lat: number; lon: number }>> {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 10) {
      throw new BadRequestException('El parametro limit debe ser un entero entre 1 y 10');
    }

    return this.locationService.searchAddress(q || '', parsedLimit);
  }

  @Get('search-address')
  async searchAddress(
    @Query('q') q?: string,
    @Query('limit') limit = '5',
  ): Promise<Array<{ displayName: string; lat: number; lon: number }>> {
    return this.geocode(q, limit);
  }

  @Get('reverse-geocode')
  async reverseGeocode(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ): Promise<{ displayName: string; lat: number; lon: number } | null> {
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
      throw new BadRequestException('Debes enviar lat y lon numericos');
    }

    return this.locationService.reverseGeocode(parsedLat, parsedLon);
  }

  @Get('nearby')
  async nearby(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('radiusKm') radiusKm = '5',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('species') species?: PetType,
    @Query('type') type?: PostType,
    @Query('size') size?: PetSize,
  ): Promise<{
    data: Array<{ reportId: string; distanceKm: number; lat: number; lon: number }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);
    const parsedRadiusKm = Number(radiusKm);
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
      throw new BadRequestException('Debes enviar lat y lon numericos');
    }

    if (!Number.isFinite(parsedRadiusKm) || parsedRadiusKm <= 0) {
      throw new BadRequestException('El parametro radiusKm debe ser mayor a 0');
    }

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('El parametro page debe ser un entero mayor o igual a 1');
    }

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('El parametro limit debe ser un entero entre 1 y 100');
    }

    return this.locationService.findNearbyReports({
      lat: parsedLat,
      lon: parsedLon,
      radiusKm: parsedRadiusKm,
      page: parsedPage,
      limit: parsedLimit,
      species,
      type,
      size,
    });
  }
}
