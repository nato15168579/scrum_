import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EstadoUsuario, SexoUsuario, Usuario } from '../entities/Usuario';
import * as bcrypt from 'bcrypt';

interface CreateUsuarioDto {
  cedula: string | number;
  nombre: string;
  apellidos: string;
  correo?: string;
  telefono?: string;
  ficha?: string;
  tipoDocumento?: string;
  sexo?: string;
  especializacion?: string;
  tipoUsuario?: 'aprendiz' | 'instructor';
  password: string;
}

interface UpdateAprendizDto {
  nombre?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  sexo?: string;
  ficha?: string | number;
  estado?: string;
}

interface FichaDetalle {
  ficha: string;
  nombre: string;
  programa: string;
  estado: string;
  fechaCreacion: string | null;
}

const ESTADOS_USUARIO: EstadoUsuario[] = ['Activo', 'Inactivo'];
const SEXOS_USUARIO: SexoUsuario[] = ['Hombre', 'Mujer'];

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

  private async ensureEspecializacionColumn() {
    const hasEspecializacion = await this.columnExists(
      'usuario',
      'usu_especializacion',
    );

    if (!hasEspecializacion) {
      await this.dataSource.query(`
        ALTER TABLE usuario
        ADD COLUMN usu_especializacion VARCHAR(120) NULL
        COMMENT 'especializacion del instructor'
      `);
    }
  }

  private async ensureSexoColumn() {
    const hasSexo = await this.columnExists('usuario', 'usu_sexo');

    if (!hasSexo) {
      await this.dataSource.query(`
        ALTER TABLE usuario
        ADD COLUMN usu_sexo ENUM('Hombre','Mujer') NULL
        COMMENT 'sexo del aprendiz'
      `);
    }
  }

  private async ensureUsuarioColumns() {
    await this.ensureFechaRegistroColumn();
    await this.ensureEstadoColumn();
    await this.ensureEspecializacionColumn();
    await this.ensureSexoColumn();
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

    const hasFichaNombre = await this.columnExists('fichas', 'fic_nombre');
    const hasFichaArea = await this.columnExists('fichas', 'fic_area');

    if (!hasFichaNombre && !hasFichaArea) {
      throw new InternalServerErrorException(
        'La tabla fichas debe tener la columna fic_nombre o fic_area.',
      );
    }
  }

  private async getFichaNombreSelect(alias = 'f') {
    const prefix = alias ? `${alias}.` : '';

    if (await this.columnExists('fichas', 'fic_nombre')) {
      return `${prefix}fic_nombre`;
    }

    if (await this.columnExists('fichas', 'fic_area')) {
      return `${prefix}fic_area`;
    }

    return 'NULL';
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

  private sanitizeText(value: unknown) {
    return String(value ?? '').trim();
  }

  private async getFichaActualUsuario(cedula: number) {
    const [row] = await this.dataSource.query(
      `
        SELECT fic_numero_FK AS ficha, usf_fecha_asignacion AS fechaAsignacion
        FROM usuario_ficha
        WHERE usu_cedula_FK = ?
        ORDER BY usf_fecha_asignacion ASC
        LIMIT 1
      `,
      [cedula],
    );

    return row || null;
  }

  private async getFichaByNumero(fichaNumero: number) {
    const fichaNombreSelect = await this.getFichaNombreSelect('');
    const [ficha] = await this.dataSource.query(
      `
        SELECT
          fic_numero,
          ${fichaNombreSelect} AS fichaNombre,
          fic_programa,
          fic_estado
        FROM fichas
        WHERE fic_numero = ?
        LIMIT 1
      `,
      [fichaNumero],
    );

    return ficha || null;
  }

  private mapAprendizResponse(row: any) {
    return {
      documento: String(row.documento),
      tipoDocumento: row.tipoDocumento || 'CC',
      ficha: row.ficha ? String(row.ficha) : 'Sin ficha',
      area: row.fichaNombre || 'Sin area',
      fichaNombre: row.fichaNombre || 'Sin nombre de ficha',
      programa: row.programa || 'Sin programa',
      nombre: row.nombre || '',
      apellido: row.apellido || '',
      telefono: row.telefono || '',
      email: row.email || '',
      sexo: row.sexo || '',
      fechaInscripcion: this.formatDateToIso(row.fechaInscripcion),
      estado: this.normalizeEstado(row.estado),
    };
  }

  private async deleteUsuarioReferences(queryRunner: any, cedula: number) {
    const references = await queryRunner.query(
      `
        SELECT
          TABLE_NAME AS tableName,
          COLUMN_NAME AS columnName
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
          AND REFERENCED_TABLE_NAME = 'usuario'
          AND REFERENCED_COLUMN_NAME = 'usu_cedula'
        ORDER BY TABLE_NAME ASC
      `,
    );

    for (const reference of references || []) {
      await queryRunner.query(
        `DELETE FROM \`${reference.tableName}\` WHERE \`${reference.columnName}\` = ?`,
        [cedula],
      );
    }
  }

  async findAllFichas() {
    await this.ensureFichaSchema();
    const fichaNombreSelect = await this.getFichaNombreSelect('f');

    const fichas = await this.dataSource.query(`
      SELECT
        CAST(f.fic_numero AS CHAR) AS numero,
        ${fichaNombreSelect} AS nombre,
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
    const fichaNombreSelect = await this.getFichaNombreSelect('f');

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
        u.usu_tipodedocumento AS tipoDocumento,
        CAST(f.fic_numero AS CHAR) AS ficha,
        ${fichaNombreSelect} AS fichaNombre,
        f.fic_programa AS programa,
        u.usu_nombres AS nombre,
        u.usu_apellidos AS apellido,
        u.usu_telefono AS telefono,
        u.usu_correo AS email,
        u.usu_sexo AS sexo,
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
        aprendicesMap.set(documento, this.mapAprendizResponse(row));
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
    const fichaNombreSelect = await this.getFichaNombreSelect('f');

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
        ${fichaNombreSelect} AS fichaNombre,
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

  async createUsuario(payload: CreateUsuarioDto) {
    await this.ensureUsuarioColumns();

    const tipoUsuario =
      payload.tipoUsuario === 'instructor' ? 'instructor' : 'aprendiz';
    const cedula = Number(payload.cedula);
    const nombre = this.sanitizeText(payload.nombre);
    const apellidos = this.sanitizeText(payload.apellidos);
    const correo = this.sanitizeText(payload.correo);
    const telefono = this.sanitizeText(payload.telefono);
    const password = this.sanitizeText(payload.password);
    const tipoDocumento = this.sanitizeText(payload.tipoDocumento) || 'CC';
    const especializacion = this.sanitizeText(payload.especializacion);
    const sexo = this.sanitizeText(payload.sexo);

    if (!cedula || Number.isNaN(cedula)) {
      throw new BadRequestException('La cedula es obligatoria y debe ser numerica.');
    }

    if (!nombre) {
      throw new BadRequestException('El nombre es obligatorio.');
    }

    if (!apellidos) {
      throw new BadRequestException('El apellido es obligatorio.');
    }

    if (!password || password.length < 4) {
      throw new BadRequestException('La contrasena es obligatoria.');
    }

    if (sexo && !SEXOS_USUARIO.includes(sexo as SexoUsuario)) {
      throw new BadRequestException(
        'El sexo debe ser Hombre o Mujer.',
      );
    }

    const sexoNormalizado = sexo ? (sexo as SexoUsuario) : null;

    const yaExiste = await this.usuarioRepository.findOneBy({
      usuCedula: cedula,
    });

    if (yaExiste) {
      throw new ConflictException('Ya existe un usuario con esa cedula.');
    }

    const hash = await bcrypt.hash(password, 10);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (tipoUsuario === 'instructor') {
        if (!correo) {
          throw new BadRequestException('El correo es obligatorio para el instructor.');
        }

        if (!especializacion) {
          throw new BadRequestException(
            'La especializacion es obligatoria para el instructor.',
          );
        }

        const nuevoInstructor = queryRunner.manager.create(Usuario, {
          usuCedula: cedula,
          usuTipoDocumento: tipoDocumento,
          usuNombres: nombre,
          usuApellidos: apellidos,
          usuCorreo: correo,
          usuTelefono: telefono || null,
          usuEspecializacion: especializacion,
          usuSexo: null,
          usuContrasena: hash,
          rolSisIdFk: 2,
          usuEstado: 'Activo',
        });

        await queryRunner.manager.save(Usuario, nuevoInstructor);

        const [registro] = await queryRunner.query(
          'SELECT fecha_registro FROM usuario WHERE usu_cedula = ? LIMIT 1',
          [cedula],
        );

        await queryRunner.commitTransaction();

        return {
          ok: true,
          mensaje: 'Instructor registrado correctamente.',
          instructor: {
            documento: String(nuevoInstructor.usuCedula),
            tipoDocumento: nuevoInstructor.usuTipoDocumento || 'CC',
            nombre: nuevoInstructor.usuNombres || '',
            apellido: nuevoInstructor.usuApellidos || '',
            especializacion: nuevoInstructor.usuEspecializacion || '',
            telefono: nuevoInstructor.usuTelefono || '',
            email: nuevoInstructor.usuCorreo || '',
            fechaInscripcion: this.formatDateToIso(registro?.fecha_registro),
            estado: nuevoInstructor.usuEstado || 'Activo',
          },
        };
      }

      await this.ensureFichaSchema();
      const fichaNumero = Number(String(payload.ficha || '').trim());
      if (!fichaNumero || Number.isNaN(fichaNumero)) {
        throw new BadRequestException('La ficha es obligatoria y debe ser numerica.');
      }

      const ficha = await this.getFichaByNumero(fichaNumero);

      if (!ficha) {
        throw new NotFoundException('La ficha seleccionada no existe.');
      }

      if (ficha.fic_estado !== 'Activa') {
        throw new BadRequestException('La ficha seleccionada no esta activa.');
      }

      const nuevoAprendiz = queryRunner.manager.create(Usuario, {
        usuCedula: cedula,
        usuTipoDocumento: tipoDocumento,
        usuNombres: nombre,
        usuApellidos: apellidos,
        usuCorreo: correo || null,
        usuTelefono: telefono || null,
        usuEspecializacion: null,
        usuSexo: sexoNormalizado,
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
          tipoDocumento: nuevoAprendiz.usuTipoDocumento || 'CC',
          area: ficha.fichaNombre || 'Sin area',
          nombre: nuevoAprendiz.usuNombres || '',
          apellido: nuevoAprendiz.usuApellidos || '',
          ficha: String(ficha.fic_numero),
          fichaNombre: ficha.fichaNombre || 'Sin nombre de ficha',
          programa: ficha.fic_programa || 'Sin programa',
          email: nuevoAprendiz.usuCorreo || '',
          telefono: nuevoAprendiz.usuTelefono || '',
          sexo: nuevoAprendiz.usuSexo || '',
          fechaInscripcion: this.formatDateToIso(registro?.fecha_registro),
          estado: nuevoAprendiz.usuEstado || 'Activo',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo registrar el usuario: ${err?.message || 'Error interno.'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateAprendiz(cedula: string, payload: UpdateAprendizDto) {
    await this.ensureUsuarioColumns();
    await this.ensureFichaSchema();

    const documento = Number(cedula);
    if (!documento || Number.isNaN(documento)) {
      throw new BadRequestException('La cedula del aprendiz es invalida.');
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

    const nombre = this.sanitizeText(payload.nombre ?? aprendiz.usuNombres);
    const apellidos = this.sanitizeText(payload.apellidos ?? aprendiz.usuApellidos);
    const correo = this.sanitizeText(payload.correo ?? aprendiz.usuCorreo);
    const telefono = this.sanitizeText(payload.telefono ?? aprendiz.usuTelefono);
    const sexo = this.sanitizeText(payload.sexo ?? aprendiz.usuSexo);
    const estado = this.sanitizeText(payload.estado ?? aprendiz.usuEstado);

    if (!nombre) {
      throw new BadRequestException('El nombre es obligatorio.');
    }

    if (!apellidos) {
      throw new BadRequestException('El apellido es obligatorio.');
    }

    if (!correo) {
      throw new BadRequestException('El correo es obligatorio.');
    }

    if (!ESTADOS_USUARIO.includes(estado as EstadoUsuario)) {
      throw new BadRequestException('El estado debe ser Activo o Inactivo.');
    }

    if (sexo && !SEXOS_USUARIO.includes(sexo as SexoUsuario)) {
      throw new BadRequestException('El sexo debe ser Hombre o Mujer.');
    }

    const fichaActual = await this.getFichaActualUsuario(documento);
    const fichaNumero = Number(
      String(payload.ficha ?? fichaActual?.ficha ?? '').trim(),
    );

    if (!fichaNumero || Number.isNaN(fichaNumero)) {
      throw new BadRequestException('La ficha es obligatoria y debe ser numerica.');
    }

    const ficha = await this.getFichaByNumero(fichaNumero);

    if (!ficha) {
      throw new NotFoundException('La ficha seleccionada no existe.');
    }

    if (ficha.fic_estado !== 'Activa') {
      throw new BadRequestException('La ficha seleccionada no esta activa.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      aprendiz.usuNombres = nombre;
      aprendiz.usuApellidos = apellidos;
      aprendiz.usuCorreo = correo;
      aprendiz.usuTelefono = telefono || null;
      aprendiz.usuSexo = sexo ? (sexo as SexoUsuario) : null;
      aprendiz.usuEstado = estado as EstadoUsuario;

      await queryRunner.manager.save(Usuario, aprendiz);

      await queryRunner.query(
        'DELETE FROM usuario_ficha WHERE usu_cedula_FK = ?',
        [documento],
      );

      await queryRunner.query(
        `
          INSERT INTO usuario_ficha (usu_cedula_FK, fic_numero_FK, usf_fecha_asignacion)
          VALUES (?, ?, ?)
        `,
        [
          documento,
          fichaNumero,
          fichaActual?.fechaAsignacion || new Date(),
        ],
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        mensaje: 'Aprendiz actualizado correctamente.',
        aprendiz: {
          documento: String(aprendiz.usuCedula),
          tipoDocumento: aprendiz.usuTipoDocumento || 'CC',
          ficha: String(ficha.fic_numero),
          area: ficha.fichaNombre || 'Sin area',
          fichaNombre: ficha.fichaNombre || 'Sin nombre de ficha',
          programa: ficha.fic_programa || 'Sin programa',
          nombre: aprendiz.usuNombres || '',
          apellido: aprendiz.usuApellidos || '',
          telefono: aprendiz.usuTelefono || '',
          email: aprendiz.usuCorreo || '',
          sexo: aprendiz.usuSexo || '',
          fechaInscripcion: this.formatDateToIso(aprendiz.fechaRegistro),
          estado: aprendiz.usuEstado || 'Activo',
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo actualizar el aprendiz: ${err?.message || 'Error interno.'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAprendiz(cedula: string) {
    const documento = Number(cedula);
    if (!documento || Number.isNaN(documento)) {
      throw new BadRequestException('La cedula del aprendiz es invalida.');
    }

    const aprendiz = await this.usuarioRepository.findOne({
      where: {
        usuCedula: documento,
        rolSisIdFk: 1,
      },
      select: ['usuCedula', 'usuNombres', 'usuApellidos'],
    });

    if (!aprendiz) {
      throw new NotFoundException('No se encontro el aprendiz solicitado.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.deleteUsuarioReferences(queryRunner, documento);

      await queryRunner.query(
        'DELETE FROM usuario WHERE usu_cedula = ? AND rol_sis_ID_FK = 1',
        [documento],
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        documento: String(documento),
        mensaje: `Aprendiz ${aprendiz.usuNombres || ''} ${aprendiz.usuApellidos || ''} eliminado correctamente.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo eliminar el aprendiz: ${err?.message || 'Error interno.'}`,
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
