import { Module } from '@nestjs/common';
import { ReportsController } from '../../presentation/controllers/reports.controller';
import { ReportsService } from '../../application/services/reports.service';
import { CosmosDbReportRepository } from '../../infrastructure/database/cosmosdb/cosmosdb-report.repository';
import { DatabaseModule } from '../../infrastructure/database';
import { NotificationsModule } from '../notifications/notifications.module';
import { AzureStorageModule } from '../../infrastructure/external-services/azure';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [DatabaseModule, NotificationsModule, AzureStorageModule, LocationModule],
  controllers: [ReportsController],
  providers: [ReportsService, { provide: 'IReportRepository', useClass: CosmosDbReportRepository }],
  exports: [ReportsService],
})
export class ReportsModule {}
