import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Usuario } from "../entities/Usuario";
import { CreateHistoriaDto } from "./dto/create-historia.dto";
import { UpdateHistoriaDto } from "./dto/update-historia.dto";

const ESTADO_TODO = 1;
const DET_PAR_SCRUM_MASTER = 5;

@Injectable()
export class AprendizHistoriasService {
  constructor(
    @InjectRepository(HistoriaUsuario)
    private readonly huRepo: Repository<HistoriaUsuario>,

    @InjectRepository(UsuProDetPar)
    private readonly usuProRepo: Repository<UsuProDetPar>,

    @InjectRepository(Usuario)
    private readonly userRepo: Repository<Usuario>
  ) {}

  private async getProyectoIdByCedula(cedula: number | string): Promise<number> {
    if (!cedula) {
      throw new BadRequestException("Cédula inválida");
    }

    const asignacion = await this.usuProRepo.findOne({
      where: { usuCedula: Number(cedula) } as any,
      order: { proId: "DESC" } as any,
    });

    const proId = asignacion?.proId ?? null;

    if (!proId) {
      throw new NotFoundException("El aprendiz no tiene proyecto asignado");
    }

    return Number(proId);
  }

  private getEstadoNombre(estadoId: number | null | undefined) {
    switch (Number(estadoId)) {
      case 1:
        return "Pendiente";
      case 2:
        return "En proceso";
      case 3:
        return "Finalizado";
      default:
        return "Sin estado";
    }
  }

  private buildNombre(usuario: any) {
    if (!usuario) return null;
    return (
      `${usuario.usuNombres ?? ""} ${usuario.usuApellidos ?? ""}`.trim() || null
    );
  }

  private async esScrumMasterDelProyecto(
    cedula: number | string,
    proId: number
  ): Promise<boolean> {
    const asignacion = await this.usuProRepo.findOne({
      where: { usuCedula: Number(cedula), proId } as any,
    });

    if (!asignacion) return false;

    return Number(asignacion?.detParId ?? 0) === DET_PAR_SCRUM_MASTER;
  }

  async listResponsablesProyecto(cedula: number | string) {
    const proId = await this.getProyectoIdByCedula(cedula);

    const asignaciones = await this.usuProRepo.find({
      where: { proId } as any,
      relations: {
        usuCedula2: true,
      } as any,
      order: { usuCedula: "ASC" } as any,
    });

    const usados = new Set<string>();
    const result: any[] = [];

    for (const a of asignaciones as any[]) {
      const usuario = a.usuCedula2;
      const ced = String(usuario?.usuCedula ?? a.usuCedula ?? "").trim();

      if (!ced || usados.has(ced)) continue;
      usados.add(ced);

      result.push({
        cedula: ced,
        nombre: `${usuario?.usuNombres ?? ""} ${usuario?.usuApellidos ?? ""}`.trim(),
      });
    }

    return result;
  }

  private mapHistoria(
    h: HistoriaUsuario,
    esScrumMaster: boolean,
    cedulaActual: number | string
  ) {
    const usuario = (h as any).usuCedulaFk2 ?? null;
    const usuarioNombre = this.buildNombre(usuario);

    const esResponsable =
      String(h.usuCedulaFk ?? "") === String(cedulaActual);

    const puedeEditar = esScrumMaster || esResponsable;
    const puedeEliminar = esScrumMaster;
    const puedeCambiarResponsable = esScrumMaster;

    return {
      id: h.hisId,
      titulo: h.hisTitulo,
      descripcion: h.hisDescripcion,
      puntaje: h.hisPuntaje,
      numeroSprint: h.sprintIdFk,
      estadoId: h.detParIdFk,
      estadoNombre: this.getEstadoNombre(h.detParIdFk),
      responsableCedula: h.usuCedulaFk,
      responsableNombre: usuarioNombre || null,
      creadorCedula: h.usuCedulaFk,
      creadorNombre: usuarioNombre || null,
      puedeEditar,
      puedeEliminar,
      puedeCambiarResponsable,
      esScrumMaster,
    };
  }

  async listByCedula(cedula: number | string) {
    const proId = await this.getProyectoIdByCedula(cedula);
    const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);

    const hus = await this.huRepo.find({
      where: { proIdFk: proId } as any,
      relations: {
        usuCedulaFk2: true,
      } as any,
      order: { hisId: "ASC" } as any,
    });

    return hus.map((h) => this.mapHistoria(h, esScrumMaster, cedula));
  }

  async getOne(id: number, cedula: number | string) {
    const proId = await this.getProyectoIdByCedula(cedula);
    const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);

    const hu = await this.huRepo.findOne({
      where: { hisId: id, proIdFk: proId } as any,
      relations: {
        usuCedulaFk2: true,
      } as any,
    });

    if (!hu) {
      throw new NotFoundException(
        "Historia no encontrada o no pertenece a tu proyecto"
      );
    }

    return this.mapHistoria(hu, esScrumMaster, cedula);
  }

  async create(dto: CreateHistoriaDto) {
    const proId = await this.getProyectoIdByCedula(dto.cedula);

    const esScrumMaster = await this.esScrumMasterDelProyecto(dto.cedula, proId);
    if (!esScrumMaster) {
      throw new ForbiddenException(
        "Solo el Scrum Master puede crear historias de usuario."
      );
    }

    if (!dto.responsableCedula || !String(dto.responsableCedula).trim()) {
      throw new BadRequestException("Debes asignar un responsable.");
    }

    const responsableAsignado = await this.usuProRepo.findOne({
      where: {
        usuCedula: Number(dto.responsableCedula),
        proId,
      } as any,
    });

    if (!responsableAsignado) {
      throw new BadRequestException("El responsable no pertenece al proyecto.");
    }

    const insertResult = await this.huRepo
      .createQueryBuilder()
      .insert()
      .into(HistoriaUsuario)
      .values({
        proIdFk: proId,
        hisTitulo: dto.titulo,
        hisDescripcion: dto.descripcion,
        hisPuntaje: dto.puntaje,
        sprintIdFk: dto.numeroSprint ?? null,
        detParIdFk: dto.estadoId ?? ESTADO_TODO,
        usuCedulaFk: dto.responsableCedula
          ? Number(dto.responsableCedula)
          : null,
      } as any)
      .execute();

    const newId =
      (insertResult as any)?.identifiers?.[0]?.hisId ??
      (insertResult as any)?.raw?.insertId ??
      null;

    const saved =
      (newId
        ? await this.huRepo.findOne({
            where: { hisId: newId, proIdFk: proId } as any,
            relations: { usuCedulaFk2: true } as any,
          })
        : await this.huRepo.findOne({
            where: { proIdFk: proId } as any,
            relations: { usuCedulaFk2: true } as any,
            order: { hisId: "DESC" } as any,
          })) ?? null;

    if (!saved) {
      throw new BadRequestException("No se pudo confirmar el guardado en BD");
    }

    return this.mapHistoria(saved, esScrumMaster, dto.cedula);
  }

  async update(id: number, dto: UpdateHistoriaDto, cedula: number | string) {
    const proId = await this.getProyectoIdByCedula(cedula);
    const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);

    const hu = await this.huRepo.findOne({
      where: { hisId: id, proIdFk: proId } as any,
    });

    if (!hu) {
      throw new NotFoundException(
        "Historia no encontrada o no pertenece a tu proyecto"
      );
    }

    const esResponsable =
      String((hu as any).usuCedulaFk ?? "") === String(cedula);

    if (!esScrumMaster && !esResponsable) {
      throw new ForbiddenException(
        "Solo el Scrum Master o el responsable pueden editar esta historia."
      );
    }

    if (dto.titulo !== undefined) hu.hisTitulo = dto.titulo;
    if (dto.descripcion !== undefined) hu.hisDescripcion = dto.descripcion;
    if (dto.puntaje !== undefined) hu.hisPuntaje = dto.puntaje;
    if (dto.numeroSprint !== undefined) hu.sprintIdFk = dto.numeroSprint;
    if (dto.estadoId !== undefined) hu.detParIdFk = dto.estadoId;

    if (dto.responsableCedula !== undefined) {
      if (!esScrumMaster) {
        throw new ForbiddenException(
          "Solo el Scrum Master puede reasignar responsables."
        );
      }

      const responsableAsignado = await this.usuProRepo.findOne({
        where: {
          usuCedula: Number(dto.responsableCedula),
          proId,
        } as any,
      });

      if (!responsableAsignado) {
        throw new BadRequestException("El responsable no pertenece al proyecto.");
      }

      hu.usuCedulaFk = dto.responsableCedula
        ? Number(dto.responsableCedula)
        : null;
    }

    await this.huRepo.save(hu);

    const saved = await this.huRepo.findOne({
      where: { hisId: id, proIdFk: proId } as any,
      relations: { usuCedulaFk2: true } as any,
    });

    if (!saved) {
      throw new NotFoundException("No se pudo recargar la historia actualizada");
    }

    return this.mapHistoria(saved, esScrumMaster, cedula);
  }

  async remove(id: number, cedula: number | string) {
    const proId = await this.getProyectoIdByCedula(cedula);
    const esScrumMaster = await this.esScrumMasterDelProyecto(cedula, proId);

    if (!esScrumMaster) {
      throw new ForbiddenException(
        "Solo el Scrum Master puede eliminar historias de usuario."
      );
    }

    const hu = await this.huRepo.findOne({
      where: { hisId: id, proIdFk: proId } as any,
    });

    if (!hu) {
      throw new NotFoundException(
        "Historia no encontrada o no pertenece a tu proyecto"
      );
    }

    await this.huRepo.delete({ hisId: id, proIdFk: proId } as any);
    return { ok: true };
  }
}