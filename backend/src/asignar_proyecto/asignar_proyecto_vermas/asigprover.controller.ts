import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AsigProVerService } from './asigprover.service';


@Controller('proyectos')
export class AsigProVerController {
  constructor(private readonly asigProVerService: AsigProVerService) {}

  // @UseGuards(JwtAuthGuard) // Activa esto si manejas autenticación
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.asigProVerService.getProyectoDetalle(+id);
  }
}