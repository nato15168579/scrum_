import { Controller, Put, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { CambiarContrasenaService } from './cambiar_contrasena.service';

@Controller('auth')
export class CambiarContrasenaController {
  constructor(private readonly cambiarService: CambiarContrasenaService) {}

  @Put('cambiar-password/:cedula')
  async cambiarPassword(
    @Param('cedula', ParseIntPipe) cedula: number,
    @Body() body: { passActual: string; passNueva: string },
  ) {
    const { passActual, passNueva } = body;

    if (!passActual || !passNueva) {
      throw new BadRequestException('La contraseña actual y la nueva son obligatorias');
    }

    return await this.cambiarService.actualizarPassword(cedula, passActual, passNueva);
  }
}