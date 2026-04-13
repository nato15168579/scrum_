import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Observaciones } from "../entities/Observaciones";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { AprendizObservacionesController } from "./aprendizObservaciones.controller";
import { AprendizObservacionesService } from "./aprendizObservaciones.service";

@Module({
  imports: [TypeOrmModule.forFeature([Observaciones, UsuProDetPar])],
  controllers: [AprendizObservacionesController],
  providers: [AprendizObservacionesService],
  exports: [AprendizObservacionesService],
})
export class AprendizObservacionesModule {}