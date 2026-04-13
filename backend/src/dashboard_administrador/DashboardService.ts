/**
 * Servicio del dashboard administrador.
 *
 * Resume informacion operativa del sistema sin asumir que el esquema este
 * perfectamente normalizado. Por eso incluye verificaciones dinamicas sobre
 * tablas y columnas antes de calcular metricas.
 */
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Usuario } from "../entities/Usuario";
import { SchemaIntrospection } from "../shared/database/SchemaIntrospection";

interface CountRow {
  total?: number | string | null;
}

interface EstadoRow {
  estado?: number | string | null;
}

interface UsuarioRolEstadoRow {
  rolId?: number | string | null;
  estado?: string | null;
}

export interface UsuarioRolEstadoChartRow {
  rol: string;
  activos: number;
  inactivos: number;
  total: number;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly schema: SchemaIntrospection;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private dataSource: DataSource,
  ) {
    this.schema = new SchemaIntrospection(dataSource);
  }

  // Envuelve nombres dinamicos de tablas o columnas para evitar SQL invalido.
  private wrapIdentifier(identifier: string) {
    return this.schema.wrapIdentifier(identifier);
  }

  private async tableExists(tableName: string) {
    return this.schema.tableExists(tableName);
  }

  private async columnExists(tableName: string, columnName: string) {
    return this.schema.columnExists(tableName, columnName);
  }

  private async resolveFichaTable() {
    if (await this.tableExists("fichas")) {
      return "fichas";
    }

    if (await this.tableExists("ficha")) {
      return "ficha";
    }

    return null;
  }

  private async resolveReunionUsuarioTable() {
    if (await this.tableExists("usu_reu_pro")) {
      return { tableName: "usu_reu_pro", userColumn: "usu_cedula_FK" };
    }

    if (await this.tableExists("usu_asis")) {
      return { tableName: "usu_asis", userColumn: "usu_cedula" };
    }

    if (await this.tableExists("usu_reu")) {
      return { tableName: "usu_reu", userColumn: "usu_cedula_FK" };
    }

    return null;
  }

  // Algunos despliegues traen variaciones de nombres en la tabla de proyectos;
  // este metodo se adapta y devuelve metricas aunque falten ciertas columnas.
  private async getProyectoStats() {
    const tableCandidates = ["proyecto", " proyecto"];
    let proyectoTable: string | null = null;

    for (const candidate of tableCandidates) {
      if (await this.tableExists(candidate)) {
        proyectoTable = candidate;
        break;
      }
    }

    if (!proyectoTable) {
      return { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 };
    }

    const tableRef = this.wrapIdentifier(proyectoTable);

    const [totalRow] = (await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM ${tableRef}`,
    )) as CountRow[];
    const total = Number(totalRow?.total || 0);

    const statusCandidates = ["det_par_ID_FK", "det_par_id_fk"];
    let statusColumn: string | null = null;

    for (const candidate of statusCandidates) {
      if (await this.columnExists(proyectoTable, candidate)) {
        statusColumn = candidate;
        break;
      }
    }

    if (!statusColumn) {
      return { total, porHacer: 0, enProgreso: 0, hecho: 0 };
    }

    const statusRef = this.wrapIdentifier(statusColumn);
    const statusRows = (await this.dataSource.query(
      `SELECT ${statusRef} AS estado FROM ${tableRef}`,
    )) as EstadoRow[];

    const porHacer = statusRows.filter((row) => Number(row.estado) === 1)
      .length;
    const enProgreso = statusRows.filter((row) => Number(row.estado) === 2)
      .length;
    const hecho = statusRows.filter((row) => Number(row.estado) === 3)
      .length;

    return { total, porHacer, enProgreso, hecho };
  }

  // Entrega una foto actual del sistema por rol y estado para que el dashboard
  // pueda pintar graficas sin repetir consultas ni asumir estructuras fijas.
  private async getUsuariosPorRolEstado(): Promise<UsuarioRolEstadoChartRow[]> {
    if (!(await this.tableExists("usuario"))) {
      return [
        { rol: "Aprendices", activos: 0, inactivos: 0, total: 0 },
        { rol: "Instructores", activos: 0, inactivos: 0, total: 0 },
        { rol: "Administradores", activos: 0, inactivos: 0, total: 0 },
      ];
    }

    const tableRef = this.wrapIdentifier("usuario");
    const roleRef = this.wrapIdentifier("rol_sis_ID_FK");
    const hasEstadoColumn = await this.columnExists("usuario", "usu_estado");
    const estadoRef = hasEstadoColumn
      ? `COALESCE(NULLIF(TRIM(${this.wrapIdentifier("usu_estado")}), ''), 'Activo')`
      : `'Activo'`;

    const rows = (await this.dataSource.query(
      `
      SELECT
        ${roleRef} AS rolId,
        ${estadoRef} AS estado
      FROM ${tableRef}
      WHERE ${roleRef} IN (1, 2, 3)
    `,
    )) as UsuarioRolEstadoRow[];

    const summaryByRole = new Map<number, UsuarioRolEstadoChartRow>([
      [1, { rol: "Aprendices", activos: 0, inactivos: 0, total: 0 }],
      [2, { rol: "Instructores", activos: 0, inactivos: 0, total: 0 }],
      [3, { rol: "Administradores", activos: 0, inactivos: 0, total: 0 }],
    ]);

    for (const row of rows) {
      const roleId = Number(row.rolId);
      const target = summaryByRole.get(roleId);

      if (!target) {
        continue;
      }

      const estadoNormalizado =
        String(row.estado || "Activo").trim().toLowerCase() === "inactivo"
          ? "Inactivo"
          : "Activo";

      target.total += 1;

      if (estadoNormalizado === "Inactivo") {
        target.inactivos += 1;
        continue;
      }

      target.activos += 1;
    }

    return Array.from(summaryByRole.values());
  }

  async obtenerDatosDashboard(cedulaInput: string | number) {
    try {
      const cedula = Number(cedulaInput);

      const usuario = await this.usuarioRepository.findOneBy({
        usuCedula: cedula,
      });

      if (!usuario) {
        this.logger.warn(`Usuario con cedula ${cedula} no encontrado`);
        return { error: "Usuario no encontrado" };
      }

      let reunionesCount = 0;
      try {
        const reunionUsuarioTable = await this.resolveReunionUsuarioTable();

        if (reunionUsuarioTable) {
          const tableRef = this.wrapIdentifier(reunionUsuarioTable.tableName);
          const userColumnRef = this.wrapIdentifier(reunionUsuarioTable.userColumn);
          const queryResult = (await this.dataSource.query(
            `SELECT COUNT(*) as total FROM ${tableRef} WHERE ${userColumnRef} = ?`,
            [cedula],
          )) as CountRow[];
          reunionesCount = Number(queryResult[0]?.total || 0);
        }
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.logger.error(
          "Error al consultar la tabla intermedia de reuniones:",
          error.message,
        );
      }

      let totalFichasSena = 0;
      try {
        const fichaTable = await this.resolveFichaTable();

        if (fichaTable) {
          const tableRef = this.wrapIdentifier(fichaTable);
          const [fichasRow] = (await this.dataSource.query(
            `SELECT COUNT(*) AS total FROM ${tableRef}`,
          )) as CountRow[];
          totalFichasSena = Number(fichasRow?.total || 0);
        }
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.logger.error("Error al calcular fichas:", error.message);
      }

      let proyectosStats = { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 };
      try {
        proyectosStats = await this.getProyectoStats();
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.logger.error("Error al calcular proyectos:", error.message);
      }

      let usuariosPorRolEstado: UsuarioRolEstadoChartRow[] = [
        { rol: "Aprendices", activos: 0, inactivos: 0, total: 0 },
        { rol: "Instructores", activos: 0, inactivos: 0, total: 0 },
        { rol: "Administradores", activos: 0, inactivos: 0, total: 0 },
      ];
      try {
        usuariosPorRolEstado = await this.getUsuariosPorRolEstado();
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.logger.error(
          "Error al calcular resumen de usuarios por rol:",
          error.message,
        );
      }

      // El payload final mezcla datos de perfil y metricas generales para que el
      // frontend admin pueda construir el panel sin pedir mas endpoints.
      return {
        instructor:
          `${usuario.usuNombres || ""} ${usuario.usuApellidos || ""}`.trim(),
        correo: usuario.usuCorreo || "Sin correo",
        description:
          "Bienvenido al centro de administracion del sistema. Desde aqui puedes supervisar el estado general de la plataforma, gestionar usuarios, monitorear proyectos y dar seguimiento a reportes en tiempo real. Este panel te ofrece una vision estrategica del rendimiento, crecimiento y actividad del sistema para mantener el control operativo en todo momento.",
        stats: [
          { label: "Cantidad de fichas", value: totalFichasSena },
          { label: "Reuniones observadas", value: reunionesCount },
          { label: "Proyectos (Global)", value: proyectosStats.total },
        ],
        proyectosData: {
          total: proyectosStats.total,
          porHacer: proyectosStats.porHacer,
          enProgreso: proyectosStats.enProgreso,
          hecho: proyectosStats.hecho,
        },
        usuariosPorRolEstado,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Error critico en DashboardService:", err.message);
      throw new Error(`Error interno: ${err.message}`);
    }
  }
}
