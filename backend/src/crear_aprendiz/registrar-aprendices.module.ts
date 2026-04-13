import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrarAprendicesController } from './registrar-aprendices.controller';
import { RegistrarAprendicesService } from './registrar-aprendices.service';
import { Usuario } from '../entities/usuario';
import { ListaModule } from '../lista_aprendices/ListaModules';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    ListaModule,
  ],
  controllers: [RegistrarAprendicesController],
  providers: [RegistrarAprendicesService],
  exports: [RegistrarAprendicesService],
})
export class RegistrarAprendicesModule {}
