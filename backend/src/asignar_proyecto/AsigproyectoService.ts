/**
 * AsigProyectoService
 * ------------------
 * Servicio para asignar integrantes (aprendices) a proyectos y consultar catalogos
 * relacionados (proyectos, aprendices, roles Scrum).
 *
 * Nota: este modulo usa SQL directo y esta sujeto a variaciones de esquema segun
 * la version de la base de datos. Mantenerlo alineado con el script SQL activo.
 */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SchemaIntrospection } from '../shared/database/SchemaIntrospection';

interface AssignmentInput {
  cedula: number;
  rolId: number;
}

@Injectable()
export class AsigProyectoService {
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

  // Obtener todos los proyectos
  async getProyectos() {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) return [];

    const tableRef = this.wrapIdentifier(proyectoTable);
    return await this.dataSource.query(`
      SELECT pro_ID, pro_nombre, pro_fecha_inicio 
      FROM ${tableRef}
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
  async asignarIntegrantes(projectId: number, assignments: AssignmentInput[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const assign of assignments) {
        await queryRunner.query(`
          INSERT INTO proyecto_usuarios (pro_ID, usu_cedula, rol_scrum_ID)
          VALUES (?, ?, ?)`,
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
