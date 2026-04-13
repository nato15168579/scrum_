import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RegistrarAprendicesService } from './registrar-aprendices.service';
import { Usuario } from '../entities/usuario';

@Controller('registrar-aprendices')
export class RegistrarAprendicesController {
  constructor(private readonly service: RegistrarAprendicesService) {}

  @Post()
  async registrar(
    @Body() datos: Partial<Usuario> & { instructorCedula?: string | number },
  ) {
    return await this.service.crear(datos);
  }

  @Get('fichas-instructor')
  async obtenerFichasInstructor(@Query('cedula') cedula?: string) {
    return await this.service.obtenerFichasInstructor(cedula);
  }

  @Post('importar')
  async importarAprendices(
    @Body()
    payload: {
      instructorCedula?: string | number;
      usuarios?: Array<{
        documento?: string | number;
        tipoDocumento?: string;
        ficha?: string | number;
        nombre?: string;
        apellido?: string;
        sexo?: string;
        telefono?: string;
        email?: string;
      }>;
    },
  ) {
    return await this.service.importarAprendices(payload);
  }

  @Get()
  async obtenerTodos() {
    return await this.service.listar();
  }
}
