import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";

import { AprendizCriteriosService } from "./aprendizCriterios.service";
import { CreateCriterioDto } from "./dto/create-criterio.dto";
import { UpdateCriterioDto } from "./dto/update-criterio.dto";

@Controller()
export class AprendizCriteriosController {
  constructor(private readonly service: AprendizCriteriosService) {}

  @Get("aprendiz/criterios-aceptacion")
  async list(@Query("cedula") cedula: string) {
    return this.service.listByCedula(Number(cedula));
  }

  @Get("aprendiz/criterios-aceptacion/historias")
  async historias(@Query("cedula") cedula: string) {
    return this.service.getHistoriasParaSelect(Number(cedula));
  }

  @Get("criterios-aceptacion/:id")
  async getOne(@Param("id") id: string, @Query("cedula") cedula: string) {
    return this.service.getById(Number(id), Number(cedula));
  }

  @Post("criterios-aceptacion")
  async create(
    @Query("cedula") cedula: string,
    @Body() dto: CreateCriterioDto
  ) {
    return this.service.create(dto, Number(cedula));
  }

  @Put("criterios-aceptacion/:id")
  async update(
    @Param("id") id: string,
    @Query("cedula") cedula: string,
    @Body() dto: UpdateCriterioDto
  ) {
    return this.service.update(Number(id), dto, Number(cedula));
  }

  @Delete("criterios-aceptacion/:id")
  async remove(@Param("id") id: string, @Query("cedula") cedula: string) {
    return this.service.remove(Number(id), Number(cedula));
  }
}