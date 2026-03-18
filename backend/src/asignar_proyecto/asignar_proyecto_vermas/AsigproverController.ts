/**
 * AsigProVerController
 * -------------------
 * Endpoints para consultar el detalle basico de un proyecto dentro del flujo
 * de asignacion (pantalla "ver mas").
 */

import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AsigProVerService } from './AsigproverService';

@Controller('proyectos')
export class AsigProVerController {
  constructor(private readonly asigProVerService: AsigProVerService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.asigProVerService.getProyectoDetalle(id);
  }
}

