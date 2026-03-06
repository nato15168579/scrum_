import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AsigProyectoService } from './AsigproyectoService';

@Controller()
export class AsigProyectoController {
  constructor(private readonly asigService: AsigProyectoService) {}

  @Get('proyectos')
  async getProyectos() {
    return this.asigService.getProyectos();
  }

  @Get('lista-aprendices-asignacion')
  async getAprendices() {
    return this.asigService.getAprendicesParaAsignacion();
  }

  @Get('roles-scrum')
  async getRolesScrum() {
    return this.asigService.getRolesScrum();
  }

  @Post('asignar-integrantes')
  async asignar(@Body() body: { projectId: number; assignments: any[] }) {
    return this.asigService.asignarIntegrantes(body.projectId, body.assignments);
  }
}