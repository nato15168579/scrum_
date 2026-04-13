import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MiPerfilService } from './mi_perfil.service';

@Controller('mi-perfil')
export class MiPerfilController { // <--- ASEGÚRATE DE QUE DIGA 'export'
  constructor(private readonly miPerfilService: MiPerfilService) {}

  @Get(':cedula')
  async getPerfil(@Param('cedula', ParseIntPipe) cedula: number) {
    return await this.miPerfilService.obtenerPerfil(cedula);
  }
}