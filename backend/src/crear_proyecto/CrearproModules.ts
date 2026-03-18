/**
 * CrearproModule
 * -------------
 * Modulo NestJS para el feature `crear_proyecto` (Admin).
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrearproController } from './CrearproController';
import { CrearproService } from './CrearproService';
import { Proyecto } from '../entities/Proyecto';

@Module({
  imports: [TypeOrmModule.forFeature([Proyecto])],
  controllers: [CrearproController],
  providers: [CrearproService],
})
export class CrearproModule {}
