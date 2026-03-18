/**
 * DashboardModule (Student)
 * ------------------------
 * Modulo NestJS que registra el controller y service del dashboard student.
 *
 * Nota:
 * - Usa repositorios de TypeORM para `Usuario` y `Proyecto`.
 * - Mantiene separado el flujo del admin para no mezclar contratos/respuestas.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './DashboardController';
import { DashboardService } from './DashboardService';
import { Usuario } from '../entities/Usuario';
import { Proyecto } from '../entities/Proyecto';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Proyecto])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
