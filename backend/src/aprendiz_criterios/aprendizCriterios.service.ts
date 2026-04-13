import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CriteriosAceptacion } from "../entities/CriteriosAceptacion";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";

import { CreateCriterioDto } from "./dto/create-criterio.dto";
import { UpdateCriterioDto } from "./dto/update-criterio.dto";

const ESTADO_PENDIENTE = 1;

@Injectable()
export class AprendizCriteriosService {
  constructor(
    @InjectRepository(CriteriosAceptacion)
    private readonly caRepo: Repository<CriteriosAceptacion>,

    @InjectRepository(UsuProDetPar)
    private readonly usuProRepo: Repository<UsuProDetPar>,

    @InjectRepository(HistoriaUsuario)
    private readonly huRepo: Repository<HistoriaUsuario>
  ) {}

  private estadoLabel(detParIdFk: number | null) {
    if (Number(detParIdFk) === 1) return "Pendiente";
    if (Number(detParIdFk) === 2) return "En proceso";
    if (Number(detParIdFk) === 3) return "Finalizado";
    return "-";
  }

  private async getProyectoAsignado(cedula: number): Promise<number | null> {
    const asignacion = await this.usuProRepo.findOne({
      where: { usuCedula: Number(cedula) } as any,
      order: { proId: "DESC" } as any,
    });

    const proId = (asignacion as any)?.proId ?? null;
    return proId ? Number(proId) : null;
  }

  private buildNombreUsuario(usuario: any) {
    if (!usuario) return null;
    return (
      `${usuario.usuNombres ?? ""} ${usuario.usuApellidos ?? ""}`.trim() || null
    );
  }

  private mapCriterio(r: any) {
    return {
      id: r.criId,
      hisId: r.hisIdFk,
      descripcion: r.criDescripcion ?? "",
      estado: this.estadoLabel(r.detParIdFk),
      estadoId: r.detParIdFk ?? ESTADO_PENDIENTE,
      tiempo: r.criTiempo ?? "-",
      responsableCedula: r.usuCedulaFk ?? null,
      responsableNombre: this.buildNombreUsuario(r.usuCedulaFk2) ?? null,
    };
  }

  private validarResponsableCA(ca: CriteriosAceptacion, cedula: number) {
    const esResponsable = Number(ca.usuCedulaFk ?? 0) === Number(cedula);

    if (!esResponsable) {
      throw new ForbiddenException(
        "No tienes permisos para editar o eliminar este criterio. Solo puede hacerlo el responsable."
      );
    }
  }

  private async validarQueSeaResponsableHU(
    hisId: number,
    proId: number,
    cedula: number
  ): Promise<HistoriaUsuario> {
    const hu = await this.huRepo.findOne({
      where: { hisId, proIdFk: proId } as any,
      select: {
        hisId: true,
        proIdFk: true,
        usuCedulaFk: true,
      } as any,
    });

    if (!hu) {
      throw new BadRequestException("HU_NO_PERTENECE_AL_PROYECTO");
    }

    if (Number((hu as any).usuCedulaFk ?? 0) !== Number(cedula)) {
      throw new ForbiddenException(
        "Solo el responsable de la historia de usuario puede crear criterios de aceptación."
      );
    }

    return hu;
  }

  async getHistoriasParaSelect(cedula: number) {
    if (!Number.isFinite(cedula) || cedula <= 0) return [];

    const proId = await this.getProyectoAsignado(cedula);
    if (!proId) return [];

    const historias = await this.huRepo.find({
      where: { proIdFk: proId } as any,
      select: {
        hisId: true,
        hisTitulo: true,
        usuCedulaFk: true,
      } as any,
      order: { hisId: "ASC" } as any,
    });

    return historias.map((h: any) => ({
      id: h.hisId,
      titulo: h.hisTitulo ?? `HU ${h.hisId}`,
      responsableCedula: h.usuCedulaFk ?? null,
      puedeCrear: Number(h.usuCedulaFk ?? 0) === Number(cedula),
    }));
  }

  async listByCedula(cedula: number) {
    const proId = await this.getProyectoAsignado(cedula);
    if (!proId) return [];

    const rows = await this.caRepo.find({
      where: { proIdFk: proId } as any,
      relations: {
        usuCedulaFk2: true,
      } as any,
      order: { criId: "ASC" } as any,
    });

    return rows.map((r) => this.mapCriterio(r));
  }

  async getById(id: number, cedula: number) {
    const proId = await this.getProyectoAsignado(cedula);
    if (!proId) throw new NotFoundException("PROYECTO_NO_ASIGNADO");

    const ca = await this.caRepo.findOne({
      where: { criId: id, proIdFk: proId } as any,
      relations: {
        usuCedulaFk2: true,
      } as any,
    });

    if (!ca) throw new NotFoundException("CRITERIO_NO_ENCONTRADO");

    return {
      id: ca.criId,
      hisId: ca.hisIdFk,
      descripcion: ca.criDescripcion ?? "",
      estadoId: ca.detParIdFk ?? ESTADO_PENDIENTE,
      tiempo: ca.criTiempo ?? "",
      responsableCedula: ca.usuCedulaFk ?? null,
      responsableNombre: this.buildNombreUsuario((ca as any).usuCedulaFk2),
    };
  }

  async create(dto: CreateCriterioDto, cedula: number) {
    const hisId = Number(dto.hisIdFk ?? dto.hisId);

    if (!Number.isFinite(cedula) || cedula <= 0) {
      throw new BadRequestException("CEDULA_INVALIDA");
    }

    if (!Number.isFinite(hisId) || hisId <= 0) {
      throw new BadRequestException("HISID_INVALIDO");
    }

    const proId = await this.getProyectoAsignado(cedula);
    if (!proId) throw new BadRequestException("PROYECTO_NO_ASIGNADO");

    await this.validarQueSeaResponsableHU(hisId, proId, cedula);

    const maxIdRow = await this.caRepo
      .createQueryBuilder("ca")
      .select("MAX(ca.criId)", "max")
      .getRawOne();

    const nextId = Number(maxIdRow?.max ?? 0) + 1;

    const ca = this.caRepo.create({
      criId: nextId,
      hisIdFk: hisId,
      proIdFk: proId,
      usuCedulaFk: Number(cedula),
      detParIdFk: dto.estadoId ?? ESTADO_PENDIENTE,
      criTiempo: dto.tiempo ?? null,
      criDescripcion: dto.descripcion ?? null,
    } as any);

    const saved: any = await this.caRepo.save(ca as any);

    return {
      ok: true,
      id: saved.criId,
    };
  }

  async update(id: number, dto: UpdateCriterioDto, cedula: number) {
    const proId = await this.getProyectoAsignado(cedula);
    if (!proId) throw new BadRequestException("PROYECTO_NO_ASIGNADO");

    const ca = await this.caRepo.findOne({
      where: { criId: id, proIdFk: proId } as any,
    });

    if (!ca) throw new NotFoundException("CRITERIO_NO_ENCONTRADO");

    this.validarResponsableCA(ca, cedula);

    if (dto.hisIdFk !== undefined || dto.hisId !== undefined) {
      const newHisId = Number(dto.hisIdFk ?? dto.hisId);

      if (!Number.isFinite(newHisId) || newHisId <= 0) {
        throw new BadRequestException("HISID_INVALIDO");
      }

      await this.validarQueSeaResponsableHU(newHisId, proId, cedula);

      ca.hisIdFk = newHisId;
      ca.proIdFk = proId;
      ca.usuCedulaFk = Number(cedula);
    }

    if (dto.descripcion !== undefined) {
      ca.criDescripcion = dto.descripcion ?? null;
    }

    if (dto.estadoId !== undefined) {
      ca.detParIdFk = dto.estadoId ?? ESTADO_PENDIENTE;
    }

    if (dto.tiempo !== undefined) {
      ca.criTiempo = dto.tiempo ?? null;
    }

    await this.caRepo.save(ca);
    return { ok: true };
  }

  async remove(id: number, cedula: number) {
    const proId = await this.getProyectoAsignado(cedula);
    if (!proId) throw new BadRequestException("PROYECTO_NO_ASIGNADO");

    const ca = await this.caRepo.findOne({
      where: { criId: id, proIdFk: proId } as any,
      select: {
        criId: true,
        hisIdFk: true,
        proIdFk: true,
        usuCedulaFk: true,
      } as any,
    });

    if (!ca) throw new NotFoundException("CRITERIO_NO_ENCONTRADO");

    this.validarResponsableCA(ca, cedula);

    await this.caRepo.delete({
      criId: ca.criId,
      proIdFk: ca.proIdFk,
    } as any);

    return { ok: true };
  }
}