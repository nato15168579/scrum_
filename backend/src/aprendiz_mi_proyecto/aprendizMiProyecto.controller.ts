import { Controller, Get, Query } from "@nestjs/common";
import { MiProyectoService } from "./aprendizMiProyecto.service";

@Controller("aprendiz")
export class MiProyectoController {
  constructor(private readonly service: MiProyectoService) {}

  @Get("mi-proyecto")
  async getMiProyecto(@Query("cedula") cedula: string) {
    const c = Number(cedula);
    if (!c) return { error: "cedula requerida" };

    return this.service.getMiProyectoByCedula(c);
  }

  @Get("mi-proyecto/detalle")
  async getMiProyectoDetalle(@Query("cedula") cedula: string) {
    const c = Number(cedula);
    if (!c) return { error: "cedula requerida" };

    return this.service.getMiProyectoDetalleByCedula(c);
  }
}