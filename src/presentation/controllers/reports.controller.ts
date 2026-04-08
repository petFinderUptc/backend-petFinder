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
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ReportsService } from '../../application/services/reports.service';
import { CreateReportDto } from '../../application/dtos/reports/create-report.dto';
import { UpdateReportDto } from '../../application/dtos/reports/update-report.dto';
import { Report } from '../../domain/entities/report.entity';
import { PetSize, PetType, PostType } from '../../domain/enums';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser, UserFromJwt } from '../decorators/current-user.decorator';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure';

@ApiTags('Reports')
@ApiBearerAuth('JWT')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly azureBlobStorageService: AzureBlobStorageService,
  ) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException('Solo se permiten imagenes jpg, png o webp'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @CurrentUser() user: UserFromJwt,
    @UploadedFile() file: any,
  ): Promise<{ imageId: string; imageUrl: string; signedUrl?: string }> {
    if (!file) {
      throw new BadRequestException('Archivo de imagen requerido');
    }

    try {
      const result = await this.azureBlobStorageService.uploadImage(file, 'reports', user.id);
      return {
        imageId: result.imageId,
        imageUrl: result.imageUrl,
        signedUrl: result.signedUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('No fue posible cargar la imagen en este momento');
    }
  }

  /**
   * POST /reports
   * Crea un nuevo reporte de mascota. Requiere autenticación.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Crear reporte',
    description: 'Crea un nuevo reporte de mascota (requiere JWT)',
  })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({ status: 201, description: 'Reporte creado', type: Report })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  @ApiOperation({
    summary: 'Listar reportes',
    description: 'Listado público de reportes con paginación y filtros',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página', type: Number })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad de items por página',
    type: Number,
  })
  @ApiQuery({ name: 'species', required: false, description: 'Tipo de mascota', enum: PetType })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de publicación', enum: PostType })
  @ApiQuery({ name: 'size', required: false, description: 'Tamaño mascota', enum: PetSize })
  @ApiResponse({ status: 200, description: 'Listado obtenido', type: [Report] })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
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

    return this.reportsService.findAll(parsedPage, parsedLimit, { search, species, type, size });
  }

  @Get('search')
  async search(
    @Query('query') query: string,
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

    if (!query || query.trim().length < 2) {
      throw new BadRequestException('El parámetro query debe tener al menos 2 caracteres');
    }
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('El parámetro page debe ser un entero mayor o igual a 1');
    }
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new BadRequestException('El parámetro limit debe ser un entero entre 1 y 100');
    }

    return this.reportsService.search(query.trim(), parsedPage, parsedLimit, {
      species,
      type,
      size,
    });
  }

  @Get('export')
  async exportJson(): Promise<
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
    return this.reportsService.exportDataset();
  }

  @Get('export/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(): Promise<string> {
    const rows = await this.reportsService.exportDataset();
    const header = 'id,species,type,status,breed,createdAt,lat,lon,city,neighborhood';

    const csvRows = rows.map((row) =>
      [
        row.id,
        row.species,
        row.type,
        row.status,
        row.breed,
        row.createdAt,
        row.lat,
        row.lon,
        row.city ?? '',
        row.neighborhood ?? '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    );

    return [header, ...csvRows].join('\n');
  }

  /**
   * GET /reports/my-reports
   * Retorna todos los reportes del usuario autenticado (cualquier estado).
   */
  @Get('my-reports')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mis reportes',
    description: 'Retorna reportes del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Reportes devueltos', type: [Report] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findMyReports(@CurrentUser() user: UserFromJwt): Promise<Report[]> {
    return this.reportsService.findMyReports(user.id);
  }

  /**
   * GET /reports/:id
   * Detalle público de un reporte activo. 404 si está inactivo o no existe.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Reporte por id',
    description: 'Obtiene información de un reporte por su id',
  })
  @ApiParam({ name: 'id', description: 'ID del reporte', type: String })
  @ApiResponse({ status: 200, description: 'Reporte encontrado', type: Report })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
  async findOne(@Param('id') id: string): Promise<Report> {
    return this.reportsService.findById(id);
  }

  /**
   * PUT /reports/:id
   * Actualización parcial de un reporte. Solo el autor puede editarlo.
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar reporte', description: 'Edita un reporte propio' })
  @ApiParam({ name: 'id', description: 'ID del reporte', type: String })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({ status: 200, description: 'Reporte actualizado', type: Report })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No permitido' })
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
  @ApiOperation({
    summary: 'Eliminar reporte',
    description: 'Elimina lógicamente un reporte propio',
  })
  @ApiParam({ name: 'id', description: 'ID del reporte', type: String })
  @ApiResponse({ status: 204, description: 'Reporte eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No permitido' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserFromJwt): Promise<void> {
    return this.reportsService.removeReport(id, user.id);
  }
}
