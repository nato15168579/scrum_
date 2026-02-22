import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AsigProVerService {
  constructor(private dataSource: DataSource) {}

  async getProyectoDetalle(id: number) {
    const query = `
      SELECT 
        p.pro_ID, 
        p.pro_nombre, 
        p.pro_fecha_inicio, 
        p.pro_descripcion, 
        p.pro_objetivo_general,
        dp.det_par_descripcion AS estado_nombre
      FROM proyecto p
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