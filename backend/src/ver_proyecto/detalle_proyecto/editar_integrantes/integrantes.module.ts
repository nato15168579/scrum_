import { Module } from '@nestjs/common';
import { IntegrantesController } from './integrantes.controller';
import { IntegrantesService } from './integrantes.service';

@Module({
  controllers: [IntegrantesController],
  providers: [IntegrantesService],
  exports: [IntegrantesService] 
})
export class IntegrantesModule {}