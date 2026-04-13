import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { AprendizReunionesService } from "./aprendizReuniones.service";
import { CreateReunionDto } from "./dto/create-reunion.dto";
import { UpdateReunionInformeDto } from "./dto/update-reunion-informe.dto";

@Controller("aprendiz/reuniones")
export class AprendizReunionesController {
  constructor(
    private readonly aprendizReunionesService: AprendizReunionesService
  ) {}

  @Get()
  async findByAprendiz(@Query("cedula") cedula: string) {
    return this.aprendizReunionesService.findByAprendizCedula(Number(cedula));
  }

  @Get(":id/aprendices")
  async findAprendicesProyectoByReunion(
    @Param("id") id: string,
    @Query("cedula") cedula: string
  ) {
    return this.aprendizReunionesService.findAprendicesProyectoByReunion(
      Number(id),
      Number(cedula)
    );
  }

  @Post()
  async createByAprendiz(
    @Query("cedula") cedula: string,
    @Body() dto: CreateReunionDto
  ) {
    return this.aprendizReunionesService.createByAprendizCedula(
      Number(cedula),
      dto
    );
  }

  @Put(":id")
  async updateByAprendiz(
    @Param("id") id: string,
    @Query("cedula") cedula: string,
    @Body() dto: CreateReunionDto
  ) {
    return this.aprendizReunionesService.updateByAprendizCedula(
      Number(id),
      Number(cedula),
      dto
    );
  }

  @Patch(":id/informe")
  async updateInformeByResponsable(
    @Param("id") id: string,
    @Query("cedula") cedula: string,
    @Body() dto: UpdateReunionInformeDto
  ) {
    return this.aprendizReunionesService.updateInformeByResponsable(
      Number(id),
      Number(cedula),
      dto
    );
  }
}