import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { AprendizHistoriasService } from "./aprendizHistorias.service";
import { CreateHistoriaDto } from "./dto/create-historia.dto";
import { UpdateHistoriaDto } from "./dto/update-historia.dto";

@Controller()
export class AprendizHistoriasController {
  constructor(private readonly service: AprendizHistoriasService) {}

  @Get("aprendiz/historias-usuario")
  list(@Query("cedula", ParseIntPipe) cedula: number) {
    return this.service.listByCedula(cedula);
  }

  @Get("aprendiz/historias-usuario/responsables")
  responsables(@Query("cedula", ParseIntPipe) cedula: number) {
    return this.service.listResponsablesProyecto(cedula);
  }

  @Get("historias-usuario/:id")
  getOne(
    @Param("id", ParseIntPipe) id: number,
    @Query("cedula", ParseIntPipe) cedula: number
  ) {
    return this.service.getOne(id, cedula);
  }

  @Post("historias-usuario")
  create(@Body() dto: CreateHistoriaDto) {
    return this.service.create(dto);
  }

  @Put("historias-usuario/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateHistoriaDto & { cedula?: number },
    @Query("cedula") cedulaQ?: string
  ) {
    const cedula = Number(cedulaQ ?? dto.cedula);
    return this.service.update(id, dto, cedula);
  }

  @Delete("historias-usuario/:id")
  remove(
    @Param("id", ParseIntPipe) id: number,
    @Query("cedula") cedulaQ?: string,
    @Body() body?: { cedula?: number }
  ) {
    const cedula = Number(cedulaQ ?? body?.cedula);
    return this.service.remove(id, cedula);
  }
}