import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { CosmosDbService } from '../../database/cosmosdb.service';
import { ImageDocument } from '../../database/types/image-document.type';

export interface AzureImageUploadResult {
  imageId: string;
  imageUrl: string;
  signedUrl?: string;
  blobName: string;
}

@Injectable()
export class AzureBlobStorageService {
  private readonly logger = new Logger(AzureBlobStorageService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cosmosDbService: CosmosDbService,
  ) {}

  async uploadImage(
    file: any,
    folder: 'posts' | 'avatars' | 'reports' = 'posts',
    userId = 'anonymous',
  ): Promise<AzureImageUploadResult> {
    if (!file) {
      throw new BadRequestException('Archivo de imagen requerido');
    }

    this.validateImage(file);

    const connectionString = this.configService.get<string>('azureStorage.connectionString');
    const containerName =
      this.configService.get<string>('azureStorage.containerName') || 'pet-images';

    if (!connectionString) {
      throw new InternalServerErrorException(
        'Azure Blob Storage no configurado: falta AZURE_STORAGE_CONNECTION_STRING',
      );
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);

      await containerClient.createIfNotExists();

      const extension = this.resolveExtension(file.originalname, file.mimetype);
      const blobName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });

      const imageUrl = blockBlobClient.url;
      const signedUrl = this.buildReadSignedUrlIfConfigured(containerName, blobName, imageUrl);

      const nowIso = new Date().toISOString();
      const imageId = `img_${Date.now()}_${Math.round(Math.random() * 1e6)}`;

      const imageDocument: ImageDocument = {
        id: imageId,
        userId,
        folder,
        containerName,
        blobName,
        imageUrl,
        signedUrl,
        contentType: file.mimetype,
        size: Number(file.size || 0),
        createdAt: nowIso,
        updatedAt: nowIso,
        isActive: true,
      };

      try {
        await this.cosmosDbService.getImagesContainer().items.create(imageDocument);
      } catch (metadataError) {
        // Revert blob upload if metadata cannot be persisted in DB.
        try {
          await containerClient.deleteBlob(blobName, { deleteSnapshots: 'include' });
        } catch {
          // best-effort cleanup
        }
        this.logger.error(
          `Error guardando metadata de imagen en Cosmos DB: ${metadataError.message}`,
        );
        throw new InternalServerErrorException(
          'No se pudo registrar la imagen en la base de datos',
        );
      }

      return {
        imageId,
        imageUrl,
        signedUrl,
        blobName,
      };
    } catch (error) {
      this.logger.error(`Error subiendo imagen a Azure Blob: ${error.message}`);
      throw new InternalServerErrorException('No se pudo cargar la imagen en Azure Blob Storage');
    }
  }

  async deleteBlobByUrl(url?: string): Promise<void> {
    if (!url) {
      return;
    }

    try {
      const connectionString = this.configService.get<string>('azureStorage.connectionString');
      const containerName =
        this.configService.get<string>('azureStorage.containerName') || 'pet-images';

      if (!connectionString || !url.includes('.blob.core.windows.net')) {
        return;
      }

      const blobName = this.getBlobNameFromUrl(url, containerName);
      if (!blobName) {
        return;
      }

      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      await containerClient.deleteBlob(blobName, { deleteSnapshots: 'include' });
    } catch {
      // Eliminación best-effort: no bloquear flujo principal
    }
  }

  async generateSignedUrl(blobName: string): Promise<string> {
    const containerName =
      this.configService.get<string>('azureStorage.containerName') || 'pet-images';
    const accountName = this.configService.get<string>('azureStorage.accountName');
    const accountKey = this.configService.get<string>('azureStorage.accountKey');

    if (!accountName || !accountKey) {
      throw new InternalServerErrorException(
        'Azure Blob Storage no configurado: falta AZURE_STORAGE_ACCOUNT_NAME o AZURE_STORAGE_ACCOUNT_KEY',
      );
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresInMinutes = this.configService.get<number>('azureStorage.sasExpiryMinutes') || 60;

    try {
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName,
          permissions: BlobSASPermissions.parse('r'),
          expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
        },
        sharedKeyCredential,
      ).toString();

      return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
    } catch (error) {
      this.logger.error(`Error generando Signed URL: ${error.message}`);
      throw new InternalServerErrorException('No se pudo generar URL firmada para el blob');
    }
  }

  private validateImage(file: any): void {
    const maxSizeBytes =
      (this.configService.get<number>('azureStorage.maxFileSizeMb') || 5) * 1024 * 1024;
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido. Solo jpg y png');
    }

    if (file.size > maxSizeBytes) {
      throw new BadRequestException('Archivo demasiado grande. El tamaño máximo es 5 MB');
    }
  }

  private resolveExtension(originalName: string, mimeType: string): string {
    const lower = (originalName || '').toLowerCase();
    if (lower.endsWith('.png') || mimeType === 'image/png') {
      return '.png';
    }
    return '.jpg';
  }

  private buildReadSignedUrlIfConfigured(
    containerName: string,
    blobName: string,
    fallbackUrl: string,
  ): string | undefined {
    const useSignedUrls = this.configService.get<boolean>('azureStorage.useSignedUrls') ?? true;
    const accountName = this.configService.get<string>('azureStorage.accountName');
    const accountKey = this.configService.get<string>('azureStorage.accountKey');

    if (!useSignedUrls || !accountName || !accountKey) {
      return undefined;
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresInMinutes = this.configService.get<number>('azureStorage.sasExpiryMinutes') || 60;

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      },
      sharedKeyCredential,
    ).toString();

    return `${fallbackUrl}?${sasToken}`;
  }

  private getBlobNameFromUrl(url: string, containerName: string): string | null {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length < 2 || parts[0] !== containerName) {
        return null;
      }
      return parts.slice(1).join('/');
    } catch {
      return null;
    }
  }
}
