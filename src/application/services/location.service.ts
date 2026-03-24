import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PetSize, PetType, PostStatus, PostType } from '../../domain/enums';
import { IReportRepository } from '../../domain/repositories';

export interface ResolvedCoordinates {
  lat: number;
  lon: number;
}

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lon: number;
}

export interface NearbyReportResult {
  reportId: string;
  distanceKm: number;
}

@Injectable()
export class LocationService {
  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
    private readonly configService: ConfigService,
  ) {}

  async searchAddress(query: string, limit = 5): Promise<GeocodingResult[]> {
    const normalized = (query || '').trim();
    if (normalized.length < 3) {
      throw new BadRequestException('El parametro q debe tener al menos 3 caracteres');
    }

    const safeLimit = Math.max(1, Math.min(limit || 5, 10));
    const baseUrl = this.configService.get<string>('location.geocodingBaseUrl');
    const countryCode = this.configService.get<string>('location.defaultCountryCode');
    const userAgent = this.configService.get<string>('location.userAgent');

    const url = new URL('/search', baseUrl);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', String(safeLimit));
    url.searchParams.set('q', normalized);
    if (countryCode) {
      url.searchParams.set('countrycodes', countryCode);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('No se pudo consultar el servicio de geocodificacion');
    }

    const payload = (await response.json()) as Array<Record<string, unknown>>;
    return payload.map((item) => ({
      displayName: String(item.display_name || ''),
      lat: Number(item.lat || 0),
      lon: Number(item.lon || 0),
    }));
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
    this.assertCoordinates(lat, lon);

    const baseUrl = this.configService.get<string>('location.geocodingBaseUrl');
    const userAgent = this.configService.get<string>('location.userAgent');

    const url = new URL('/reverse', baseUrl);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('No se pudo consultar el servicio de geocodificacion inversa');
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const displayName = String(payload.display_name || '');
    if (!displayName) {
      return null;
    }

    return {
      displayName,
      lat: Number(payload.lat || lat),
      lon: Number(payload.lon || lon),
    };
  }

  async resolveCoordinates(
    input: { lat?: number; lon?: number; locationQuery?: string },
    options?: { allowEmpty?: boolean },
  ): Promise<ResolvedCoordinates | null> {
    const hasLat = typeof input.lat === 'number';
    const hasLon = typeof input.lon === 'number';

    if (hasLat !== hasLon) {
      throw new BadRequestException('Debes enviar lat y lon juntos o usar locationQuery');
    }

    if (hasLat && hasLon) {
      this.assertCoordinates(input.lat as number, input.lon as number);
      return { lat: input.lat as number, lon: input.lon as number };
    }

    const locationQuery = (input.locationQuery || '').trim();
    if (locationQuery.length >= 3) {
      const geocoding = await this.searchAddress(locationQuery, 1);
      if (!geocoding.length) {
        throw new BadRequestException('No se encontraron coordenadas para la ubicacion indicada');
      }

      this.assertCoordinates(geocoding[0].lat, geocoding[0].lon);
      return {
        lat: geocoding[0].lat,
        lon: geocoding[0].lon,
      };
    }

    if (options?.allowEmpty) {
      return null;
    }

    throw new BadRequestException('Debes enviar lat/lon o locationQuery para ubicar el reporte');
  }

  async findNearbyReports(params: {
    lat: number;
    lon: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
    species?: PetType;
    type?: PostType;
    size?: PetSize;
  }): Promise<{
    data: Array<{
      reportId: string;
      distanceKm: number;
      lat: number;
      lon: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    this.assertCoordinates(params.lat, params.lon);

    const radiusKm = Math.max(0.1, Math.min(params.radiusKm || 5, 200));
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(params.limit || 20, 100));

    const reports = await this.reportRepository.findAll({
      status: PostStatus.ACTIVE,
      species: params.species,
      type: params.type,
      size: params.size,
    });

    const nearby = reports
      .map((report) => ({
        reportId: report.id,
        lat: report.lat,
        lon: report.lon,
        distanceKm: this.calculateDistanceKm(params.lat, params.lon, report.lat, report.lon),
      }))
      .filter((entry) => entry.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const total = nearby.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;

    return {
      data: nearby.slice(offset, offset + limit),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (value: number) => (value * Math.PI) / 180;

    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);

    const a =
      sinLat * sinLat + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinLon * sinLon;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Number((earthRadiusKm * c).toFixed(3));
  }

  private assertCoordinates(lat: number, lon: number): void {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw new BadRequestException('Latitud invalida');
    }

    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      throw new BadRequestException('Longitud invalida');
    }
  }
}
