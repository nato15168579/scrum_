import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class IntegrantesService {
  constructor(private dataSource: DataSource) {}

  // Obtener integrantes actuales del proyecto
  async obtenerIntegrantes(projectId: number) {
    const sql = `
      SELECT u.usu_cedula as documento, u.usu_nombres as nombre, 
             u.usu_apellidos as apellido, u.usu_correo as email, 
             dp.det_par_descripcion AS rol
      FROM usu_pro_det_par up
      JOIN usuario u ON up.usu_cedula = u.usu_cedula
      JOIN detalle_parametro dp ON up.det_par_ID_FK = dp.det_par_ID
      WHERE up.pro_ID = ?
    `;
    return await this.dataSource.query(sql, [projectId]);
  }

  // Obtener aprendices (rol 1) que NO están en este proyecto
  async obtenerDisponibles(projectId: number) {
    const sql = `
      SELECT u.usu_cedula as documento, u.usu_nombres as nombre, 
             u.usu_apellidos as apellido, u.usu_correo as email
      FROM usuario u
      WHERE u.rol_sis_ID_FK = 1 
      AND u.usu_cedula NOT IN (
        SELECT usu_cedula FROM usu_pro_det_par WHERE pro_ID = ?
      )
    `;
    return await this.dataSource.query(sql, [projectId]);
  }

  // Obtener los roles de Scrum (PO, SM, Team) de la tabla de parámetros
  async obtenerRolesScrum() {
    // Filtramos por los IDs que corresponden a los roles en tu DB
    const sql = `
      SELECT det_par_ID, det_par_descripcion 
      FROM detalle_parametro 
      WHERE det_par_ID IN (4, 5, 6)
    `;
    return await this.dataSource.query(sql);
  }

  // Eliminar integrante del proyecto
  async eliminarIntegrantes(projectId: number, cedulas: number[]) {
    return await this.dataSource.query(
      `DELETE FROM usu_pro_det_par WHERE pro_ID = ? AND usu_cedula IN (?)`,
      [projectId, cedulas]
    );
  }

  // Asignar integrantes (Recibe el array assignments del frontend)
  async asignarIntegrantes(projectId: number, assignments: any[]) {
    for (const item of assignments) {
      await this.dataSource.query(
        `INSERT INTO usu_pro_det_par (usu_cedula, pro_ID, det_par_ID_FK) VALUES (?, ?, ?)`,
        [item.cedula, projectId, item.rolId]
      );
    }
    return { success: true };
  }
}