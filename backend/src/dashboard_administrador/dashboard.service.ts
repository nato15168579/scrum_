import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull, DataSource } from "typeorm";
import { Usuario } from "../entities/Usuario";

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private dataSource: DataSource,
  ) {}

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

    const [totalRow] = await this.dataSource.query(
      `SELECT COUNT(*) AS total FROM ${tableRef}`,
    );
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
    const statusRows = await this.dataSource.query(
      `SELECT ${statusRef} AS estado FROM ${tableRef}`,
    );

    const porHacer = statusRows.filter((row: any) => Number(row.estado) === 1)
      .length;
    const enProgreso = statusRows.filter(
      (row: any) => Number(row.estado) === 2,
    ).length;
    const hecho = statusRows.filter((row: any) => Number(row.estado) === 3)
      .length;

    return { total, porHacer, enProgreso, hecho };
  }

  async obtenerDatosDashboard(cedulaInput: any) {
    try {
      const cedula = Number(cedulaInput);

      // 1. OBTENER DATOS DEL USUARIO
      // Usamos findOneBy para evitar problemas de tipos con la cédula
      const usuario = await this.usuarioRepository.findOneBy({
        usuCedula: cedula,
      });

      if (!usuario) {
        this.logger.warn(`Usuario con cédula ${cedula} no encontrado`);
        return { error: "Usuario no encontrado" };
      }

      // 2. CONTEO DE REUNIONES (Consultando la tabla intermedia usu_asis)
      // En tu Usuario.ts definiste: @JoinTable({ name: "usu_asis" ... })
      let reunionesCount = 0;
      try {
        const queryResult = await this.dataSource.query(
          "SELECT COUNT(*) as total FROM usu_asis WHERE usu_cedula = ?",
          [cedula],
        );
        reunionesCount = parseInt(queryResult[0].total) || 0;
      } catch (e) {
        this.logger.error(
          "Error al consultar la tabla intermedia usu_asis:",
          e.message,
        );
      }

      // 3. CONTEO DE FICHAS ÚNICAS
      let totalFichasSena = 0;
      try {
        const usuariosConFicha = await this.usuarioRepository.find({
          where: { usuFicha: Not(IsNull()) },
          select: ["usuFicha"],
        });
        const fichasUnicas = [
          ...new Set(usuariosConFicha.map((u) => u.usuFicha)),
        ];
        totalFichasSena = fichasUnicas.filter((f) => f).length;
      } catch (e) {
        this.logger.error("Error al calcular fichas:", e.message);
      }

      // 4. PROCESAMIENTO DE PROYECTOS (tolerante a esquemas de BD distintos)
      let proyectosStats = { total: 0, porHacer: 0, enProgreso: 0, hecho: 0 };
      try {
        proyectosStats = await this.getProyectoStats();
      } catch (e) {
        this.logger.error("Error al calcular proyectos:", e.message);
      }

      // 5. RESPUESTA PARA EL FRONTEND
      // Aquí usamos los nombres EXACTOS de tu Usuario.ts
      return {
        instructor:
          `${usuario.usuNombres || ""} ${usuario.usuApellidos || ""}`.trim(),
        correo: usuario.usuCorreo || "Sin correo",
        description:
          "Bienvenido al centro de administración del sistema. Desde aquí puedes supervisar el estado general de la plataforma, gestionar usuarios, monitorear proyectos y dar seguimiento a reportes en tiempo real.Este panel te ofrece una visión estratégica del rendimiento, crecimiento y actividad del sistema, permitiéndote tomar decisiones informadas y mantener el control operativo en todo momento.Utiliza el menú lateral para acceder a cada módulo y administrar los recursos de forma eficiente.",
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
      this.logger.error("Error crítico en DashboardService:", error.message);
      throw new Error(`Error interno: ${error.message}`);
    }
  }
}
