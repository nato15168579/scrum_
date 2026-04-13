import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AprendizHistoriasController } from "./aprendizHistorias.controller";
import { AprendizHistoriasService } from "./aprendizHistorias.service";

import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Usuario } from "../entities/Usuario";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HistoriaUsuario,
      UsuProDetPar,
      Usuario,
    ]),
  ],
  controllers: [AprendizHistoriasController],
  providers: [AprendizHistoriasService],
  exports: [AprendizHistoriasService],
})
export class AprendizHistoriasModule {}