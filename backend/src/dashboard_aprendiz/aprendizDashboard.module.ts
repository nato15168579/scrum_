import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Usuario } from "../entities/Usuario";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Reuniones } from "../entities/Reuniones";
import { Observaciones } from "../entities/Observaciones";
import { Sprint } from "../entities/Sprint";

import { AprendizDashboardController } from "./aprendizDashboard.controller";
import { AprendizDashboardService } from "./aprendizDashboard.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      HistoriaUsuario,
      UsuProDetPar,
      Reuniones,
      Observaciones,
      Sprint,
    ]),
  ],
  controllers: [AprendizDashboardController],
  providers: [AprendizDashboardService],
})
export class AprendizDashboardModule {}