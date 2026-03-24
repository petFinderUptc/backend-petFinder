import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure/azure-blob-storage.service';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly azureBlobStorageService: AzureBlobStorageService) {}

  @Get('signed-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar URL firmada para acceder a blob en Azure Storage',
    description:
      'Genera una URL firmada (SAS token) válida por 60 minutos para acceder a un blob específico en Azure Blob Storage',
  })
  @ApiQuery({
    name: 'blobName',
    required: true,
    type: String,
    example: 'pet-images/reports/abc123.jpg',
    description: 'Nombre del blob incluyendo ruta (ej: pet-images/reports/abc123.jpg)',
  })
  @ApiResponse({
    status: 200,
    description: 'URL firmada generada exitosamente',
    schema: {
      type: 'object',
      properties: {
        signedUrl: {
          type: 'string',
          example: 'https://petfinderimg.blob.core.windows.net/pet-images/...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetro blobName requerido o inválido',
  })
  @ApiResponse({
    status: 500,
    description: 'Error generando URL firmada (ej: credenciales Azure no configuradas)',
  })
  async getSignedUrl(@Query('blobName') blobName: string): Promise<{ signedUrl: string }> {
    const signedUrl = await this.azureBlobStorageService.generateSignedUrl(blobName);
    return { signedUrl };
  }
}
