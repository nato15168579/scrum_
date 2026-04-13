import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AsigProyectoService {
  constructor(private dataSource: DataSource) {}

  async getProyectos() {
    return await this.dataSource.query(`
      SELECT pro_ID as proId, pro_nombre as proNombre, pro_fecha_creacion as proFechaCreacion 
      FROM proyecto
    `);
  }

  async getAprendicesParaAsignacion() {
    return await this.dataSource.query(`
      SELECT usu_cedula as usuCedula, usu_nombres as usuNombres, usu_apellidos as usuApellidos, usu_correo as usuCorreo 
      FROM usuario 
      WHERE rol_sis_ID_FK = 1
    `);
  }

  // --- ESTE ES EL MÉTODO QUE ESTABA DANDO EL ERROR ---
  async getRolesScrum() {
    return await this.dataSource.query(`
      SELECT 
        det_par_ID as detParId, 
        det_par_descripcion as detParDescripcion 
      FROM detalle_parametro 
      WHERE par_ID_FK = (SELECT par_ID FROM parametro WHERE par_nombre = 'Rol Scrum')
    `);
  }

  async asignarIntegrantes(projectId: number, assignments: any[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const assign of assignments) {
        await queryRunner.query(`
          INSERT INTO usu_pro_det_par (pro_ID_FK, usu_cedula_FK, det_par_ID_FK)
          VALUES (?, ?, ?)`,
          [projectId, assign.cedula, assign.rolId]
        );
      }
      await queryRunner.commitTransaction();
      return { success: true, message: 'Integrantes asignados correctamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al asignar integrantes');
    } finally {
      await queryRunner.release();
    }
  }
}