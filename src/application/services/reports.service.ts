import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Report } from '../../domain/entities/report.entity';
import { PostStatus } from '../../domain/enums';
import { IReportRepository, ReportFilters } from '../../domain/repositories';
import { NotificationType } from '../../domain/entities';
import { CreateReportDto } from '../dtos/reports/create-report.dto';
import { UpdateReportDto } from '../dtos/reports/update-report.dto';
import { NotificationsService } from './notifications.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @Inject('IReportRepository')
    private readonly reportRepository: IReportRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createReport(userId: string, dto: CreateReportDto): Promise<Report> {
    this.validateImageUrl(dto.imageUrl);

    const report = new Report(
      '',
      userId,
      dto.species,
      dto.type,
      dto.status ?? PostStatus.ACTIVE,
      dto.description,
      dto.color,
      dto.breed,
      dto.size,
      dto.contact,
      dto.imageUrl,
      dto.lat,
      dto.lon,
      new Date(),
      new Date(),
      [],
    );

    const created = await this.reportRepository.create(report);

    try {
      await this.notificationsService.create(
        userId,
        NotificationType.UPDATE,
        'Reporte creado',
        `Tu reporte ${created.id} fue publicado correctamente.`,
        created.id,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo crear notificacion de creacion para reporte ${created.id}: ${error.message}`,
      );
    }

    return created;
  }

  async findAll(
    page: number,
    limit: number,
    filters?: Omit<ReportFilters, 'userId' | 'status'>,
  ): Promise<{
    data: Report[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const allActive = await this.reportRepository.findAll({
      ...filters,
      status: PostStatus.ACTIVE,
    });

    const total = allActive.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const data = allActive.slice(offset, offset + limit);

    return {
      data,
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

  async search(
    query: string,
    page: number,
    limit: number,
    filters?: Omit<ReportFilters, 'userId' | 'status' | 'search'>,
  ): Promise<{
    data: Report[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const allActive = await this.reportRepository.findAll({
      ...filters,
      search: query,
      status: PostStatus.ACTIVE,
    });

    const total = allActive.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const data = allActive.slice(offset, offset + limit);

    return {
      data,
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

  async exportDataset(): Promise<
    Array<{
      id: string;
      species: string;
      type: string;
      status: string;
      breed: string;
      createdAt: string;
      lat: number;
      lon: number;
      city: null;
      neighborhood: null;
    }>
  > {
    const reports = await this.reportRepository.findAll();

    return reports.map((report) => ({
      id: report.id,
      species: report.species,
      type: report.type,
      status: report.status,
      breed: report.breed,
      createdAt: report.createdAt.toISOString(),
      lat: report.lat,
      lon: report.lon,
      city: null,
      neighborhood: null,
    }));
  }

  async findById(id: string): Promise<Report> {
    const report = await this.reportRepository.findById(id);
    if (!report || !report.isActive()) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return report;
  }

  async findMyReports(userId: string): Promise<Report[]> {
    return this.reportRepository.findByUserId(userId);
  }

  async updateReport(id: string, userId: string, dto: UpdateReportDto): Promise<Report> {
    const report = await this.reportRepository.findById(id);
    if (!report) throw new NotFoundException('Reporte no encontrado');
    if (report.userId !== userId)
      throw new ForbiddenException('No tienes permiso para editar este reporte');

    if (dto.imageUrl) this.validateImageUrl(dto.imageUrl);

    report.update({
      species: dto.species,
      status: dto.status,
      description: dto.description,
      color: dto.color,
      breed: dto.breed,
      size: dto.size,
      contact: dto.contact,
      imageUrl: dto.imageUrl,
      lat: dto.lat,
      lon: dto.lon,
    });

    const updated = await this.reportRepository.update(id, report);

    try {
      await this.notificationsService.create(
        userId,
        NotificationType.UPDATE,
        'Reporte actualizado',
        `Tu reporte ${report.id} fue editado correctamente.`,
        report.id,
      );
    } catch (error) {
      this.logger.warn(`No se pudo crear notificacion para reporte ${report.id}: ${error.message}`);
    }

    return updated;
  }

  async removeReport(id: string, userId: string): Promise<void> {
    const report = await this.reportRepository.findById(id);
    if (!report) throw new NotFoundException('Reporte no encontrado');
    if (report.userId !== userId)
      throw new ForbiddenException('No tienes permiso para eliminar este reporte');

    report.deactivate();
    await this.reportRepository.update(id, report);
  }

  async getStats(): Promise<{ totalActive: number }> {
    const totalActive = await this.reportRepository.countActive();
    return { totalActive };
  }

  private validateImageUrl(imageUrl: string): void {
    if (imageUrl.startsWith('/uploads/')) {
      return;
    }

    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      throw new BadRequestException('imageUrl invalida');
    }
    if (!url.hostname.includes('blob.core.windows.net')) {
      throw new BadRequestException('imageUrl debe apuntar a Azure Blob Storage');
    }
  }
}
