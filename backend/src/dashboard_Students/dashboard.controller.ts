import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard-student')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Query('cedula') cedula: string) {
    return this.dashboardService.obtenerDatosDashboard(parseInt(cedula));
  }
}
