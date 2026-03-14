import { Report } from '../entities/report.entity';
import { PetSize, PetType, PostStatus, PostType } from '../enums';

export interface ReportFilters {
  species?: PetType;
  type?: PostType;
  status?: PostStatus;
  size?: PetSize;
  userId?: string;
}

export interface IReportRepository {
  create(report: Report): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findAll(filters?: ReportFilters): Promise<Report[]>;
  findByUserId(userId: string): Promise<Report[]>;
  update(id: string, report: Report): Promise<Report>;
  delete(id: string): Promise<void>;
  countActive(): Promise<number>;
}
