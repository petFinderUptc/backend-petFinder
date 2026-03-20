import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from '../../application/services/reports.service';
import { CreateReportDto } from '../../application/dtos/reports/create-report.dto';
import { UpdateReportDto } from '../../application/dtos/reports/update-report.dto';
import { Report } from '../../domain/entities/report.entity';
import { PetSize, PetType, PostType } from '../../domain/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * POST /reports
   * Crea un nuevo reporte de mascota. Requiere autenticación.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: UserFromJwt,
    @Body() createReportDto: CreateReportDto,
  ): Promise<Report> {
    return this.reportsService.createReport(user.id, createReportDto);
  }

  /**
   * GET /reports
   * Lista pública de reportes activos con paginación y filtros opcionales.
   * Query params: page, limit, species, type, size
   */
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('species') species?: PetType,
    @Query('type') type?: PostType,
    @Query('size') size?: PetSize,
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
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('El parámetro page debe ser un entero mayor o igual a 1');
    }
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('El parámetro limit debe ser un entero entre 1 y 100');
    }

    return this.reportsService.findAll(parsedPage, parsedLimit, { species, type, size });
  }

  /**
   * GET /reports/my-reports
   * Retorna todos los reportes del usuario autenticado (cualquier estado).
   */
  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  async findMyReports(@CurrentUser() user: UserFromJwt): Promise<Report[]> {
    return this.reportsService.findMyReports(user.id);
  }

  /**
   * GET /reports/:id
   * Detalle público de un reporte activo. 404 si está inactivo o no existe.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findById(id);
  }

  /**
   * PUT /reports/:id
   * Actualización parcial de un reporte. Solo el autor puede editarlo.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserFromJwt,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    return this.reportsService.updateReport(id, user.id, updateReportDto);
  }

  /**
   * DELETE /reports/:id
   * Eliminación lógica (soft-delete). Solo el autor puede eliminar. Retorna 204.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: UserFromJwt): Promise<void> {
    return this.reportsService.removeReport(id, user.id);
  }
}
