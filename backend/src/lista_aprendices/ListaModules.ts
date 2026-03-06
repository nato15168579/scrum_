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