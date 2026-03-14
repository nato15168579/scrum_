import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CrearproService } from './CrearproService';

@Controller()
export class CrearproController {
  constructor(private readonly crearproService: CrearproService) {}

  // Ruta: GET /check-project?nombre=...
  @Get('check-project')
  async checkName(@Query('nombre') nombre: string) {
    return await this.crearproService.checkProjectExists(nombre);
  }

  // Ruta: POST /create-project
  @Post('create-project')
  async create(
    @Body()
    body: {
      nombre: string;
      objetivo: string;
      fecha: string;
      fechaInicio?: string;
      fechaFin?: string;
      cedula: number;
      fichaNumero?: number | string | null;
    },
  ) {
    return await this.crearproService.createProject(body);
  }
}
