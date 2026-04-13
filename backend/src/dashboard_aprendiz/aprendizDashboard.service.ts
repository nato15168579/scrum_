import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Usuario } from "../entities/Usuario";
import { HistoriaUsuario } from "../entities/HistoriaUsuario";
import { UsuProDetPar } from "../entities/UsuProDetPar";
import { Reuniones } from "../entities/Reuniones";
import { Observaciones } from "../entities/Observaciones";
import { Sprint } from "../entities/Sprint";

const ESTADO_TODO = 1;
const ESTADO_DOING = 2;
const ESTADO_DONE = 3;

type ActivityType = "hu" | "reunion" | "observacion";

type ActivityDonut = {
  completadas: number;
  enCurso: number;
  pendiente: number;
};

type DashboardResponse = {
  aprendiz: string;
  correo: string | null;
  stats: {
    tareasActivas: number;
    tareasCompletadas: number;
    participacionReuniones: number;
    retroalimentaciones: number;
  };
  avanceProyecto: { label: string; value: number }[];
  actividad: ActivityDonut;
  actividadGlobal: ActivityDonut;
  actividadesRecientes: { text: string; time: string; type: ActivityType }[];
};

type ActividadInterna = {
  text: string;
  time: string;
  type: ActivityType;
};

@Injectable()
export class AprendizDashboardService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    @InjectRepository(HistoriaUsuario)
    private readonly huRepo: Repository<HistoriaUsuario>,

    @InjectRepository(UsuProDetPar)
    private readonly usuProRepo: Repository<UsuProDetPar>,

    @InjectRepository(Reuniones)
    private readonly reunionesRepo: Repository<Reuniones>,

    @InjectRepository(Observaciones)
    private readonly observacionesRepo: Repository<Observaciones>,

    @InjectRepository(Sprint)
    private readonly sprintRepo: Repository<Sprint>
  ) {}

  private emptyDashboard(
    aprendiz: string,
    correo: string | null
  ): DashboardResponse {
    return {
      aprendiz,
      correo: correo ?? null,
      stats: {
        tareasActivas: 0,
        tareasCompletadas: 0,
        participacionReuniones: 0,
        retroalimentaciones: 0,
      },
      avanceProyecto: [],
      actividad: {
        completadas: 0,
        enCurso: 0,
        pendiente: 0,
      },
      actividadGlobal: {
        completadas: 0,
        enCurso: 0,
        pendiente: 0,
      },
      actividadesRecientes: [],
    };
  }

  private getProIdFromAsignacion(asig: any): number | null {
    if (!asig) return null;
    return Number(asig.proId ?? asig.proIdFk ?? asig.pro?.proId ?? 0) || null;
  }

  private formatRelativeFromDate(fecha: Date | null): string {
    if (!fecha || isNaN(fecha.getTime())) return "reciente";

    const now = Date.now();
    const diff = now - fecha.getTime();

    if (diff < 60 * 1000) return "hace un momento";

    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `hace ${minutes} min`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `hace ${hours} h`;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 1) return "ayer";
    if (days < 7) return `hace ${days} días`;

    return fecha.toLocaleDateString("es-CO");
  }

  private getHistoriaAccion(estado: number | null): string {
    if (estado === ESTADO_DONE) return "Completó la HU";
    if (estado === ESTADO_DOING) return "Está trabajando en la HU";
    return "Tiene asignada la HU";
  }

  private buildDateFromReunion(fecha: any, hora: any): Date | null {
    if (!fecha) return null;

    const fechaTexto =
      typeof fecha === "string"
        ? fecha
        : fecha instanceof Date
        ? fecha.toISOString().slice(0, 10)
        : String(fecha);

    const horaTexto = hora ? String(hora).slice(0, 8) : "00:00:00";
    const full = `${fechaTexto} ${horaTexto}`;
    const date = new Date(full);

    if (!isNaN(date.getTime())) return date;

    const onlyDate = new Date(fechaTexto);
    return isNaN(onlyDate.getTime()) ? null : onlyDate;
  }

  private normalizeText(value: any, fallback: string, max = 90): string {
    const text = (value ?? fallback).toString().trim();
    if (!text) return fallback;
    return text.length > max ? `${text.slice(0, max)}...` : text;
  }

  private interleaveActivities(groups: ActividadInterna[][]): ActividadInterna[] {
    const buckets = groups.map((g) => [...g]);
    const result: ActividadInterna[] = [];

    let keepGoing = true;
    while (keepGoing) {
      keepGoing = false;

      for (const bucket of buckets) {
        if (bucket.length > 0) {
          result.push(bucket.shift() as ActividadInterna);
          keepGoing = true;
        }
      }
    }

    return result;
  }

  private buildActivityPercentages(
    pendientes: number,
    enCurso: number,
    hechas: number
  ): ActivityDonut {
    const total = pendientes + enCurso + hechas;

    return {
      completadas: total ? Math.round((hechas / total) * 100) : 0,
      enCurso: total ? Math.round((enCurso / total) * 100) : 0,
      pendiente: total ? Math.round((pendientes / total) * 100) : 0,
    };
  }

  async getDashboardByCedula(cedula: number | string) {
    try {
      const cedulaNum = Number(cedula);

      if (!Number.isFinite(cedulaNum) || cedulaNum <= 0) {
        return { error: "cedula requerida" };
      }

      const user = await this.usuarioRepo.findOne({
        where: { usuCedula: cedulaNum } as any,
        select: {
          usuCedula: true,
          usuNombres: true,
          usuApellidos: true,
          usuCorreo: true,
        } as any,
      });

      if (!user) {
        return { error: "Usuario no encontrado" };
      }

      const aprendiz =
        `${user.usuNombres ?? ""} ${user.usuApellidos ?? ""}`.trim() ||
        "Aprendiz";

      const asignacion = await this.usuProRepo.findOne({
        where: { usuCedula: cedulaNum } as any,
        order: { proId: "DESC" } as any,
      });

      const proId = this.getProIdFromAsignacion(asignacion);

      if (!proId) {
        return this.emptyDashboard(aprendiz, user.usuCorreo ?? null);
      }

      const [
        pendientes,
        enCurso,
        hechas,
        globalPendientes,
        globalEnCurso,
        globalHechas,
      ] = await Promise.all([
        this.huRepo.count({
          where: {
            proIdFk: proId,
            usuCedulaFk: cedulaNum,
            detParIdFk: ESTADO_TODO,
          } as any,
        }),
        this.huRepo.count({
          where: {
            proIdFk: proId,
            usuCedulaFk: cedulaNum,
            detParIdFk: ESTADO_DOING,
          } as any,
        }),
        this.huRepo.count({
          where: {
            proIdFk: proId,
            usuCedulaFk: cedulaNum,
            detParIdFk: ESTADO_DONE,
          } as any,
        }),
        this.huRepo.count({
          where: {
            proIdFk: proId,
            detParIdFk: ESTADO_TODO,
          } as any,
        }),
        this.huRepo.count({
          where: {
            proIdFk: proId,
            detParIdFk: ESTADO_DOING,
          } as any,
        }),
        this.huRepo.count({
          where: {
            proIdFk: proId,
            detParIdFk: ESTADO_DONE,
          } as any,
        }),
      ]);

      const tareasActivas = pendientes + enCurso;
      const tareasCompletadas = hechas;

      const porSprint = await this.huRepo
        .createQueryBuilder("h")
        .select("h.sprintIdFk", "sprint")
        .addSelect("COUNT(*)", "total")
        .addSelect(
          `SUM(CASE WHEN h.detParIdFk = ${ESTADO_DONE} THEN 1 ELSE 0 END)`,
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
          value: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      });

      const actividad = this.buildActivityPercentages(
        pendientes,
        enCurso,
        hechas
      );

      const actividadGlobal = this.buildActivityPercentages(
        globalPendientes,
        globalEnCurso,
        globalHechas
      );

      // ================== ACTIVIDADES RECIENTES ==================

      const historiasRecientes = await this.huRepo.find({
        where: {
          proIdFk: proId,
          usuCedulaFk: cedulaNum,
        } as any,
        order: {
          hisId: "DESC",
        } as any,
        take: 50,
      });

      const actividadesHU: ActividadInterna[] = (historiasRecientes || []).map(
        (h: any) => {
          const titulo = this.normalizeText(
            h.hisTitulo ?? h.hisDescripcion,
            "Historia de usuario"
          );

          return {
            text: `${this.getHistoriaAccion(
              Number(h.detParIdFk ?? 0)
            )}: ${titulo}`,
            time: `HU #${Number(h.hisId) || ""}`,
            type: "hu",
          };
        }
      );

      const reunionesParticipadas = await this.reunionesRepo.query(
        `
        SELECT
          r.reu_ID AS reuId,
          r.reu_descripcion AS descripcion,
          r.reu_fecha AS fecha,
          r.reu_hora AS hora
        FROM pro_scrum.usu_reu_pro ur
        INNER JOIN pro_scrum.reuniones r
          ON r.reu_ID = ur.reu_id_FK
        WHERE ur.usu_cedula_FK = ?
          AND ur.pro_id_FK = ?
        ORDER BY r.reu_fecha DESC, r.reu_hora DESC, r.reu_ID DESC
        LIMIT 50
        `,
        [cedulaNum, proId]
      );

      const actividadesReuniones: ActividadInterna[] = (
        reunionesParticipadas || []
      ).map((r: any) => {
        const fechaReunion = this.buildDateFromReunion(r.fecha, r.hora);

        return {
          text: `Participó en reunión: ${this.normalizeText(
            r.descripcion,
            "Reunión del proyecto"
          )}`,
          time: fechaReunion
            ? this.formatRelativeFromDate(fechaReunion)
            : "reciente",
          type: "reunion",
        };
      });

      const observacionesRecientes = await this.observacionesRepo.find({
        where: {
          proIdFk: proId,
        } as any,
        order: {
          obsFecha: "DESC",
          obsId: "DESC",
        } as any,
        take: 50,
      });

      const actividadesObservaciones: ActividadInterna[] = (
        observacionesRecientes || []
      ).map((o: any) => {
        const fechaObs = o.obsFecha ? new Date(o.obsFecha) : null;

        return {
          text: `Nueva observación: ${this.normalizeText(
            o.obsDescripcion,
            "Observación del proyecto"
          )}`,
          time: fechaObs ? this.formatRelativeFromDate(fechaObs) : "reciente",
          type: "observacion",
        };
      });

      const actividadesRecientes = this.interleaveActivities([
        actividadesHU,
        actividadesReuniones,
        actividadesObservaciones,
      ]);

      // ================== STATS EXTRA ==================

      const reunionesRaw = await this.reunionesRepo.query(
        `
        SELECT COUNT(*) AS total
        FROM pro_scrum.usu_reu_pro ur
        WHERE ur.usu_cedula_FK = ?
          AND ur.pro_id_FK = ?
        `,
        [cedulaNum, proId]
      );

      const participacionReuniones = Number(reunionesRaw?.[0]?.total ?? 0);

      const retroalimentaciones = await this.observacionesRepo.count({
        where: { proIdFk: proId } as any,
      });

      return {
        aprendiz,
        correo: user.usuCorreo ?? null,
        stats: {
          tareasActivas,
          tareasCompletadas,
          participacionReuniones,
          retroalimentaciones,
        },
        avanceProyecto,
        actividad,
        actividadGlobal,
        actividadesRecientes,
      } satisfies DashboardResponse;
    } catch (err: any) {
      console.error("❌ AprendizDashboardService error:", err);
      return {
        error: "Error interno",
        detalle: String(err?.message ?? err),
      };
    }
  }
}