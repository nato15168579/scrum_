import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Query('cedula') cedula: string) {
    // Convertimos la cédula a número porque en la DB es int
    return this.dashboardService.obtenerDatosDashboard(parseInt(cedula));
  }
}