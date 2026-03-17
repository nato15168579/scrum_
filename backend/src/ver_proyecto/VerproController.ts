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

  @Get(':id')
  async getProyectoById(@Param('id', ParseIntPipe) id: number) {
    return await this.verproService.findOne(id);
  }
}
