import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { VerproService } from './verpro.service';

@Controller('verpro')
export class VerproController {
  constructor(private readonly verproService: VerproService) {}

  @Get()
  async getProyectos() {
    return await this.verproService.findAll();
  }

  @Get(':id')
  async getProyectoById(@Param('id', ParseIntPipe) id: number) {
    return await this.verproService.findOne(id);
  }
}