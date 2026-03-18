/**
 * VerproController
 * ---------------
 * Endpoints HTTP consumidos por el admin para ver/editar proyectos.
 *
 * Nota: los cuerpos (Body) se tipan como objetos simples para mantener compatibilidad
 * con el frontend actual. En una fase futura se recomienda migrar a DTOs con validacion.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { VerproService } from './VerproService';

@Controller('verpro')
export class VerproController {
  constructor(private readonly verproService: VerproService) {}

  @Get()
  async getProyectos() {
    return await this.verproService.findAll();
  }

  @Get(':id/detalle-admin')
  async getProyectoDetalleAdmin(@Param('id', ParseIntPipe) id: number) {
    return await this.verproService.findAdminDetalle(id);
  }

  @Patch(':id/detalle-admin')
  async updateProyectoDetalleAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      proDescription?: string | null;
      proObjetivoGeneral?: string | null;
      proObjetivosEspecificos?: string | null;
      proJustificacion?: string | null;
    },
  ) {
    return await this.verproService.updateAdminDetalle(id, body);
  }

  @Get(':id/aprendices-edicion')
  async getProyectoAprendicesEditor(@Param('id', ParseIntPipe) id: number) {
    return await this.verproService.findAdminAprendicesEditor(id);
  }

  @Post(':id/aprendices')
  async addAprendizToProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cedula: string | number; detParId?: number },
  ) {
    return await this.verproService.addAprendizToProyecto(
      id,
      body.cedula,
      body.detParId,
    );
  }

  @Post(':id/aprendices/guardar')
  async saveProyectoAprendices(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      addCedulas?: Array<string | number>;
      removeCedulas?: Array<string | number>;
    },
  ) {
    return await this.verproService.saveProyectoAprendices(id, body);
  }

  @Patch(':id/aprendices/:cedula')
  async updateAprendizProyectoRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('cedula') cedula: string,
    @Body() body: { detParId: number },
  ) {
    return await this.verproService.updateAprendizProyectoRole(
      id,
      cedula,
      body.detParId,
    );
  }

  @Delete(':id/aprendices/:cedula')
  async removeAprendizFromProyecto(
    @Param('id', ParseIntPipe) id: number,
    @Param('cedula') cedula: string,
  ) {
    return await this.verproService.removeAprendizFromProyecto(id, cedula);
  }

  @Post(':id/historias')
  async createHistoriaUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      titulo?: string | null;
      descripcion?: string | null;
      puntaje?: number | string | null;
      numeroSprint?: number | string | null;
      actorCedula?: number | string | null;
    },
  ) {
    return await this.verproService.createHistoriaUsuario(id, body);
  }

  @Patch(':id/historias/:hisId')
  async updateHistoriaUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Param('hisId', ParseIntPipe) hisId: number,
    @Body()
    body: {
      titulo?: string | null;
      descripcion?: string | null;
      puntaje?: number | string | null;
      numeroSprint?: number | string | null;
    },
  ) {
    return await this.verproService.updateHistoriaUsuario(id, hisId, body);
  }

  @Delete(':id/historias/:hisId')
  async deleteHistoriaUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Param('hisId', ParseIntPipe) hisId: number,
  ) {
    return await this.verproService.deleteHistoriaUsuario(id, hisId);
  }

  @Post(':id/criterios')
  async createCriterioAceptacion(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      descripcion?: string | null;
      tiempo?: string | null;
      hisId?: number | string | null;
      actorCedula?: number | string | null;
    },
  ) {
    return await this.verproService.createCriterioAceptacion(id, body);
  }

  @Patch(':id/criterios/:criId')
  async updateCriterioAceptacion(
    @Param('id', ParseIntPipe) id: number,
    @Param('criId', ParseIntPipe) criId: number,
    @Body()
    body: {
      descripcion?: string | null;
      tiempo?: string | null;
      hisId?: number | string | null;
      actorCedula?: number | string | null;
    },
  ) {
    return await this.verproService.updateCriterioAceptacion(id, criId, body);
  }

  @Delete(':id/criterios/:criId')
  async deleteCriterioAceptacion(
    @Param('id', ParseIntPipe) id: number,
    @Param('criId', ParseIntPipe) criId: number,
  ) {
    return await this.verproService.deleteCriterioAceptacion(id, criId);
  }

  @Post(':id/sugerencias')
  async createSugerencia(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      descripcion?: string | null;
      actorCedula?: number | string | null;
    },
  ) {
    return await this.verproService.createSugerencia(id, body);
  }

  @Patch(':id/sugerencias/:obsId')
  async updateSugerencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('obsId', ParseIntPipe) obsId: number,
    @Body()
    body: {
      descripcion?: string | null;
      actorCedula?: number | string | null;
    },
  ) {
    return await this.verproService.updateSugerencia(id, obsId, body);
  }

  @Delete(':id/sugerencias/:obsId')
  async deleteSugerencia(
    @Param('id', ParseIntPipe) id: number,
    @Param('obsId', ParseIntPipe) obsId: number,
  ) {
    return await this.verproService.deleteSugerencia(id, obsId);
  }

  @Get(':id')
  async getProyectoById(@Param('id', ParseIntPipe) id: number) {
    return await this.verproService.findOne(id);
  }
}
