import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CriterioService } from './criterio.service';

@Controller('criterio-aceptacion')
export class CriterioController {
  constructor(private readonly criterioService: CriterioService) {}

  @Get(':proId/:hisId')
  async getCriterios(
    @Param('proId', ParseIntPipe) proId: number,
    @Param('hisId', ParseIntPipe) hisId: number,
  ) {
    return this.criterioService.findByProyectoAndHistoria(proId, hisId);
  }
}