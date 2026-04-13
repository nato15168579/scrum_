import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { Observaciones } from "../entities/Observaciones";
import { UsuProDetPar } from "../entities/UsuProDetPar";

@Injectable()
export class AprendizObservacionesService {
  private readonly ESTADO_POR_HACER = 1;
  private readonly ESTADO_HECHO = 3;

  constructor(
    @InjectRepository(Observaciones)
    private readonly observacionesRepo: Repository<Observaciones>,

    @InjectRepository(UsuProDetPar)
    private readonly usuProDetParRepo: Repository<UsuProDetPar>
  ) {}

  async findByAprendizCedula(cedula: number | string) {
    if (!cedula) {
      throw new BadRequestException("La cédula es obligatoria.");
    }

    const relaciones = await this.usuProDetParRepo.find({
      where: { usuCedula: Number(cedula) } as any,
    });

    if (!relaciones.length) return [];

    const projectIds = [
      ...new Set(
        relaciones
          .map((r: any) => Number(r.proId))
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    ];

    const observaciones = await this.observacionesRepo.find({
      where: { proIdFk: In(projectIds) } as any,
      relations: {
        usuCedulaFk2: true,
      } as any,
      order: {
        obsFecha: "DESC",
        obsId: "DESC",
      } as any,
    });

    return observaciones.map((obs) => {
      const estaHecho = Number(obs.detParIdFk) === this.ESTADO_HECHO;

      return {
        id: obs.obsId,
        descripcion: obs.obsDescripcion ?? "-",
        area: estaHecho ? "hecho" : "por hacer",
        instructor: this.getNombreCompleto(obs.usuCedulaFk2),
        fecha: obs.obsFecha ?? null,
        visto: estaHecho,
        estadoFk: obs.detParIdFk ?? null,
      };
    });
  }

  async toggleVisto(observacionId: number, cedula: number | string) {
    if (!observacionId) {
      throw new BadRequestException("ID inválido.");
    }

    if (!cedula) {
      throw new BadRequestException("Cédula inválida.");
    }

    const relaciones = await this.usuProDetParRepo.find({
      where: { usuCedula: Number(cedula) } as any,
    });

    if (!relaciones.length) {
      throw new BadRequestException("Sin proyectos asociados.");
    }

    const projectIds = [
      ...new Set(
        relaciones
          .map((r: any) => Number(r.proId))
          .filter((id) => Number.isFinite(id) && id > 0)
      ),
    ];

    const observacion = await this.observacionesRepo.findOne({
      where: { obsId: observacionId } as any,
    });

    if (!observacion) {
      throw new NotFoundException("No existe.");
    }

    if (!projectIds.includes(Number(observacion.proIdFk))) {
      throw new BadRequestException("Sin permisos.");
    }

    const estaHecho =
      Number(observacion.detParIdFk) === this.ESTADO_HECHO;

    const nuevoEstado = estaHecho
      ? this.ESTADO_POR_HACER
      : this.ESTADO_HECHO;

    observacion.detParIdFk = nuevoEstado;

    await this.observacionesRepo.save(observacion);

    return {
      id: observacion.obsId,
      visto: nuevoEstado === this.ESTADO_HECHO,
      area: nuevoEstado === this.ESTADO_HECHO ? "hecho" : "por hacer",
      estadoFk: nuevoEstado,
      message:
        nuevoEstado === this.ESTADO_HECHO
          ? "Observación marcada como hecha."
          : "Observación marcada como por hacer.",
    };
  }

  private getNombreCompleto(usuario?: any): string {
    if (!usuario) return "-";

    return `${usuario.usuNombres ?? ""} ${usuario.usuApellidos ?? ""}`.trim() || "-";
  }
}