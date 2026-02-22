import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListaController } from './lista.controller';
import { ListaService } from './lista.service';
import { Usuario } from '../entities/Usuario';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [ListaController],
  providers: [ListaService],
})
export class ListaModule {}