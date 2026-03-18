/**
 * VerproModule
 * -----------
 * Modulo NestJS para el feature `ver_proyecto` (Admin).
 *
 * Registra controller + service y la entidad TypeORM usada en consultas de proyectos.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyecto } from '../entities/Proyecto';
import { VerproController } from './VerproController';
import { VerproService } from './VerproService';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto])],
  controllers: [VerproController],
  providers: [VerproService],
})
export class VerproModule {}

