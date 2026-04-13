import { Controller, Get, Post, Body } from '@nestjs/common';
import { AsigProyectoService } from './asigproyecto.service';

@Controller('asignacion') // Prefijo para todas las rutas: /asignacion/...
export class AsigProyectoController {
  constructor(private readonly asigService: AsigProyectoService) {}

  @Get('proyectos')
  async getProyectos() {
    return this.asigService.getProyectos();
  }

  @Get('aprendices')
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