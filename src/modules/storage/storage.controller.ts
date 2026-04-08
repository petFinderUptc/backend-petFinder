import { Controller, Get, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly azureBlobStorageService: AzureBlobStorageService) {}

  @Get('signed-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar URL firmada para blob',
    description: 'Acepta blobName como ruta (reports/file.jpg) o URL completa de Azure Blob.',
  })
  @ApiQuery({
    name: 'blobName',
    required: true,
    type: String,
    example: 'https://petfinderimg.blob.core.windows.net/pet-images/reports/abc123.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'URL firmada generada exitosamente',
    schema: {
      type: 'object',
      properties: {
        signedUrl: {
          type: 'string',
          example:
            'https://petfinderimg.blob.core.windows.net/pet-images/reports/abc123.jpg?sig=...',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'blobName requerido o inválido' })
  async getSignedUrl(@Query('blobName') blobName?: string): Promise<{ signedUrl: string }> {
    if (!blobName?.trim()) {
      throw new BadRequestException('blobName es requerido');
    }

    const signedUrl = await this.azureBlobStorageService.generateSignedUrl(blobName);
    return { signedUrl };
  }
}
