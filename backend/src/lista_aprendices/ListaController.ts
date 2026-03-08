import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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

  @Patch('aprendices/:cedula')
  async updateAprendiz(
    @Param('cedula') cedula: string,
    @Body()
    payload: {
      nombre?: string;
      apellidos?: string;
      correo?: string;
      telefono?: string;
      sexo?: string;
      ficha?: string | number;
      estado?: string;
    },
  ) {
    return await this.listaService.updateAprendiz(cedula, payload);
  }

  @Delete('aprendices/:cedula')
  async deleteAprendiz(@Param('cedula') cedula: string) {
    return await this.listaService.deleteAprendiz(cedula);
  }

  @Get('instructores')
  async getInstructores(@Query('cedula') cedula?: string) {
    return await this.listaService.findAllInstructores(cedula);
  }

  @Patch('instructores/:cedula')
  async updateInstructor(
    @Param('cedula') cedula: string,
    @Body()
    payload: {
      nombre?: string;
      apellidos?: string;
      correo?: string;
      telefono?: string;
      sexo?: string;
      especializacion?: string;
      fichas?: Array<string | number>;
    },
  ) {
    return await this.listaService.updateInstructor(cedula, payload);
  }

  @Delete('instructores/:cedula')
  async deleteInstructor(@Param('cedula') cedula: string) {
    return await this.listaService.deleteInstructor(cedula);
  }

  @Get('fichas')
  async getFichas() {
    return await this.listaService.findAllFichas();
  }

  @Get('fichas/options')
  async getFichaOptions() {
    return await this.listaService.getFichaCatalogOptions();
  }

  @Post('fichas')
  async createFicha(
    @Body()
    payload: {
      numero: string | number;
      nombre: string;
      programa: string;
      estado?: 'Activa' | 'Inactiva';
      allowCustomCatalogValues?: boolean;
    },
  ) {
    return await this.listaService.createFicha(payload);
  }

  @Get('stats')
  async getStats(@Query('cedula') cedula: string) {
    return await this.listaService.getInstructorStats(cedula);
  }

  @Post('users')
  async createUsuario(
    @Body()
    payload: {
      cedula: string | number;
      nombre: string;
      apellidos: string;
      correo?: string;
      telefono?: string;
      ficha?: string;
      tipoDocumento?: string;
      sexo?: string;
      especializacion?: string;
      tipoUsuario?: 'aprendiz' | 'instructor';
      password?: string;
    },
  ) {
    return await this.listaService.createUsuario(payload);
  }

  @Post('users/import')
  async importUsuarios(
    @Body()
    payload: {
      usuarios: Array<{
        documento: string | number;
        tipoDocumento?: string;
        ficha?: string | number;
        nombre: string;
        apellido: string;
        sexo?: string;
        telefono?: string;
        email?: string;
        especializacion?: string;
        tipoUsuario?: 'aprendiz' | 'instructor' | string;
      }>;
    },
  ) {
    return await this.listaService.importUsuarios(payload.usuarios);
  }
}
