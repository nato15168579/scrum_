import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { IntegrantesService } from './integrantes.service';

@Controller('dashboard')
export class IntegrantesController {
  constructor(private readonly integrantesService: IntegrantesService) {}

  @Get('integrantes/:id')
  async getIntegrantes(@Param('id', ParseIntPipe) id: number) {
    return await this.integrantesService.obtenerIntegrantes(id);
  }

  @Get('aprendices-disponibles/:id')
  async getDisponibles(@Param('id', ParseIntPipe) id: number) {
    return await this.integrantesService.obtenerDisponibles(id);
  }

  @Get('roles-scrum')
  async getRoles() {
    return await this.integrantesService.obtenerRolesScrum();
  }

  @Post('eliminar-integrantes')
  async remove(@Body() body: { projectId: number; cedulas: number[] }) {
    return await this.integrantesService.eliminarIntegrantes(body.projectId, body.cedulas);
  }

  @Post('asignar-integrantes')
  async assign(@Body() body: { projectId: number; assignments: any[] }) {
    return await this.integrantesService.asignarIntegrantes(body.projectId, body.assignments);
  }
}