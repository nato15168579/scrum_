import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ListaService } from './ListaService';

@Controller()
export class ListaController {
  constructor(private readonly listaService: ListaService) {}

  @Get('aprendices')
  async getAprendices(@Query('cedula') cedula?: string) {
    return await this.listaService.findAllAprendices(cedula);
  }

  @Patch('aprendices/:cedula/estado')
  async updateAprendizEstado(
    @Param('cedula') cedula: string,
    @Body() payload: { estado: string },
  ) {
    return await this.listaService.updateAprendizEstado(cedula, payload.estado);
  }

  @Get('instructores')
  async getInstructores(@Query('cedula') cedula?: string) {
    return await this.listaService.findAllInstructores(cedula);
  }

  @Get('fichas')
  async getFichas() {
    return await this.listaService.findAllFichas();
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
