import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario';
import * as bcrypt from 'bcrypt';

interface CreateAprendizDto {
  cedula: string | number;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  ficha?: string;
  tipoDocumento?: string;
  sexo?: string;
  password: string;
}

@Injectable()
export class ListaService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  private async columnExists(tableName: string, columnName: string) {
    const [result] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return Number(result?.total || 0) > 0;
  }

  private async ensureRegistroTable() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS usuario_registro (
        usu_cedula INT NOT NULL,
        fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usu_cedula),
        CONSTRAINT fk_usuario_registro_usuario
          FOREIGN KEY (usu_cedula) REFERENCES usuario(usu_cedula)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  async findAllAprendices() {
    await this.ensureRegistroTable();
    const hasProgramaColumn = await this.columnExists('usuario', 'usu_programa');
    const programaSelect = hasProgramaColumn ? 'u.usu_programa' : 'NULL';

    const aprendices = await this.dataSource.query(
      `
        SELECT
          u.usu_cedula AS documento,
          u.usu_ficha AS ficha,
          ${programaSelect} AS programa,
          u.usu_nombres AS nombre,
          u.usu_apellidos AS apellido,
          u.usu_telefono AS telefono,
          u.usu_correo AS email,
          r.fecha_registro AS fechaInscripcion
        FROM usuario u
        LEFT JOIN usuario_registro r
          ON r.usu_cedula = u.usu_cedula
        WHERE u.rol_sis_ID_FK = 1
        ORDER BY r.fecha_registro DESC, u.usu_cedula DESC
      `,
    );

    return (aprendices || []).map((ap: any) => ({
      documento: String(ap.documento),
      ficha: ap.ficha || 'Sin ficha',
      programa: ap.programa || 'Sin programa',
      nombre: ap.nombre || '',
      apellido: ap.apellido || '',
      telefono: ap.telefono || '',
      email: ap.email || '',
      fechaInscripcion: ap.fechaInscripcion
        ? new Date(ap.fechaInscripcion).toISOString()
        : null,
    }));
  }

  async findAllInstructores() {
    await this.ensureRegistroTable();

    const instructores = await this.dataSource.query(
      `
        SELECT
          u.usu_cedula AS documento,
          u.usu_ficha AS ficha,
          u.usu_nombres AS nombre,
          u.usu_apellidos AS apellido,
          u.usu_telefono AS telefono,
          u.usu_correo AS email,
          r.fecha_registro AS fechaInscripcion
        FROM usuario u
        LEFT JOIN usuario_registro r
          ON r.usu_cedula = u.usu_cedula
        WHERE u.rol_sis_ID_FK = 2
        ORDER BY r.fecha_registro DESC, u.usu_cedula DESC
      `,
    );

    return (instructores || []).map((inst: any) => ({
      documento: String(inst.documento),
      ficha: inst.ficha || 'Sin ficha',
      nombre: inst.nombre || '',
      apellido: inst.apellido || '',
      telefono: inst.telefono || '',
      email: inst.email || '',
      fechaInscripcion: inst.fechaInscripcion
        ? new Date(inst.fechaInscripcion).toISOString()
        : null,
    }));
  }

  async createAprendiz(payload: CreateAprendizDto) {
    const cedula = Number(payload.cedula);
    if (!cedula || Number.isNaN(cedula)) {
      throw new BadRequestException('La cedula es obligatoria y debe ser numerica.');
    }

    if (!payload.password || payload.password.trim().length < 4) {
      throw new BadRequestException('La contrasena es obligatoria.');
    }

    const yaExiste = await this.usuarioRepository.findOneBy({
      usuCedula: cedula,
    });

    if (yaExiste) {
      throw new ConflictException('Ya existe un usuario con esa cedula.');
    }

    const hash = await bcrypt.hash(payload.password.trim(), 10);

    const nuevoAprendiz = this.usuarioRepository.create({
      usuCedula: cedula,
      usuTipoDocumento: payload.tipoDocumento || 'CC',
      usuNombres: payload.nombre?.trim() || '',
      usuApellidos: payload.apellidos?.trim() || '',
      usuCorreo: payload.correo?.trim() || '',
      usuTelefono: payload.telefono?.trim() || null,
      usuContrasena: hash,
      rolSisIdFk: 1,
      usuFicha: payload.ficha?.trim() || null,
    });

    try {
      await this.usuarioRepository.save(nuevoAprendiz);

      await this.ensureRegistroTable();
      await this.dataSource.query(
        `
          INSERT INTO usuario_registro (usu_cedula, fecha_registro)
          VALUES (?, NOW())
          ON DUPLICATE KEY UPDATE fecha_registro = fecha_registro
        `,
        [cedula],
      );

      const [registro] = await this.dataSource.query(
        'SELECT fecha_registro FROM usuario_registro WHERE usu_cedula = ? LIMIT 1',
        [cedula],
      );

      return {
        ok: true,
        mensaje: 'Aprendiz registrado correctamente.',
        aprendiz: {
          documento: String(nuevoAprendiz.usuCedula),
          nombre: nuevoAprendiz.usuNombres || '',
          apellido: nuevoAprendiz.usuApellidos || '',
          ficha: nuevoAprendiz.usuFicha || 'Sin ficha',
          email: nuevoAprendiz.usuCorreo || '',
          fechaInscripcion: registro?.fecha_registro
            ? new Date(registro.fecha_registro).toISOString()
            : null,
        },
      };
    } catch (error) {
      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo registrar el aprendiz: ${err?.message || 'Error interno.'}`,
      );
    }
  }

  async getInstructorStats(cedula: string) {
    const instructor = await this.usuarioRepository.findOne({
      where: { usuCedula: parseInt(cedula) },
      select: ['usuNombres', 'usuApellidos'],
    });

    return {
      instructor: instructor
        ? `${instructor.usuNombres} ${instructor.usuApellidos}`
        : 'Instructor SENA',
    };
  }
}
