import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { AzureBlobStorageService } from '../../infrastructure/external-services/azure/azure-blob-storage.service';

@Module({
  controllers: [StorageController],
  providers: [AzureBlobStorageService],
  exports: [AzureBlobStorageService],
})
export class StorageModule {}
