/**
 * AsigProVerService
 * ----------------
 * Servicio de soporte para "ver mas" de un proyecto dentro del flujo de asignacion.
 *
 * Devuelve un payload plano con campos basicos del proyecto y su estado.
 * Usa introspeccion del esquema para tolerar instalaciones donde la tabla de
 * proyectos puede llamarse `proyecto` o ` proyecto` (legacy).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SchemaIntrospection } from '../../shared/database/SchemaIntrospection';

@Injectable()
export class AsigProVerService {
  private readonly schema: SchemaIntrospection;

  constructor(private dataSource: DataSource) {
    this.schema = new SchemaIntrospection(dataSource);
  }

  private wrapIdentifier(identifier: string) {
    return this.schema.wrapIdentifier(identifier);
  }

  private async tableExists(tableName: string) {
    return this.schema.tableExists(tableName);
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
