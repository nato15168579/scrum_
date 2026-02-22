import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CrearproService } from './crearpro.service';

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
  async create(@Body() body: { nombre: string; objetivo: string; fecha: string; cedula: number }) {
    return await this.crearproService.createProject(body);
  }
}