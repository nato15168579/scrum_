import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ListaService } from './lista.service';

@Controller()
export class ListaController {
  constructor(private readonly listaService: ListaService) {}

  @Get('aprendices')
  async getAprendices() {
    return await this.listaService.findAllAprendices();
  }

  @Get('instructores')
  async getInstructores() {
    return await this.listaService.findAllInstructores();
  }

  @Get('stats')
  async getStats(@Query('cedula') cedula: string) {
    return await this.listaService.getInstructorStats(cedula);
  }

  @Post('users')
  async createAprendiz(
    @Body()
    payload: {
      cedula: string | number;
      nombre: string;
      apellidos: string;
      correo: string;
      telefono?: string;
      ficha?: string;
      tipoDocumento?: string;
      sexo?: string;
      password: string;
    },
  ) {
    return await this.listaService.createAprendiz(payload);
  }
}
