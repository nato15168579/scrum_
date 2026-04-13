import { Controller, Post, Body } from '@nestjs/common';
import { SugerenciaService } from './sugerencia.service';

@Controller('crear-observacion')
export class SugerenciaController {
  constructor(private readonly sugerenciaService: SugerenciaService) {}

  @Post()
  async crearSugerencia(
    @Body() body: { 
      projectId: number; 
      cedula: number; 
      titulo: string; 
      descripcion: string 
    },
  ) {
    return this.sugerenciaService.crearSugerencia(body);
  }
}