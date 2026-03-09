/**
 * Controlador HTTP del dashboard administrador.
 *
 * Expone una ruta de lectura para el resumen principal del panel admin.
 */

import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './DashboardService';

// Endpoint genÃ©rico para dashboard (entorno administrador)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Query('cedula') cedula: string) {
    // Convertimos la cÃ©dula a nÃºmero porque en la DB es int
    return this.dashboardService.obtenerDatosDashboard(parseInt(cedula));
  }
}
