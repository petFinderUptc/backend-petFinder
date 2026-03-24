import { Module } from '@nestjs/common';
import { LocationController } from '../../presentation/controllers/location.controller';
import { LocationService } from '../../application/services/location.service';
import { CosmosDbReportRepository, DatabaseModule } from '../../infrastructure/database';

@Module({
  imports: [DatabaseModule],
  controllers: [LocationController],
  providers: [
    LocationService,
    {
      provide: 'IReportRepository',
      useClass: CosmosDbReportRepository,
    },
  ],
  exports: [LocationService],
})
export class LocationModule {}
