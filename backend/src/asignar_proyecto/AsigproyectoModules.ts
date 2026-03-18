/**
 * AsigProyectoModule
 * -----------------
 * Modulo NestJS del feature `asignar_proyecto`.
 *
 * Agrupa controller + service para endpoints de asignacion de integrantes.
 */
import { Module } from '@nestjs/common';
import { AsigProyectoController } from './AsigproyectoController';
import { AsigProyectoService } from './AsigproyectoService';

@Module({
  controllers: [AsigProyectoController],
  providers: [AsigProyectoService],
})
export class AsigProyectoModule {}
