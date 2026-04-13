import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AprendizCriteriosController } from "./aprendizCriterios.controller";
import { AprendizCriteriosService } from "./aprendizCriterios.service";

import { CriteriosAceptacion } from "../entities/CriteriosAceptacion";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";

@Module({
  imports: [TypeOrmModule.forFeature([CriteriosAceptacion, UsuProDetPar, HistoriaUsuario])],
  controllers: [AprendizCriteriosController],
  providers: [AprendizCriteriosService],
})
export class AprendizCriteriosModule {}