import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Reuniones } from "../entities/Reuniones";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Sprint } from "../entities/Sprint";
import { Usuario } from "../entities/Usuario";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";

import { AprendizReunionesController } from "./aprendizReuniones.controller";
import { AprendizReunionesService } from "./aprendizReuniones.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reuniones,
      UsuProDetPar,
      Sprint,
      Usuario,
      HistoriaUsuario,
    ]),
  ],
  controllers: [AprendizReunionesController],
  providers: [AprendizReunionesService],
})
export class AprendizReunionesModule {}