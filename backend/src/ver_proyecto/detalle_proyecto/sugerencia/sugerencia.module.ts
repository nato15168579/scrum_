import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SugerenciaController } from './sugerencia.controller';
import { SugerenciaService } from './sugerencia.service';
import { Observaciones } from '../../../entities/Observaciones'; 

@Module({
  imports: [
    // Importante para que el Repositorio funcione en el Service
    TypeOrmModule.forFeature([Observaciones])
  ],
  controllers: [SugerenciaController],
  providers: [SugerenciaService],
})
export class SugerenciaModule {}