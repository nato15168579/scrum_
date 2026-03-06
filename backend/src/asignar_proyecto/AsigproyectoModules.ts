import { Module } from '@nestjs/common';
import { AsigProyectoController } from './AsigproyectoController';
import { AsigProyectoService } from './AsigproyectoService';

@Module({
  controllers: [AsigProyectoController],
  providers: [AsigProyectoService],
})
export class AsigProyectoModule {}