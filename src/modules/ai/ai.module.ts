import { Module } from '@nestjs/common';
import { EmbeddingService } from '../../application/services/embedding.service';
import { VisionService } from '../../application/services/vision.service';

@Module({
  providers: [EmbeddingService, VisionService],
  exports: [EmbeddingService, VisionService],
})
export class AiModule {}
