import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Proyecto } from "../entities/Proyecto";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { Usuario } from "../entities/Usuario";

const ESTADO_CREADO = 1;
const ESTADO_EN_PROCESO = 2;
const ESTADO_COMPLETO = 3;

@Injectable()
export class MiProyectoService {
  constructor(
    @InjectRepository(UsuProDetPar)
    private readonly usuProRepo: Repository<UsuProDetPar>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepo: Repository<Proyecto>,

    @InjectRepository(HistoriaUsuario)
    private readonly huRepo: Repository<HistoriaUsuario>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>
  ) {}

  private async getProyectoAsignado(cedula: number | string) {
    const asignacion = await this.usuProRepo.findOne({
      where: { usuCedula: Number(cedula) } as any,
      order: { proId: "DESC" } as any,
    });

    const proId = asignacion?.proId ?? null;
    if (!proId) return null;

    return proId;
  }

  private async getIntegrantesProyecto(proId: number) {
    const asignaciones = await this.usuProRepo.find({
      where: { proId } as any,
      relations: ["usuCedula2", "detParId_2"] as any,
    });

    return asignaciones
      .map((item: any) => {
        const u = item.usuCedula2;
        if (!u) return null;

        const nombre = `${u.usuNombres ?? ""} ${u.usuApellidos ?? ""}`.trim();

        return {
          cedula: u.usuCedula ?? null,
          nombre: nombre || "Sin nombre",
          correo: u.usuCorreo ?? null,
          telefono: u.usuTelefono ?? null,
          rol: item.detParId_2?.detParDescripcion ?? "Sin rol",
        };
      })
      .filter(Boolean);
  }

  async getMiProyectoByCedula(cedula: number | string) {
    const proId = await this.getProyectoAsignado(cedula);

    if (!proId) {
      return {
        proId: null,
        nombre: null,
        grupo: 0,
        integrantes: [],
        fechaAsignada: null,
        fechaFin: null,
        descripcion: null,
        distribucion: {
          creados: 0,
          completos: 0,
          enProceso: 0,
        },
        avanceProyecto: [],
      };
    }

    const proyecto = await this.proyectoRepo.findOne({
      where: { proId } as any,
      relations: ["detParIdFk2"] as any,
    });

    if (!proyecto) {
      return {
        proId,
        nombre: null,
        grupo: 0,
        integrantes: [],
        fechaAsignada: null,
        fechaFin: null,
        descripcion: null,
        distribucion: {
          creados: 0,
          completos: 0,
          enProceso: 0,
        },
        avanceProyecto: [],
      };
    }

    const integrantes = await this.getIntegrantesProyecto(proId);
    const grupo = integrantes.length;

    const [creados, enProceso, completos] = await Promise.all([
      this.huRepo.count({
        where: { proIdFk: proId, detParIdFk: ESTADO_CREADO } as any,
      }),
      this.huRepo.count({
        where: { proIdFk: proId, detParIdFk: ESTADO_EN_PROCESO } as any,
      }),
      this.huRepo.count({
        where: { proIdFk: proId, detParIdFk: ESTADO_COMPLETO } as any,
      }),
    ]);

    const porSprint = await this.huRepo
      .createQueryBuilder("h")
      .select("h.sprintIdFk", "sprint")
      .addSelect("COUNT(*)", "total")
      .addSelect(
        `SUM(CASE WHEN h.detParIdFk = ${ESTADO_COMPLETO} THEN 1 ELSE 0 END)`,
        "done"
      )
      .where("h.proIdFk = :proId", { proId })
      .andWhere("h.sprintIdFk IS NOT NULL")
      .groupBy("h.sprintIdFk")
      .orderBy("h.sprintIdFk", "ASC")
      .getRawMany();

    const avanceProyecto = porSprint.map((r: any) => {
      const total = Number(r.total) || 0;
      const done = Number(r.done) || 0;

      return {
        label: `Sprint ${r.sprint}`,
        value: total ? Math.round((done / total) * 100) : 0,
      };
    });

    return {
      proId: proyecto.proId,
      nombre: proyecto.proNombre,
      grupo,
      integrantes: integrantes.map((i: any) => ({
        nombre: i.nombre,
        rol: i.rol,
      })),
      fechaAsignada: proyecto.proFechaInicio,
      fechaFin: proyecto.proFechaFin,
      descripcion: proyecto.proDescription,
      distribucion: {
        creados,
        completos,
        enProceso,
      },
      avanceProyecto,
    };
  }

  async getMiProyectoDetalleByCedula(cedula: number | string) {
    const proId = await this.getProyectoAsignado(cedula);

    if (!proId) {
      return {
        proId: null,
        proCodigo: null,
        nombre: null,
        descripcion: null,
        objetivoGeneral: null,
        objetivosEspecificos: null,
        justificacion: null,
        estado: null,
        fechaInicio: null,
        fechaFin: null,
        fechaCreacion: null,
        integrantes: [],
      };
    }

    const proyecto = await this.proyectoRepo.findOne({
      where: { proId } as any,
      relations: ["detParIdFk2"] as any,
    });

    if (!proyecto) {
      return {
        proId,
        proCodigo: null,
        nombre: null,
        descripcion: null,
        objetivoGeneral: null,
        objetivosEspecificos: null,
        justificacion: null,
        estado: null,
        fechaInicio: null,
        fechaFin: null,
        fechaCreacion: null,
        integrantes: [],
      };
    }

    const integrantes = await this.getIntegrantesProyecto(proId);

    return {
      proId: proyecto.proId,
      proCodigo: proyecto.proCodigo ?? null,
      nombre: proyecto.proNombre ?? null,
      descripcion: proyecto.proDescription ?? null,
      objetivoGeneral: proyecto.proObjetivoGeneral ?? null,
      objetivosEspecificos: proyecto.proObjetivosEspecificos ?? null,
      justificacion: proyecto.proJustificacion ?? null,
      estado: proyecto.detParIdFk2?.detParDescripcion ?? null,
      fechaInicio: proyecto.proFechaInicio ?? null,
      fechaFin: proyecto.proFechaFin ?? null,
      fechaCreacion: proyecto.proFechaCreacion ?? null,
      integrantes,
    };
  }
}