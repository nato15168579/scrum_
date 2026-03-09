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

interface CountRow {
  total?: number | string | null;
}

interface EstadoRow {
  estado?: number | string | null;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private dataSource: DataSource,
  ) {}

  // Envuelve nombres dinamicos de tablas o columnas para evitar SQL invalido.
  private wrapIdentifier(identifier: string) {
    return `\`${identifier.replace(/`/g, "``")}\``;
  }

  private async tableExists(tableName: string) {
    const [row] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName],
    );

    return Number(row?.total || 0) > 0;
  }

  private async columnExists(tableName: string, columnName: string) {
    const [row] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return Number(row?.total || 0) > 0;
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
        const queryResult = (await this.dataSource.query(
          "SELECT COUNT(*) as total FROM usu_asis WHERE usu_cedula = ?",
          [cedula],
        )) as CountRow[];
        reunionesCount = Number(queryResult[0]?.total || 0);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        this.logger.error(
          "Error al consultar la tabla intermedia usu_asis:",
          error.message,
        );
      }

      let totalFichasSena = 0;
      try {
        if (await this.tableExists("fichas")) {
          const [fichasRow] = (await this.dataSource.query(
            "SELECT COUNT(*) AS total FROM fichas",
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
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Error critico en DashboardService:", err.message);
      throw new Error(`Error interno: ${err.message}`);
    }
  }
}
