/**
 * CambiosSistemaController
 * ----------------------
 * API para listar cambios/observaciones y marcarlos como vistos.
 *
 * Consumido por:
 * - `CambiosDelSistemaAdmin.tsx`
 * - `HistorialObservacionesAdmin.tsx`
 */
import { Controller, Get, Param, ParseIntPipe, Patch, Query } from "@nestjs/common";
import { CambiosSistemaService } from "./CambiosSistemaService";

@Controller("cambios-sistema")
export class CambiosSistemaController {
  constructor(private readonly cambiosSistemaService: CambiosSistemaService) {}

  @Get()
  async listarCambios(
    @Query("estado") estado?: string,
    @Query("limit") limit?: string,
  ) {
    return await this.cambiosSistemaService.listarCambios({
      estado,
      limit,
    });
  }

  @Patch(":id/observado")
  async marcarComoObservado(@Param("id", ParseIntPipe) id: number) {
    return await this.cambiosSistemaService.marcarComoObservado(id);
  }
}
