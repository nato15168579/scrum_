import { Controller, Get, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { DetproService } from './detpro.service';

@Controller() 
export class DetproController {
  constructor(private readonly detproService: DetproService) {}

  @Get('verpro/:id')
  async getProject(@Param('id', ParseIntPipe) id: number) {
    const proyecto = await this.detproService.getProjectById(id);
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    return proyecto;
  }

  @Get('integrantes/:id')
  async getIntegrantes(@Param('id', ParseIntPipe) id: number) {
    return await this.detproService.getIntegrantes(id);
  }
  
}