/**
 * Modulo de administracion de aprendices, instructores y fichas.
 *
 * Conecta el controlador REST con el servicio que concentra reglas de negocio
 * y compatibilidad de esquema sobre la base de datos.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaController } from './ListaController';
import { ListaService } from './ListaService';
import { Usuario } from '../entities/Usuario';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [ListaController],
  providers: [ListaService],
})
export class ListaModule {}
