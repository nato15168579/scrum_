import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { AprendizObservacionesService } from "./aprendizObservaciones.service";

@Controller("aprendiz/observaciones")
export class AprendizObservacionesController {
  constructor(
    private readonly aprendizObservacionesService: AprendizObservacionesService
  ) {}

  @Get()
  async findByAprendiz(@Query("cedula") cedula: string) {
    return this.aprendizObservacionesService.findByAprendizCedula(
      Number(cedula)
    );
  }

  @Patch(":id/toggle-visto")
  async toggleVisto(
    @Param("id") id: string,
    @Query("cedula") cedula: string
  ) {
    return this.aprendizObservacionesService.toggleVisto(
      Number(id),
      Number(cedula)
    );
  }
}