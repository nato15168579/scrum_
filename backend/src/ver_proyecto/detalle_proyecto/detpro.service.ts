import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DetproService {
  constructor(private dataSource: DataSource) {}

  async getProjectById(id: number) {
    const query = `
      SELECT 
        p.pro_ID as proId, 
        p.pro_nombre as proNombre, 
        p.pro_objetivo_general as proObjetivoGeneral, 
        p.pro_descripcion as proDescripcion, 
        p.pro_fecha_inicio as proFechaInicio,
        p.pro_fecha_fin as proFechaFin,
        p.det_par_ID_FK as detParIdFk
      FROM proyecto p
      WHERE p.pro_ID = ?
    `;
    const result = await this.dataSource.query(query, [id]);
    return result[0] || null;
  }

  async getIntegrantes(id: number) {
    const query = `
      SELECT 
        CONCAT(u.usu_nombres, ' ', u.usu_apellidos) as nombre,
        dp.det_par_descripcion as rol
      FROM usu_pro_det_par updp
      INNER JOIN usuario u ON updp.usu_cedula = u.usu_cedula
      /* ERROR CORREGIDO: de det_par_ID_ a det_par_ID_FK */
      INNER JOIN detalle_parametro dp ON updp.det_par_ID_FK = dp.det_par_ID
      WHERE updp.pro_ID = ?
    `;

    const integrantes = await this.dataSource.query(query, [id]);
    return integrantes;
  }
}