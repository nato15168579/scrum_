/**
 * AsigProVerModule
 * ---------------
 * Modulo NestJS para el feature `asignar_proyecto_vermas`.
 *
 * Exporta el service porque puede ser reutilizado por otros modulos del flujo
 * de asignacion si se requiere.
 */
import { Module } from '@nestjs/common';
import { AsigProVerController } from './AsigproverController';
import { AsigProVerService } from './AsigproverService';

@Module({
  controllers: [AsigProVerController],
  providers: [AsigProVerService],
  exports: [AsigProVerService],
})
export class AsigProVerModule {}
