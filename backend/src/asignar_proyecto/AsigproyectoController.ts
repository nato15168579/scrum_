/**
 * AsigProyectoController
 * ---------------------
 * Endpoints HTTP para el flujo de asignacion de integrantes a proyectos.
 *
 * Nota: este controller no aplica autenticacion por defecto. En produccion se
 * recomienda proteger estas rutas con guards/roles del lado del backend.
 */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AsigProyectoService } from './AsigproyectoService';

interface AssignmentInput {
  cedula: number;
  rolId: number;
}

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
  async asignar(
    @Body() body: { projectId: number; assignments: AssignmentInput[] },
  ) {
    return this.asigService.asignarIntegrantes(body.projectId, body.assignments);
  }
}
