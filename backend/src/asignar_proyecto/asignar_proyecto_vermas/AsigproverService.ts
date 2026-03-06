import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AsigProVerService {
  constructor(private dataSource: DataSource) {}

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

  async getProyectoDetalle(id: number) {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) {
      throw new NotFoundException('La tabla de proyectos no existe');
    }

    const proyectoRef = this.wrapIdentifier(proyectoTable);
    const query = `
      SELECT 
        p.pro_ID, 
        p.pro_nombre, 
        p.pro_fecha_inicio, 
        p.pro_descripcion, 
        p.pro_objetivo_general,
        dp.det_par_descripcion AS estado_nombre
      FROM ${proyectoRef} p
      LEFT JOIN detalle_parametro dp ON p.det_par_ID_FK = dp.det_par_ID
      WHERE p.pro_ID = ?
    `;

    const result = await this.dataSource.query(query, [id]);

    if (!result || result.length === 0) {
      throw new NotFoundException('El proyecto no existe');
    }

    // Retornamos el objeto plano
    return JSON.parse(JSON.stringify(result[0])); 
  }
}
