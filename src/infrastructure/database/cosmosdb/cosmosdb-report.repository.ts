import { Container } from '@azure/cosmos';
import { Injectable, Logger } from '@nestjs/common';
import { Report } from '../../../domain/entities/report.entity';
import { PostStatus } from '../../../domain/enums';
import { IReportRepository, ReportFilters } from '../../../domain/repositories';
import { CosmosDbService } from '../cosmosdb.service';
import { ReportDocument } from '../types/report-document.type';

@Injectable()
export class CosmosDbReportRepository implements IReportRepository {
  private readonly logger = new Logger(CosmosDbReportRepository.name);

  constructor(private readonly cosmosDbService: CosmosDbService) {}

  private getContainer(): Container {
    return this.cosmosDbService.getReportsContainer();
  }

  async create(report: Report): Promise<Report> {
    const id = report.id || `report_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const now = new Date();
    const document = this.toDocument({
      ...report,
      id,
      createdAt: now,
      updatedAt: now,
    } as Report);

    const { resource } = await this.getContainer().items.create(document);
    this.logger.log(`Report created in Cosmos DB: ${resource?.id}`);
    return this.toDomain(resource);
  }

  async findById(id: string): Promise<Report | null> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: id }],
      })
      .fetchAll();

    return resources.length === 0 ? null : this.toDomain(resources[0]);
  }

  async findAll(filters?: ReportFilters): Promise<Report[]> {
    const conditions: string[] = [];
    const parameters: Array<{ name: string; value: any }> = [];

    if (filters?.species) {
      conditions.push('c.species = @species');
      parameters.push({ name: '@species', value: filters.species });
    }
    if (filters?.type) {
      conditions.push('c.type = @type');
      parameters.push({ name: '@type', value: filters.type });
    }
    if (filters?.status) {
      conditions.push('c.status = @status');
      parameters.push({ name: '@status', value: filters.status });
    }
    if (filters?.size) {
      conditions.push('c.size = @size');
      parameters.push({ name: '@size', value: filters.size });
    }
    if (filters?.userId) {
      conditions.push('c.userId = @userId');
      parameters.push({ name: '@userId', value: filters.userId });
    }
    if (filters?.search) {
      conditions.push(
        '(CONTAINS(c.species, @search, true) OR CONTAINS(c.description, @search, true) OR CONTAINS(c.breed, @search, true))',
      );
      parameters.push({ name: '@search', value: filters.search });
    }
    if (filters?.color) {
      conditions.push('CONTAINS(c.color, @color, true)');
      parameters.push({ name: '@color', value: filters.color });
    }
    if (filters?.breed) {
      conditions.push('CONTAINS(c.breed, @breed, true)');
      parameters.push({ name: '@breed', value: filters.breed });
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM c ${where} ORDER BY c.createdAt DESC`;

    const { resources } = await this.getContainer().items.query({ query, parameters }).fetchAll();

    return resources.map((r) => this.toDomain(r));
  }

  async findByUserId(userId: string): Promise<Report[]> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
        parameters: [{ name: '@userId', value: userId }],
      })
      .fetchAll();

    return resources.map((r) => this.toDomain(r));
  }

  async update(id: string, report: Report): Promise<Report> {
    const document = this.toDocument(report);
    const { resource } = await this.getContainer().item(id, id).replace(document);
    return this.toDomain(resource);
  }

  async delete(id: string): Promise<void> {
    await this.getContainer().item(id, id).delete();
  }

  async countActive(): Promise<number> {
    const { resources } = await this.getContainer()
      .items.query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.status = @status',
        parameters: [{ name: '@status', value: PostStatus.ACTIVE }],
      })
      .fetchAll();
    return resources[0] ?? 0;
  }

  private toDomain(resource: any): Report {
    return Report.fromPlainObject({
      id: resource.id,
      userId: resource.userId,
      species: resource.species,
      type: resource.type,
      status: resource.status,
      description: resource.description,
      color: resource.color,
      breed: resource.breed ?? '',
      size: resource.size,
      contact: resource.contact,
      imageUrl: resource.imageUrl,
      lat: resource.lat ?? 0,
      lon: resource.lon ?? 0,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt ?? resource.createdAt,
      embedding: resource.embedding ?? [],
    });
  }

  private toDocument(report: Report): ReportDocument {
    return {
      id: report.id,
      userId: report.userId,
      species: report.species,
      type: report.type,
      status: report.status,
      isActive: report.status === PostStatus.ACTIVE,
      description: report.description,
      color: report.color,
      breed: report.breed,
      size: report.size,
      contact: report.contact,
      imageUrl: report.imageUrl,
      lat: report.lat,
      lon: report.lon,
      createdAt:
        report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
      updatedAt:
        report.updatedAt instanceof Date ? report.updatedAt.toISOString() : report.updatedAt,
      embedding: report.embedding ?? [],
    };
  }
}
