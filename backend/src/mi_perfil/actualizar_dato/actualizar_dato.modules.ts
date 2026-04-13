import { Module } from '@nestjs/common';
import { ActualizarDatoController } from './actualizar_dato.controller';
import { ActualizarDatoService } from './actualizar_dato.service';

@Module({
  controllers: [ActualizarDatoController],
  providers: [ActualizarDatoService],
})
export class ActualizarDatoModule {}