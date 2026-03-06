import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class VerproService {
  constructor(private readonly dataSource: DataSource) {}

  private wrapIdentifier(identifier: string) {
    return `\`${identifier.replace(/`/g, '``')}\``;
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

  private async resolveProyectoTable() {
    const candidates = ['proyecto', ' proyecto'];
    for (const candidate of candidates) {
      if (await this.tableExists(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  async findAll() {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) return [];

    const tableRef = this.wrapIdentifier(proyectoTable);
    return await this.dataSource.query(
      `
      SELECT
        p.pro_ID AS proId,
        p.pro_codigo AS proCodigo,
        p.pro_nombre AS proNombre,
        p.pro_descripcion AS proDescription,
        p.pro_objetivo_general AS proObjetivoGeneral,
        p.pro_fecha_inicio AS proFechaInicio,
        p.pro_fecha_fin AS proFechaFin,
        p.det_par_ID_FK AS detParIdFk
      FROM ${tableRef} p
      ORDER BY p.pro_ID DESC
      `,
    );
  }

  async findOne(id: number) {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    const tableRef = this.wrapIdentifier(proyectoTable);
    const result = await this.dataSource.query(
      `
      SELECT
        p.pro_ID AS proId,
        p.pro_codigo AS proCodigo,
        p.pro_nombre AS proNombre,
        p.pro_descripcion AS proDescription,
        p.pro_objetivo_general AS proObjetivoGeneral,
        p.pro_fecha_inicio AS proFechaInicio,
        p.pro_fecha_fin AS proFechaFin,
        p.det_par_ID_FK AS detParIdFk
      FROM ${tableRef} p
      WHERE p.pro_ID = ?
      LIMIT 1
      `,
      [id],
    );

    const proyecto = Array.isArray(result) && result.length > 0 ? result[0] : null;
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    return proyecto;
  }
}
