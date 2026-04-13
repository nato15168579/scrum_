import { Controller, Get, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { AsigIntegrantesService } from './asig-integrantes.service';

@Controller('asig-integrantes')
export class AsigIntegrantesController {
  constructor(private readonly asigService: AsigIntegrantesService) {}

  @Get('aprendices')
  async listarAprendices() {
    return await this.asigService.getAprendices();
  }

  @Get('proyecto/:id')
  async obtenerIntegrantes(@Param('id') id: string) {
    const proyectoId = parseInt(id);
    if (isNaN(proyectoId)) throw new BadRequestException('ID de proyecto inválido');
    return await this.asigService.getIntegrantesPorProyecto(proyectoId);
  }

  @Post(':id')
  async guardar(@Param('id') id: string, @Body() body: { assignments: any[] }) {
    const proyectoId = parseInt(id);
    if (isNaN(proyectoId)) {
      throw new BadRequestException('El ID del proyecto debe ser un número.');
    }
    return await this.asigService.guardarAsignacion(proyectoId, body.assignments);
  }
}