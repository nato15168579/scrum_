/**
 * CambiosSistemaService
 * --------------------
 * Servicio para el modulo de "Cambios del sistema" en el panel administrador.
 *
 * Objetivo:
 * - Listar observaciones/cambios (pendientes / vistos).
 * - Marcar un cambio como observado.
 *
 * Nota: el modulo se defiende ante instalaciones donde la tabla `cambios_sistema`
 * aun no existe (retorna lista vacia en lugar de romper la pantalla).
 */
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SchemaIntrospection } from "../shared/database/SchemaIntrospection";

type CambiosEstadoFilter = "pendiente" | "visto" | "todos";

interface ListCambiosOptions {
  estado?: string;
  limit?: string;
}

interface CambioRow {
  id: number | string;
  descripcion: string | null;
  fecha: Date | string | null;
  observado: number | string | null;
  usuCedula: number | string | null;
  nombres: string | null;
  apellidos: string | null;
  rol: string | null;
}

@Injectable()
export class CambiosSistemaService {
  private readonly schema: SchemaIntrospection;

  constructor(private readonly dataSource: DataSource) {
    this.schema = new SchemaIntrospection(dataSource);
  }

  private async tableExists(tableName: string) {
    return this.schema.tableExists(tableName);
  }

  private async columnExists(tableName: string, columnName: string) {
    return this.schema.columnExists(tableName, columnName);
  }

  private async resolveCambioObservadoConfig() {
    const hasCamObservado = await this.columnExists("cambios_sistema", "cam_observado");
    const hasFechaObservado = await this.columnExists(
      "cambios_sistema",
      "cam_fecha_observado",
    );
    const hasDetalleParametro = await this.tableExists("detalle_parametro");
    const hasDetParFk = await this.columnExists("cambios_sistema", "det_par_FK");

    return {
      hasCamObservado,
      hasFechaObservado,
      hasDetalleParametro,
      hasDetParFk,
    };
  }

  private async resolveEstadoObservacionId(target: "pendiente" | "visto") {
    const hasDetalleParametro = await this.tableExists("detalle_parametro");
    if (!hasDetalleParametro) return null;

    const [row] = await this.dataSource.query(
      `
        SELECT det_par_ID AS detParId
        FROM detalle_parametro
        WHERE par_ID_FK = 6
          AND LOWER(TRIM(COALESCE(det_par_descripcion, ''))) = ?
        ORDER BY det_par_ID ASC
        LIMIT 1
      `,
      [target],
    );

    return row?.detParId ? Number(row.detParId) : null;
  }

  async listarCambios({ estado, limit }: ListCambiosOptions) {
    const hasTable = await this.tableExists("cambios_sistema");
    if (!hasTable) {
      return { ok: true, cambios: [] };
    }

    const estadoNormalizado = String(estado || "pendiente").trim().toLowerCase();
    const allowedEstados: CambiosEstadoFilter[] = ["pendiente", "visto", "todos"];
    const filtroEstado = allowedEstados.includes(estadoNormalizado as CambiosEstadoFilter)
      ? (estadoNormalizado as CambiosEstadoFilter)
      : "pendiente";

    const parsedLimit = Number(limit ?? 200);
    const take = Number.isFinite(parsedLimit)
      ? Math.min(500, Math.max(1, Math.trunc(parsedLimit)))
      : 200;

    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    const observadoConfig = await this.resolveCambioObservadoConfig();

    if (filtroEstado === "pendiente") {
      if (observadoConfig.hasCamObservado) {
        whereClauses.push("c.cam_observado = 0");
      } else if (observadoConfig.hasFechaObservado) {
        whereClauses.push("c.cam_fecha_observado IS NULL");
      } else if (observadoConfig.hasDetParFk) {
        const pendienteId = observadoConfig.hasDetalleParametro
          ? await this.resolveEstadoObservacionId("pendiente")
          : null;
        if (pendienteId) {
          whereClauses.push("c.det_par_FK = ?");
          params.push(pendienteId);
        } else {
          whereClauses.push("c.det_par_FK IS NULL");
        }
      }
    } else if (filtroEstado === "visto") {
      if (observadoConfig.hasCamObservado) {
        whereClauses.push("c.cam_observado = 1");
      } else if (observadoConfig.hasFechaObservado) {
        whereClauses.push("c.cam_fecha_observado IS NOT NULL");
      } else if (observadoConfig.hasDetParFk) {
        const vistoId = observadoConfig.hasDetalleParametro
          ? await this.resolveEstadoObservacionId("visto")
          : null;
        if (vistoId) {
          whereClauses.push("c.det_par_FK = ?");
          params.push(vistoId);
        } else {
          whereClauses.push("c.det_par_FK IS NOT NULL");
        }
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const observadoSelect = observadoConfig.hasCamObservado
      ? "c.cam_observado"
      : observadoConfig.hasFechaObservado
      ? "CASE WHEN c.cam_fecha_observado IS NULL THEN 0 ELSE 1 END"
      : observadoConfig.hasDetParFk
      ? "CASE WHEN c.det_par_FK IS NULL THEN 0 ELSE 1 END"
      : "0";

    const rows = (await this.dataSource.query(
      `
        SELECT
          c.cam_ID AS id,
          c.cam_descripcion AS descripcion,
          c.cam_fecha AS fecha,
          ${observadoSelect} AS observado,
          u.usu_cedula AS usuCedula,
          u.usu_nombres AS nombres,
          u.usu_apellidos AS apellidos,
          r.rol_nombre AS rol
        FROM cambios_sistema c
        LEFT JOIN usuario u ON u.usu_cedula = c.usu_cedula_FK
        LEFT JOIN rol_sistema r ON r.rol_sis_ID = u.rol_sis_ID_FK
        ${whereSql}
        ORDER BY c.cam_ID DESC
        LIMIT ${take}
      `,
      params,
    )) as CambioRow[];

    const cambios = rows.map((row) => ({
      id: Number(row.id),
      descripcion: String(row.descripcion || "").trim(),
      fecha: row.fecha ?? null,
      observado: Number(row.observado || 0) === 1,
      usuario: {
        cedula: row.usuCedula ? String(row.usuCedula) : "",
        nombres: row.nombres || "",
        apellidos: row.apellidos || "",
        rol: row.rol || "",
      },
    }));

    return { ok: true, cambios };
  }

  async marcarComoObservado(id: number) {
    if (!Number.isFinite(id) || id <= 0) {
      throw new BadRequestException("El id del cambio es invalido.");
    }

    const hasTable = await this.tableExists("cambios_sistema");
    if (!hasTable) {
      throw new BadRequestException("La tabla cambios_sistema no existe.");
    }

    const observadoConfig = await this.resolveCambioObservadoConfig();
    const updates: string[] = [];
    const params: Array<number> = [];

    if (observadoConfig.hasCamObservado) {
      updates.push("cam_observado = 1");
    }

    if (observadoConfig.hasFechaObservado) {
      updates.push("cam_fecha_observado = CURRENT_TIMESTAMP");
    }

    if (observadoConfig.hasDetParFk && observadoConfig.hasDetalleParametro) {
      const vistoId = await this.resolveEstadoObservacionId("visto");
      if (vistoId) {
        updates.push("det_par_FK = ?");
        params.push(vistoId);
      }
    }

    if (updates.length === 0) {
      throw new BadRequestException(
        "La tabla cambios_sistema no tiene columnas para marcar como observado.",
      );
    }

    const whereParts = ["cam_ID = ?"];
    const whereParams: Array<number> = [id];

    if (observadoConfig.hasCamObservado) {
      whereParts.push("cam_observado = 0");
    } else if (observadoConfig.hasFechaObservado) {
      whereParts.push("cam_fecha_observado IS NULL");
    }

    const result = await this.dataSource.query(
      `
        UPDATE cambios_sistema
        SET ${updates.join(", ")}
        WHERE ${whereParts.join(" AND ")}
      `,
      [...params, ...whereParams],
    );

    // MariaDB retorna OkPacket; intentamos inferir affectedRows.
    const affected = Number(result?.affectedRows ?? result?.[0]?.affectedRows ?? 0);
    if (!affected) {
      throw new NotFoundException("No se encontro un cambio pendiente con ese id.");
    }

    return { ok: true, id };
  }
}
