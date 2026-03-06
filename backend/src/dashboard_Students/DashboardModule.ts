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
