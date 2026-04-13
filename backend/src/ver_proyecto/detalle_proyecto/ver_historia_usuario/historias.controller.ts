import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HistoriasService } from './historias.service';

@Controller('historias')
export class HistoriasController {
  constructor(private readonly historiasService: HistoriasService) {}

  // GET /historias/proyecto/5 -> Trae el backlog del proyecto 5
  @Get('proyecto/:proId')
  async getByProyecto(@Param('proId', ParseIntPipe) proId: number) {
    return await this.historiasService.findByProyecto(proId);
  }

  // GET /historias/proyecto/5/hu/1 -> Trae la HU 1 del proyecto 5
  @Get('proyecto/:proId/hu/:hisId')
  async getOne(
    @Param('proId', ParseIntPipe) proId: number,
    @Param('hisId', ParseIntPipe) hisId: number,
  ) {
    return await this.historiasService.findOne(hisId, proId);
  }
}