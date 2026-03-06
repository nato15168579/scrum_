import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EstadoUsuario, Usuario } from '../entities/Usuario';
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

interface FichaDetalle {
  ficha: string;
  nombre: string;
  programa: string;
  estado: string;
  fechaCreacion: string | null;
}

const ESTADOS_USUARIO: EstadoUsuario[] = ['Activo', 'Inactivo'];

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

  private async tableExists(tableName: string) {
    const [result] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName],
    );

    return Number(result?.total || 0) > 0;
  }

  private async ensureFechaRegistroColumn() {
    const hasFechaRegistro = await this.columnExists('usuario', 'fecha_registro');

    if (!hasFechaRegistro) {
      await this.dataSource.query(`
        ALTER TABLE usuario
        ADD COLUMN fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT 'fecha de registro del usuario'
      `);
    }

    const hasRegistroTable = await this.tableExists('usuario_registro');
    if (hasRegistroTable) {
      await this.dataSource.query(`
        UPDATE usuario u
        INNER JOIN usuario_registro r ON r.usu_cedula = u.usu_cedula
        SET u.fecha_registro = r.fecha_registro
      `);

      await this.dataSource.query('DROP TABLE IF EXISTS usuario_registro');
    }
  }

  private async ensureEstadoColumn() {
    const hasEstado = await this.columnExists('usuario', 'usu_estado');

    if (!hasEstado) {
      await this.dataSource.query(`
        ALTER TABLE usuario
        ADD COLUMN usu_estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'
        COMMENT 'estado del usuario (Activo o Inactivo)'
      `);

      await this.dataSource.query(`
        UPDATE usuario
        SET usu_estado = 'Inactivo'
        WHERE usu_cedula = 1047043541 AND rol_sis_ID_FK = 1
      `);
    }

    await this.dataSource.query(`
      UPDATE usuario
      SET usu_estado = 'Activo'
      WHERE usu_estado IS NULL OR TRIM(usu_estado) = ''
    `);
  }

  private async ensureUsuarioColumns() {
    await this.ensureFechaRegistroColumn();
    await this.ensureEstadoColumn();
  }

  private async ensureFichaSchema() {
    const missingTables: string[] = [];

    if (!(await this.tableExists('fichas'))) {
      missingTables.push('fichas');
    }

    if (!(await this.tableExists('usuario_ficha'))) {
      missingTables.push('usuario_ficha');
    }

    if (missingTables.length > 0) {
      throw new InternalServerErrorException(
        `Faltan tablas requeridas en la base de datos: ${missingTables.join(', ')}. Importa el esquema SQL actualizado.`,
      );
    }
  }

  private normalizeEstado(value: unknown): EstadoUsuario {
    return value === 'Inactivo' ? 'Inactivo' : 'Activo';
  }

  private formatDateToIso(value: unknown) {
    if (!value) return null;

    const parsedDate = new Date(String(value));
    if (Number.isNaN(parsedDate.getTime())) return null;

    return parsedDate.toISOString();
  }

  private buildFichaDetalle(row: any): FichaDetalle | null {
    if (!row?.ficha) return null;

    return {
      ficha: String(row.ficha),
      nombre: row.fichaNombre || 'Sin nombre',
      programa: row.programa || 'Sin programa',
      estado: row.fichaEstado || 'Sin estado',
      fechaCreacion: this.formatDateToIso(row.fichaFechaCreacion),
    };
  }

  private async getRolUsuario(cedula?: string) {
    const documento = Number(cedula);
    if (!documento || Number.isNaN(documento)) {
      return null;
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { usuCedula: documento },
      select: ['rolSisIdFk'],
    });

    return usuario?.rolSisIdFk ?? null;
  }

  private async getFichasAsignadasUsuario(cedula: number) {
    const rows = await this.dataSource.query(
      `
        SELECT fic_numero_FK AS ficha
        FROM usuario_ficha
        WHERE usu_cedula_FK = ?
        ORDER BY fic_numero_FK ASC
      `,
      [cedula],
    );

    return (rows || [])
      .map((row: any) => Number(row.ficha))
      .filter((ficha: number) => !Number.isNaN(ficha));
  }

  async findAllFichas() {
    await this.ensureFichaSchema();

    const fichas = await this.dataSource.query(`
      SELECT
        CAST(f.fic_numero AS CHAR) AS numero,
        f.fic_nombre AS nombre,
        f.fic_programa AS programa,
        f.fic_estado AS estado,
        f.fic_fecha_creacion AS fechaCreacion
      FROM fichas f
      ORDER BY f.fic_estado = 'Activa' DESC, f.fic_numero ASC
    `);

    return (fichas || []).map((ficha: any) => ({
      numero: String(ficha.numero),
      nombre: ficha.nombre || 'Sin nombre',
      programa: ficha.programa || 'Sin programa',
      estado: ficha.estado || 'Sin estado',
      fechaCreacion: this.formatDateToIso(ficha.fechaCreacion),
    }));
  }

  async findAllAprendices(cedulaSolicitante?: string) {
    await this.ensureUsuarioColumns();
    await this.ensureFichaSchema();

    const rolSolicitante = await this.getRolUsuario(cedulaSolicitante);
    let filtroFichas = '';
    let params: number[] = [];

    if (rolSolicitante === 2) {
      const fichasAsignadas = await this.getFichasAsignadasUsuario(
        Number(cedulaSolicitante),
      );

      if (fichasAsignadas.length === 0) {
        return [];
      }

      filtroFichas = ` AND uf.fic_numero_FK IN (${fichasAsignadas.map(() => '?').join(', ')})`;
      params = fichasAsignadas;
    }

    const rows = await this.dataSource.query(
      `
      SELECT
        u.usu_cedula AS documento,
        CAST(f.fic_numero AS CHAR) AS ficha,
        f.fic_nombre AS fichaNombre,
        f.fic_programa AS programa,
        u.usu_nombres AS nombre,
        u.usu_apellidos AS apellido,
        u.usu_telefono AS telefono,
        u.usu_correo AS email,
        u.fecha_registro AS fechaInscripcion,
        u.usu_estado AS estado,
        uf.usf_fecha_asignacion AS fechaAsignacionFicha
      FROM usuario u
      LEFT JOIN usuario_ficha uf ON uf.usu_cedula_FK = u.usu_cedula
      LEFT JOIN fichas f ON f.fic_numero = uf.fic_numero_FK
      WHERE u.rol_sis_ID_FK = 1
      ${filtroFichas}
      ORDER BY u.fecha_registro DESC, u.usu_cedula DESC, uf.usf_fecha_asignacion DESC
    `,
      params,
    );

    const aprendicesMap = new Map<string, any>();

    for (const row of rows || []) {
      const documento = String(row.documento);
      const existing = aprendicesMap.get(documento);

      if (!existing) {
        aprendicesMap.set(documento, {
          documento,
          ficha: row.ficha || 'Sin ficha',
          fichaNombre: row.fichaNombre || 'Sin nombre de ficha',
          programa: row.programa || 'Sin programa',
          nombre: row.nombre || '',
          apellido: row.apellido || '',
          telefono: row.telefono || '',
          email: row.email || '',
          fechaInscripcion: this.formatDateToIso(row.fechaInscripcion),
          estado: this.normalizeEstado(row.estado),
        });
        continue;
      }

      if ((!existing.ficha || existing.ficha === 'Sin ficha') && row.ficha) {
        existing.ficha = String(row.ficha);
        existing.fichaNombre = row.fichaNombre || 'Sin nombre de ficha';
        existing.programa = row.programa || 'Sin programa';
      }
    }

    return Array.from(aprendicesMap.values());
  }

  async findAllInstructores(_cedulaSolicitante?: string) {
    await this.ensureUsuarioColumns();
    await this.ensureFichaSchema();

    const rows = await this.dataSource.query(`
      SELECT
        u.usu_cedula AS documento,
        u.usu_especializacion AS especializacion,
        u.usu_nombres AS nombre,
        u.usu_apellidos AS apellido,
        u.usu_telefono AS telefono,
        u.usu_correo AS email,
        u.fecha_registro AS fechaInscripcion,
        CAST(f.fic_numero AS CHAR) AS ficha,
        f.fic_nombre AS fichaNombre,
        f.fic_programa AS programa,
        f.fic_estado AS fichaEstado,
        f.fic_fecha_creacion AS fichaFechaCreacion
      FROM usuario u
      LEFT JOIN usuario_ficha uf ON uf.usu_cedula_FK = u.usu_cedula
      LEFT JOIN fichas f ON f.fic_numero = uf.fic_numero_FK
      WHERE u.rol_sis_ID_FK = 2
      ORDER BY u.fecha_registro DESC, u.usu_cedula DESC, f.fic_numero ASC
    `);

    const instructoresMap = new Map<string, any>();

    for (const row of rows || []) {
      const documento = String(row.documento);

      if (!instructoresMap.has(documento)) {
        instructoresMap.set(documento, {
          documento,
          especializacion: row.especializacion || 'Sin especializacion',
          fichasCargo: [] as string[],
          fichasDetalle: [] as FichaDetalle[],
          nombre: row.nombre || '',
          apellido: row.apellido || '',
          telefono: row.telefono || '',
          email: row.email || '',
          fechaInscripcion: this.formatDateToIso(row.fechaInscripcion),
        });
      }

      const instructor = instructoresMap.get(documento);
      const fichaDetalle = this.buildFichaDetalle(row);

      if (
        fichaDetalle &&
        !instructor.fichasCargo.includes(fichaDetalle.ficha)
      ) {
        instructor.fichasCargo.push(fichaDetalle.ficha);
        instructor.fichasDetalle.push(fichaDetalle);
      }
    }

    return Array.from(instructoresMap.values());
  }

  async createAprendiz(payload: CreateAprendizDto) {
    await this.ensureUsuarioColumns();
    await this.ensureFichaSchema();

    const cedula = Number(payload.cedula);
    if (!cedula || Number.isNaN(cedula)) {
      throw new BadRequestException('La cedula es obligatoria y debe ser numerica.');
    }

    if (!payload.password || payload.password.trim().length < 4) {
      throw new BadRequestException('La contrasena es obligatoria.');
    }

    const fichaNumero = Number(String(payload.ficha || '').trim());
    if (!fichaNumero || Number.isNaN(fichaNumero)) {
      throw new BadRequestException('La ficha es obligatoria y debe ser numerica.');
    }

    const yaExiste = await this.usuarioRepository.findOneBy({
      usuCedula: cedula,
    });

    if (yaExiste) {
      throw new ConflictException('Ya existe un usuario con esa cedula.');
    }

    const [ficha] = await this.dataSource.query(
      `
        SELECT
          fic_numero,
          fic_nombre,
          fic_programa,
          fic_estado
        FROM fichas
        WHERE fic_numero = ?
        LIMIT 1
      `,
      [fichaNumero],
    );

    if (!ficha) {
      throw new NotFoundException('La ficha seleccionada no existe.');
    }

    if (ficha.fic_estado !== 'Activa') {
      throw new BadRequestException('La ficha seleccionada no esta activa.');
    }

    const hash = await bcrypt.hash(payload.password.trim(), 10);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nuevoAprendiz = queryRunner.manager.create(Usuario, {
        usuCedula: cedula,
        usuTipoDocumento: payload.tipoDocumento || 'CC',
        usuNombres: payload.nombre?.trim() || '',
        usuApellidos: payload.apellidos?.trim() || '',
        usuCorreo: payload.correo?.trim() || '',
        usuTelefono: payload.telefono?.trim() || null,
        usuContrasena: hash,
        rolSisIdFk: 1,
        usuEstado: 'Activo',
      });

      await queryRunner.manager.save(Usuario, nuevoAprendiz);

      await queryRunner.query(
        `
          INSERT INTO usuario_ficha (usu_cedula_FK, fic_numero_FK, usf_fecha_asignacion)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `,
        [cedula, fichaNumero],
      );

      const [registro] = await queryRunner.query(
        'SELECT fecha_registro FROM usuario WHERE usu_cedula = ? LIMIT 1',
        [cedula],
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        mensaje: 'Aprendiz registrado correctamente.',
        aprendiz: {
          documento: String(nuevoAprendiz.usuCedula),
          nombre: nuevoAprendiz.usuNombres || '',
          apellido: nuevoAprendiz.usuApellidos || '',
          ficha: String(ficha.fic_numero),
          fichaNombre: ficha.fic_nombre || 'Sin nombre de ficha',
          programa: ficha.fic_programa || 'Sin programa',
          email: nuevoAprendiz.usuCorreo || '',
          fechaInscripcion: this.formatDateToIso(registro?.fecha_registro),
          estado: nuevoAprendiz.usuEstado || 'Activo',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo registrar el aprendiz: ${err?.message || 'Error interno.'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateAprendizEstado(cedula: string, estado: string) {
    await this.ensureUsuarioColumns();

    const documento = Number(cedula);
    if (!documento || Number.isNaN(documento)) {
      throw new BadRequestException('La cedula del aprendiz es invalida.');
    }

    if (!ESTADOS_USUARIO.includes(estado as EstadoUsuario)) {
      throw new BadRequestException('El estado debe ser Activo o Inactivo.');
    }

    const aprendiz = await this.usuarioRepository.findOne({
      where: {
        usuCedula: documento,
        rolSisIdFk: 1,
      },
    });

    if (!aprendiz) {
      throw new NotFoundException('No se encontro el aprendiz solicitado.');
    }

    aprendiz.usuEstado = estado as EstadoUsuario;
    await this.usuarioRepository.save(aprendiz);

    return {
      ok: true,
      documento: String(aprendiz.usuCedula),
      estado: aprendiz.usuEstado,
    };
  }

  async getInstructorStats(cedula: string) {
    const instructor = await this.usuarioRepository.findOne({
      where: { usuCedula: parseInt(cedula) },
      select: ['usuNombres', 'usuApellidos'],
    });

    return {
      instructor: instructor
        ? `${instructor.usuNombres} ${instructor.usuApellidos}`
        : 'Usuario',
    };
  }
}
