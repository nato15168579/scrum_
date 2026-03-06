// src/ver_proyecto/verpro.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerproController } from './VerproController';
import { VerproService } from './VerproService';
import { Proyecto } from '../entities/Proyecto'; // <--- Verifica que el nombre del archivo coincida (Proyecto.ts)

@Module({
  imports: [
    // Esto es lo que registra la metadata localmente para este módulo
    TypeOrmModule.forFeature([Proyecto]) 
  ],
  controllers: [VerproController],
  providers: [VerproService],
})
export class VerproModule {}