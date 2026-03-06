import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './DashboardController';
import { DashboardService } from './DashboardService';
import { Usuario } from '../entities/Usuario';
import { Proyecto } from '../entities/Proyecto';
import { Reuniones } from '../entities/Reuniones';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Proyecto, Reuniones])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}