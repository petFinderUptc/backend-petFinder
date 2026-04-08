import { Module } from '@nestjs/common';
import { AzureStorageModule } from '../../infrastructure/external-services/azure';
import { StorageController } from './storage.controller';

@Module({
  imports: [AzureStorageModule],
  controllers: [StorageController],
})
export class StorageModule {}
