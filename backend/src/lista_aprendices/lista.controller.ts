import { Controller, Get, Query } from '@nestjs/common';
import { ListaService } from './lista.service';

@Controller()
export class ListaController {
  constructor(private readonly listaService: ListaService) {}

  @Get('aprendices')
  async getAprendices() {
    return await this.listaService.findAllAprendices();
  }

  @Get('stats')
  async getStats(@Query('cedula') cedula: string) {
    return await this.listaService.getInstructorStats(cedula);
  }
}