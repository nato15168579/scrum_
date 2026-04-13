import { Controller, Get, Query } from "@nestjs/common";
import { AprendizDashboardService } from "./aprendizDashboard.service";

@Controller()
export class AprendizDashboardController {
  constructor(private readonly service: AprendizDashboardService) {}

  @Get("/aprendiz/dashboard")
  async get(@Query("cedula") cedula: string) {
    return this.service.getDashboardByCedula(Number(cedula));
  }
}