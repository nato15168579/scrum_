import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

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
  constructor(private readonly dataSource: DataSource) {}

  private async tableExists(tableName: string) {
    const [result] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName],
    );

    return Number(result?.total || 0) > 0;
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

    if (filtroEstado === "pendiente") {
      whereClauses.push("c.cam_observado = 0");
    } else if (filtroEstado === "visto") {
      whereClauses.push("c.cam_observado = 1");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const rows = (await this.dataSource.query(
      `
        SELECT
          c.cam_ID AS id,
          c.cam_descripcion AS descripcion,
          c.cam_fecha AS fecha,
          c.cam_observado AS observado,
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

    const result = await this.dataSource.query(
      `
        UPDATE cambios_sistema
        SET cam_observado = 1,
            cam_fecha_observado = CURRENT_TIMESTAMP
        WHERE cam_ID = ?
          AND cam_observado = 0
      `,
      [id],
    );

    // MariaDB retorna OkPacket; intentamos inferir affectedRows.
    const affected = Number(result?.affectedRows ?? result?.[0]?.affectedRows ?? 0);
    if (!affected) {
      throw new NotFoundException("No se encontro un cambio pendiente con ese id.");
    }

    return { ok: true, id };
  }
}

