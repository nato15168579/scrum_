/**
 * DashboardController (Student)
 * ----------------------------
 * Controlador HTTP para el dashboard del aprendiz (o vista student).
 *
 * Rutas:
 * - GET /dashboard-student?cedula=...
 *
 * Este modulo es independiente del dashboard administrador.
 */
import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './DashboardService';

@Controller('dashboard-student')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Query('cedula') cedula: string) {
    return this.dashboardService.obtenerDatosDashboard(parseInt(cedula));
  }
}
