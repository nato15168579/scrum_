/**
 * Controlador principal del modulo administrativo de usuarios y fichas.
 *
 * Expone endpoints de aprendices, instructores, fichas e importacion. Algunas
 * rutas aceptan mas de un verbo HTTP por compatibilidad operativa.
 */

import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ListaService } from './ListaService';
import {
  CreateFichaDto,
  CreateUsuarioDto,
  ImportUsuarioDto,
  UpdateAprendizDto,
  UpdateFichaDto,
  UpdateInstructorDto,
} from './ListaTypes';

@Controller()
export class ListaController {
  constructor(private readonly listaService: ListaService) {}

  @Get('aprendices')
  async getAprendices(@Query('cedula') cedula?: string) {
    return await this.listaService.findAllAprendices(cedula);
  }

  @Patch('aprendices/:cedula/estado')
  async updateAprendizEstado(
    @Param('cedula') cedula: string,
    @Body() payload: { estado: string },
  ) {
    return await this.listaService.updateAprendizEstado(cedula, payload.estado);
  }

  @Patch('aprendices/:cedula')
  async updateAprendiz(
    @Param('cedula') cedula: string,
    @Body() payload: UpdateAprendizDto,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.updateAprendiz(cedula, payload, actorCedula);
  }

  @Delete('aprendices/:cedula')
  async deleteAprendiz(
    @Param('cedula') cedula: string,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.deleteAprendiz(cedula, actorCedula);
  }

  @Get('instructores')
  async getInstructores(@Query('cedula') cedula?: string) {
    return await this.listaService.findAllInstructores(cedula);
  }

  @Patch('instructores/:cedula')
  async updateInstructor(
    @Param('cedula') cedula: string,
    @Body() payload: UpdateInstructorDto,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.updateInstructor(cedula, payload, actorCedula);
  }

  @Put('instructores/:cedula')
  async replaceInstructor(
    @Param('cedula') cedula: string,
    @Body() payload: UpdateInstructorDto,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.updateInstructor(cedula, payload, actorCedula);
  }

  @Post('instructores/:cedula')
  async updateInstructorCompat(
    @Param('cedula') cedula: string,
    @Body() payload: UpdateInstructorDto,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.updateInstructor(cedula, payload, actorCedula);
  }

  @Delete('instructores/:cedula')
  async deleteInstructor(
    @Param('cedula') cedula: string,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.deleteInstructor(cedula, actorCedula);
  }

  @Get('fichas')
  async getFichas() {
    return await this.listaService.findAllFichas();
  }

  @Get('fichas/options')
  async getFichaOptions() {
    return await this.listaService.getFichaCatalogOptions();
  }

  @Post('fichas')
  async createFicha(
    @Body() payload: CreateFichaDto,
  ) {
    return await this.listaService.createFicha(payload);
  }

  @Patch('fichas/:numero')
  async updateFicha(
    @Param('numero') numero: string,
    @Body() payload: UpdateFichaDto,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.updateFicha(numero, payload, actorCedula);
  }

  @Delete('fichas/:numero')
  async deleteFicha(
    @Param('numero') numero: string,
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.deleteFicha(numero, actorCedula);
  }

  @Patch('catalogos/programas')
  async renamePrograma(
    @Body() payload: { programaActual: string; programaNuevo: string },
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.renamePrograma(payload, actorCedula);
  }

  @Post('catalogos/programas/eliminar')
  async deletePrograma(
    @Body() payload: { programa: string },
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.deletePrograma(payload, actorCedula);
  }

  @Patch('catalogos/areas')
  async renameArea(
    @Body()
    payload: { programa?: string | null; areaActual: string; areaNueva: string },
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.renameArea(payload, actorCedula);
  }

  @Post('catalogos/areas/eliminar')
  async deleteArea(
    @Body() payload: { programa?: string | null; area: string },
    @Query('actorCedula') actorCedula?: string,
  ) {
    return await this.listaService.deleteArea(payload, actorCedula);
  }

  @Get('stats')
  async getStats(@Query('cedula') cedula: string) {
    return await this.listaService.getInstructorStats(cedula);
  }

  @Post('users')
  async createUsuario(
    @Body() payload: CreateUsuarioDto,
  ) {
    return await this.listaService.createUsuario(payload);
  }

  @Post('users/import')
  async importUsuarios(
    @Body() payload: { usuarios: ImportUsuarioDto[] },
  ) {
    return await this.listaService.importUsuarios(payload.usuarios);
  }
}

