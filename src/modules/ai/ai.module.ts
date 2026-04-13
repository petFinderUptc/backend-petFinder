import { Module } from '@nestjs/common';
import { EmbeddingService } from '../../application/services/embedding.service';

@Module({
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class AiModule {}
