import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriasController } from './historias.controller';
import { HistoriasService } from './historias.service';
import { HistoriaUsuario } from '../../../entities/HistoriaUsuario';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriaUsuario])],
  controllers: [HistoriasController],
  providers: [HistoriasService],
})
export class HistoriasModule {}