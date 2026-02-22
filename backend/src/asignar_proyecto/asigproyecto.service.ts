import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AsigProyectoService {
  constructor(private dataSource: DataSource) {}

  // Obtener todos los proyectos
  async getProyectos() {
    return await this.dataSource.query(`
      SELECT pro_ID, pro_nombre, pro_fecha_inicio 
      FROM proyecto
    `);
  }

  // Obtener aprendices disponibles para asignar
  async getAprendicesParaAsignacion() {
    return await this.dataSource.query(`
      SELECT usu_cedula, usu_nombres, usu_apellidos, usu_correo 
      FROM usuario 
      WHERE rol_ID = (SELECT rol_ID FROM rol WHERE rol_nombre = 'Aprendiz')
    `);
  }

  // Obtener los roles Scrum desde la tabla de parámetros
  async getRolesScrum() {
    return await this.dataSource.query(`
      SELECT det_par_ID, det_par_descripcion 
      FROM detalle_parametros 
      WHERE par_ID = (SELECT par_ID FROM parametros WHERE par_nombre = 'Roles Scrum')
    `);
  }

  // Lógica para insertar la asignación en la tabla intermedia
  async asignarIntegrantes(projectId: number, assignments: any[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const assign of assignments) {
        await queryRunner.query(`
          INSERT INTO proyecto_usuarios (pro_ID, usu_cedula, rol_scrum_ID)
          VALUES ($1, $2, $3)`,
          [projectId, assign.cedula, assign.rolId]
        );
      }
      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al asignar integrantes');
    } finally {
      await queryRunner.release();
    }
  }
}