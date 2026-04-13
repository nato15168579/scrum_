import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReunionesService } from './reuniones.service';
import { Reuniones } from '../../../entities/Reuniones';

@Controller('reuniones')
export class ReunionesController {
  constructor(private readonly reunionesService: ReunionesService) {}

  @Post()
  async create(@Body() data: Partial<Reuniones>) {
    return await this.reunionesService.create(data);
  }

  @Get('proyecto/:id')
  async findByProyecto(@Param('id') proId: string, @Query('tipo') tipoId: string) {
    return await this.reunionesService.findByProyecto(+proId, +tipoId);
  }
}