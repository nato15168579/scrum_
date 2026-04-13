import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ActualizarDatoService } from './actualizar_dato.service';

@Controller('usuario')
export class ActualizarDatoController {
  constructor(private readonly actualizarDatoService: ActualizarDatoService) {}

  @Get(':cedula')
  async getUsuario(@Param('cedula') cedula: string) {
    return this.actualizarDatoService.findOne(cedula);
  }

  @Put('actualizar/:cedula')
  async updateUsuario(@Param('cedula') cedula: string, @Body() data: any) {
    return this.actualizarDatoService.update(cedula, data);
  }
}