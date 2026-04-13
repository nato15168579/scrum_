import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MiProyectoController } from "./aprendizMiProyecto.controller";
import { MiProyectoService } from "./aprendizMiProyecto.service";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Proyecto } from "../entities/Proyecto";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { Usuario } from "../entities/Usuario";

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuProDetPar, Proyecto, HistoriaUsuario, Usuario]),
  ],
  controllers: [MiProyectoController],
  providers: [MiProyectoService],
})
export class MiProyectoModule {}