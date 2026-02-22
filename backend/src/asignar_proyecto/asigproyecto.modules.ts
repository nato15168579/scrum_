import { Module } from '@nestjs/common';
import { AsigProyectoController } from './asigproyecto.controller';
import { AsigProyectoService } from './asigproyecto.service';

@Module({
  controllers: [AsigProyectoController],
  providers: [AsigProyectoService],
})
export class AsigProyectoModule {}