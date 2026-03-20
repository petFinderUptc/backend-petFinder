import { Module } from '@nestjs/common';
import { AzureBlobStorageService } from './azure-blob-storage.service';

@Module({
  providers: [AzureBlobStorageService],
  exports: [AzureBlobStorageService],
})
export class AzureStorageModule {}
