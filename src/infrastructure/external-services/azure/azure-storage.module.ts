import { Module } from '@nestjs/common';
import { AzureBlobStorageService } from './azure-blob-storage.service';
import { DatabaseModule } from '../../database';

@Module({
  imports: [DatabaseModule],
  providers: [AzureBlobStorageService],
  exports: [AzureBlobStorageService],
})
export class AzureStorageModule {}
