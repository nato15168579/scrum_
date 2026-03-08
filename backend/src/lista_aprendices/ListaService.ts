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
  password?: string;
}

interface CreateFichaDto {
  numero: string | number;
  nombre: string;
  programa: string;
  estado?: 'Activa' | 'Inactiva';
  allowCustomCatalogValues?: boolean;
}

interface ImportUsuarioDto {
  documento: string | number;
  tipoDocumento?: string;
  ficha?: string | number;
  nombre: string;
  apellido: string;
  sexo?: string;
  telefono?: string;
  email?: string;
  especializacion?: string;
  tipoUsuario?: 'aprendiz' | 'instructor' | string;
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

interface UpdateInstructorDto {
  nombre?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  sexo?: string;
  especializacion?: string;
  fichas?: Array<string | number>;
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
const ESTADOS_FICHA = ['Activa', 'Inactiva'] as const;

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

  private async ensureUsuarioCedulaBigInt() {
    const [usuarioCedula] = await this.dataSource.query(
      `
        SELECT DATA_TYPE AS dataType
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'usuario'
          AND COLUMN_NAME = 'usu_cedula'
      `,
    );

    if (!usuarioCedula) {
      throw new InternalServerErrorException(
        'La tabla usuario debe tener la columna usu_cedula.',
      );
    }

    if (String(usuarioCedula.dataType || '').toLowerCase() === 'bigint') {
      return;
    }

    const foreignKeys = await this.dataSource.query(
      `
        SELECT
          kcu.TABLE_NAME AS tableName,
          kcu.COLUMN_NAME AS columnName,
          kcu.CONSTRAINT_NAME AS constraintName,
          c.IS_NULLABLE AS isNullable,
          rc.UPDATE_RULE AS updateRule,
          rc.DELETE_RULE AS deleteRule
        FROM information_schema.KEY_COLUMN_USAGE kcu
        INNER JOIN information_schema.COLUMNS c
          ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
         AND c.TABLE_NAME = kcu.TABLE_NAME
         AND c.COLUMN_NAME = kcu.COLUMN_NAME
        INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
          ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
         AND rc.TABLE_NAME = kcu.TABLE_NAME
         AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        WHERE kcu.TABLE_SCHEMA = DATABASE()
          AND kcu.REFERENCED_TABLE_NAME = 'usuario'
          AND kcu.REFERENCED_COLUMN_NAME = 'usu_cedula'
        ORDER BY kcu.TABLE_NAME ASC, kcu.COLUMN_NAME ASC
      `,
    );

    for (const foreignKey of foreignKeys || []) {
      await this.dataSource.query(
        `
          ALTER TABLE \`${foreignKey.tableName}\`
          DROP FOREIGN KEY \`${foreignKey.constraintName}\`
        `,
      );
    }

    for (const foreignKey of foreignKeys || []) {
      await this.dataSource.query(
        `
          ALTER TABLE \`${foreignKey.tableName}\`
          MODIFY COLUMN \`${foreignKey.columnName}\` BIGINT ${
            foreignKey.isNullable === 'YES' ? 'NULL' : 'NOT NULL'
          }
        `,
      );
    }

    await this.dataSource.query(`
      ALTER TABLE usuario
      MODIFY COLUMN usu_cedula BIGINT NOT NULL COMMENT 'cedula del usuario'
    `);

    for (const foreignKey of foreignKeys || []) {
      await this.dataSource.query(
        `
          ALTER TABLE \`${foreignKey.tableName}\`
          ADD CONSTRAINT \`${foreignKey.constraintName}\`
          FOREIGN KEY (\`${foreignKey.columnName}\`)
          REFERENCES usuario (usu_cedula)
          ON DELETE ${foreignKey.deleteRule}
          ON UPDATE ${foreignKey.updateRule}
        `,
      );
    }
  }

  private async ensureUsuarioColumns() {
    await this.ensureUsuarioCedulaBigInt();
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

  private async getFichaNombreColumn() {
    if (await this.columnExists('fichas', 'fic_nombre')) {
      return 'fic_nombre';
    }

    if (await this.columnExists('fichas', 'fic_area')) {
      return 'fic_area';
    }

    throw new InternalServerErrorException(
      'La tabla fichas debe tener la columna fic_nombre o fic_area.',
    );
  }

  private normalizeCatalogValue(value: unknown) {
    return this.sanitizeText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  private resolveCatalogValue(value: string, allowedValues: string[]) {
    const normalizedValue = this.normalizeCatalogValue(value);
    return (
      allowedValues.find(
        (allowedValue) =>
          this.normalizeCatalogValue(allowedValue) === normalizedValue,
      ) || ''
    );
  }

  private escapeSqlLiteral(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  private async getColumnMetadata(tableName: string, columnName: string) {
    const [column] = await this.dataSource.query(
      `
        SELECT
          DATA_TYPE AS dataType,
          COLUMN_TYPE AS columnType,
          IS_NULLABLE AS isNullable,
          COLUMN_DEFAULT AS columnDefault,
          COLUMN_COMMENT AS columnComment
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return column || null;
  }

  private async getEnumColumnOptions(tableName: string, columnName: string) {
    const column = await this.getColumnMetadata(tableName, columnName);

    if (!column || String(column.dataType || '').toLowerCase() !== 'enum') {
      return [] as string[];
    }

    const matches = String(column.columnType || '').match(/'((?:[^'\\\\]|\\\\.)*)'/g);

    return (matches || []).map((match) =>
      match.slice(1, -1).replace(/\\\\'/g, "'"),
    );
  }

  private async ensureEnumColumnValue(
    tableName: string,
    columnName: string,
    value: string,
  ) {
    const normalizedValue = this.sanitizeText(value);
    if (!normalizedValue) {
      return '';
    }

    const column = await this.getColumnMetadata(tableName, columnName);
    if (!column || String(column.dataType || '').toLowerCase() !== 'enum') {
      return normalizedValue;
    }

    const currentValues = await this.getEnumColumnOptions(tableName, columnName);
    const matchedValue = this.resolveCatalogValue(normalizedValue, currentValues);
    if (matchedValue) {
      return matchedValue;
    }

    const nextValues = [...currentValues, normalizedValue];
    const nullClause = column.isNullable === 'YES' ? 'NULL' : 'NOT NULL';
    const hasNullDefault =
      column.columnDefault === null ||
      column.columnDefault === undefined ||
      this.normalizeCatalogValue(column.columnDefault) === 'NULL';
    const defaultClause =
      hasNullDefault
        ? column.isNullable === 'YES'
          ? ' DEFAULT NULL'
          : ''
        : ` DEFAULT '${this.escapeSqlLiteral(String(column.columnDefault))}'`;
    const commentClause = this.sanitizeText(column.columnComment)
      ? ` COMMENT '${this.escapeSqlLiteral(String(column.columnComment))}'`
      : '';

    await this.dataSource.query(
      `
        ALTER TABLE \`${tableName}\`
        MODIFY COLUMN \`${columnName}\` ENUM(${nextValues
          .map((item) => `'${this.escapeSqlLiteral(item)}'`)
          .join(', ')}) ${nullClause}${defaultClause}${commentClause}
      `,
    );

    return normalizedValue;
  }

  private async getFichaAreasByPrograma() {
    await this.ensureFichaSchema();
    const fichaNombreSelect = await this.getFichaNombreSelect('');
    const rows = await this.dataSource.query(
      `
        SELECT
          ${fichaNombreSelect} AS nombre,
          fic_programa AS programa
        FROM fichas
        WHERE TRIM(COALESCE(${fichaNombreSelect}, '')) <> ''
          AND TRIM(COALESCE(fic_programa, '')) <> ''
        ORDER BY fic_programa ASC, ${fichaNombreSelect} ASC
      `,
    );

    const areasByPrograma: Record<string, string[]> = {};

    for (const row of rows || []) {
      const programa = this.sanitizeText(row.programa);
      const nombre = this.sanitizeText(row.nombre);

      if (!programa || !nombre) {
        continue;
      }

      if (!areasByPrograma[programa]) {
        areasByPrograma[programa] = [];
      }

      if (!areasByPrograma[programa].includes(nombre)) {
        areasByPrograma[programa].push(nombre);
      }
    }

    return areasByPrograma;
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

  private async ensureUsuarioFichaAssignment(
    queryExecutor: { query: (query: string, parameters?: any[]) => Promise<any> },
    cedula: number,
    fichaNumero: number,
  ) {
    const [existingAssignment] = await queryExecutor.query(
      `
        SELECT COUNT(*) AS total
        FROM usuario_ficha
        WHERE usu_cedula_FK = ? AND fic_numero_FK = ?
      `,
      [cedula, fichaNumero],
    );

    if (Number(existingAssignment?.total || 0) > 0) {
      return false;
    }

    await queryExecutor.query(
      `
        INSERT INTO usuario_ficha (usu_cedula_FK, fic_numero_FK, usf_fecha_asignacion)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `,
      [cedula, fichaNumero],
    );

    return true;
  }

  private sanitizeText(value: unknown) {
    return String(value ?? '').trim();
  }

  private buildDefaultPassword(nombre: string) {
    const normalizedFirstName = this.sanitizeText(nombre)
      .split(/\s+/)
      .find(Boolean)
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

    return `${normalizedFirstName || 'usuario'}123`;
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
          fic_programa AS programa,
          fic_estado,
          fic_estado AS estado
        FROM fichas
        WHERE fic_numero = ?
        LIMIT 1
      `,
      [fichaNumero],
    );

    return ficha || null;
  }

  private async getFichasByNumeros(fichas: number[]) {
    await this.ensureFichaSchema();

    const uniqueFichas = Array.from(
      new Set(fichas.filter((item) => !Number.isNaN(item))),
    );

    if (uniqueFichas.length === 0) {
      return [] as FichaDetalle[];
    }

    const fichaNombreSelect = await this.getFichaNombreSelect('f');
    const placeholders = uniqueFichas.map(() => '?').join(', ');
    const rows = await this.dataSource.query(
      `
        SELECT
          CAST(f.fic_numero AS CHAR) AS ficha,
          ${fichaNombreSelect} AS fichaNombre,
          f.fic_programa AS programa,
          f.fic_estado AS fichaEstado,
          f.fic_fecha_creacion AS fichaFechaCreacion
        FROM fichas f
        WHERE f.fic_numero IN (${placeholders})
        ORDER BY f.fic_numero ASC
      `,
      uniqueFichas,
    );

    return (rows || [])
      .map((row: any) => this.buildFichaDetalle(row))
      .filter((row: FichaDetalle | null): row is FichaDetalle => Boolean(row));
  }

  async getFichaCatalogOptions() {
    await this.ensureFichaSchema();

    const fichaNombreColumn = await this.getFichaNombreColumn();

    return {
      areas: await this.getEnumColumnOptions('fichas', fichaNombreColumn),
      programas: await this.getEnumColumnOptions('fichas', 'fic_programa'),
      areasByPrograma: await this.getFichaAreasByPrograma(),
    };
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

  async createFicha(payload: CreateFichaDto) {
    await this.ensureFichaSchema();

    const numero = Number(String(payload.numero ?? '').trim());
    const nombre = this.sanitizeText(payload.nombre);
    const programa = this.sanitizeText(payload.programa);
    const estado = this.sanitizeText(payload.estado);
    const allowCustomCatalogValues = Boolean(payload.allowCustomCatalogValues);

    if (!numero || Number.isNaN(numero)) {
      throw new BadRequestException(
        'El numero de ficha es obligatorio y debe ser numerico.',
      );
    }

    if (!nombre) {
      throw new BadRequestException('El area o nombre de la ficha es obligatorio.');
    }

    if (!programa) {
      throw new BadRequestException('El programa de la ficha es obligatorio.');
    }

    if (estado && !ESTADOS_FICHA.includes(estado as (typeof ESTADOS_FICHA)[number])) {
      throw new BadRequestException('El estado de la ficha debe ser Activa o Inactiva.');
    }

    const fichaExistente = await this.getFichaByNumero(numero);
    const fichaNombreColumn = await this.getFichaNombreColumn();
    const allowedAreas = await this.getEnumColumnOptions('fichas', fichaNombreColumn);
    const allowedProgramas = await this.getEnumColumnOptions('fichas', 'fic_programa');
    let normalizedPrograma = allowedProgramas.length
      ? this.resolveCatalogValue(programa, allowedProgramas)
      : programa;

    if (!normalizedPrograma) {
      if (!allowCustomCatalogValues) {
        throw new BadRequestException(
          `El programa de la ficha debe ser uno de: ${allowedProgramas.join(', ')}.`,
        );
      }

      normalizedPrograma = await this.ensureEnumColumnValue(
        'fichas',
        'fic_programa',
        programa,
      );
    }

    let normalizedNombre = allowedAreas.length
      ? this.resolveCatalogValue(nombre, allowedAreas)
      : nombre;

    const areasByPrograma = await this.getFichaAreasByPrograma();
    const allowedAreasForPrograma = areasByPrograma[normalizedPrograma] || [];

    if (!normalizedNombre) {
      if (!allowCustomCatalogValues) {
        throw new BadRequestException(
          `El area de la ficha debe ser una de: ${allowedAreas.join(', ')}.`,
        );
      }

      normalizedNombre = await this.ensureEnumColumnValue(
        'fichas',
        fichaNombreColumn,
        nombre,
      );
    }

    if (
      !allowCustomCatalogValues &&
      allowedAreasForPrograma.length > 0 &&
      !allowedAreasForPrograma.includes(normalizedNombre)
    ) {
      throw new BadRequestException(
        `El area seleccionada no pertenece al programa ${normalizedPrograma}.`,
      );
    }

    const fichaEstado = estado || 'Activa';

    if (fichaExistente) {
      const fichaNombreActual = this.sanitizeText(fichaExistente.fichaNombre);
      const fichaProgramaActual = this.sanitizeText(
        fichaExistente.programa || fichaExistente.fic_programa,
      );

      if (fichaNombreActual && fichaProgramaActual) {
        throw new ConflictException(`La ficha ${numero} ya existe.`);
      }

      await this.dataSource.query(
        `
          UPDATE fichas
          SET ${fichaNombreColumn} = ?, fic_programa = ?, fic_estado = ?
          WHERE fic_numero = ?
        `,
        [normalizedNombre, normalizedPrograma, fichaEstado, numero],
      );

      return {
        ok: true,
        mensaje: `Ficha ${numero} actualizada correctamente.`,
        ficha: {
          numero: String(numero),
          nombre: normalizedNombre,
          programa: normalizedPrograma,
          estado: fichaEstado,
        },
      };
    }

    await this.dataSource.query(
      `
        INSERT INTO fichas (fic_numero, ${fichaNombreColumn}, fic_programa, fic_estado)
        VALUES (?, ?, ?, ?)
      `,
      [numero, normalizedNombre, normalizedPrograma, fichaEstado],
    );

    return {
      ok: true,
      mensaje: `Ficha ${numero} registrada correctamente.`,
      ficha: {
        numero: String(numero),
        nombre: normalizedNombre,
        programa: normalizedPrograma,
        estado: fichaEstado,
      },
    };
  }

  async importUsuarios(rows: ImportUsuarioDto[]) {
    await this.ensureUsuarioColumns();
    await this.ensureFichaSchema();

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un usuario para importar.',
      );
    }

    const normalizedRows = rows.map((item, index) => ({
      fila: index + 2,
      documento: this.sanitizeText(item?.documento),
      tipoDocumento: this.sanitizeText(item?.tipoDocumento).toUpperCase() || 'CC',
      ficha: this.sanitizeText(item?.ficha),
      nombre: this.sanitizeText(item?.nombre),
      apellido: this.sanitizeText(item?.apellido),
      sexo: this.sanitizeText(item?.sexo),
      telefono: this.sanitizeText(item?.telefono),
      email: this.sanitizeText(item?.email),
      especializacion: this.sanitizeText(item?.especializacion),
      tipoUsuario: this.sanitizeText(item?.tipoUsuario).toLowerCase(),
    }));

    const validationErrors = normalizedRows
      .flatMap((row) => {
        const rowErrors: { fila: number; documento: string; message: string }[] = [];

        if (!row.documento || Number.isNaN(Number(row.documento))) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'El documento es obligatorio y debe ser numerico.',
          });
        }

        if (!row.nombre) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'El nombre es obligatorio.',
          });
        }

        if (!row.apellido) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'El apellido es obligatorio.',
          });
        }

        if (!['aprendiz', 'instructor'].includes(row.tipoUsuario)) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message:
              'El tipo de usuario debe ser Aprendiz o Instructor.',
          });
        }

        if (row.sexo && !SEXOS_USUARIO.includes(row.sexo as SexoUsuario)) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'El sexo debe ser Hombre o Mujer.',
          });
        }

        if (
          row.tipoUsuario === 'aprendiz' &&
          (!row.ficha || Number.isNaN(Number(row.ficha)))
        ) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'La ficha es obligatoria y debe ser numerica para el aprendiz.',
          });
        }

        if (row.ficha && Number.isNaN(Number(row.ficha))) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'La ficha debe ser numerica.',
          });
        }

        if (row.tipoUsuario === 'instructor' && !row.email) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message: 'El correo es obligatorio para el instructor.',
          });
        }

        if (
          row.tipoUsuario === 'instructor' &&
          !row.especializacion &&
          !row.ficha
        ) {
          rowErrors.push({
            fila: row.fila,
            documento: row.documento || 'Sin documento',
            message:
              'La ficha es obligatoria para el instructor en esta plantilla de importacion.',
          });
        }

        return rowErrors;
      });

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        code: 'INVALID_IMPORT_ROWS',
        message: 'El archivo contiene filas invalidas.',
        errors: validationErrors,
      });
    }

    const fichaNumbers = Array.from(
      new Set(
        normalizedRows
          .map((row) => Number(row.ficha))
          .filter((item) => !Number.isNaN(item)),
      ),
    );

    const fichaNombreSelect = await this.getFichaNombreSelect('');
    const existingFichas =
      fichaNumbers.length > 0
        ? await this.dataSource.query(
            `
              SELECT
                CAST(fic_numero AS CHAR) AS numero,
                ${fichaNombreSelect} AS nombre,
                fic_programa AS programa,
                fic_estado AS estado
              FROM fichas
              WHERE fic_numero IN (${fichaNumbers.map(() => '?').join(', ')})
            `,
            fichaNumbers,
          )
        : [];

    const existingFichaMap = new Map<
      string,
      { nombre: string; programa: string; estado: string }
    >(
      (existingFichas || []).map(
        (item: {
          numero: string;
          nombre?: string;
          programa?: string;
          estado?: string;
        }) => [
          String(item.numero),
          {
            nombre: this.sanitizeText(item.nombre),
            programa: this.sanitizeText(item.programa),
            estado: this.sanitizeText(item.estado) || 'Activa',
          },
        ],
      ),
    );

    const missingFichas = fichaNumbers
      .map(String)
      .filter((numero) => {
        const ficha = existingFichaMap.get(numero);
        return !ficha || !ficha.nombre || !ficha.programa;
      })
      .sort((a, b) => Number(a) - Number(b));

    if (missingFichas.length > 0) {
      throw new BadRequestException({
        code: 'MISSING_FICHAS',
        message:
          'Hay fichas que no existen o estan incompletas en la base de datos. Completa su area y programa antes de continuar.',
        missingFichas: missingFichas.map((numero) => {
          const ficha = existingFichaMap.get(numero);

          return {
            numero,
            nombre: ficha?.nombre || '',
            programa: ficha?.programa || '',
            estado: ficha?.estado === 'Inactiva' ? 'Inactiva' : 'Activa',
          };
        }),
      });
    }

    const created: Array<{
      fila: number;
      documento: string;
      nombre: string;
      tipoUsuario: 'aprendiz' | 'instructor';
      passwordTemporal: string;
    }> = [];
    const errors: Array<{
      fila: number;
      documento: string;
      message: string;
    }> = [];

    for (const row of normalizedRows) {
      const password = this.buildDefaultPassword(row.nombre);

      try {
        await this.createUsuario({
          tipoUsuario: row.tipoUsuario as 'aprendiz' | 'instructor',
          cedula: row.documento,
          tipoDocumento: row.tipoDocumento,
          nombre: row.nombre,
          apellidos: row.apellido,
          ficha: row.ficha || undefined,
          correo: row.email,
          telefono: row.telefono,
          sexo: row.tipoUsuario === 'aprendiz' ? row.sexo : undefined,
          especializacion:
            row.tipoUsuario === 'instructor'
              ? row.especializacion || undefined
              : undefined,
          password,
        });

        created.push({
          fila: row.fila,
          documento: row.documento,
          nombre: row.nombre,
          tipoUsuario: row.tipoUsuario as 'aprendiz' | 'instructor',
          passwordTemporal: password,
        });
      } catch (error) {
        errors.push({
          fila: row.fila,
          documento: row.documento,
          message:
            error instanceof Error
              ? error.message
              : 'No fue posible registrar el aprendiz.',
        });
      }
    }

    return {
      ok: errors.length === 0,
      total: normalizedRows.length,
      creados: created.length,
      fallidos: errors.length,
      creadosDetalle: created,
      errores: errors,
    };
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
        u.usu_tipo_documento AS tipoDocumento,
        u.usu_especializacion AS especializacion,
        u.usu_nombres AS nombre,
        u.usu_apellidos AS apellido,
        u.usu_sexo AS sexo,
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
          tipoDocumento: row.tipoDocumento || 'CC',
          especializacion: row.especializacion || 'Sin especializacion',
          fichasCargo: [] as string[],
          fichasDetalle: [] as FichaDetalle[],
          nombre: row.nombre || '',
          apellido: row.apellido || '',
          sexo: row.sexo || '',
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
    const password =
      this.sanitizeText(payload.password) || this.buildDefaultPassword(nombre);
    const tipoDocumento = this.sanitizeText(payload.tipoDocumento) || 'CC';
    const fichaRaw = this.sanitizeText(payload.ficha);
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

    let fichaNumero: number | null = null;
    let ficha: any = null;

    if (fichaRaw) {
      await this.ensureFichaSchema();
      fichaNumero = Number(fichaRaw);

      if (!fichaNumero || Number.isNaN(fichaNumero)) {
        throw new BadRequestException(
          'La ficha es obligatoria y debe ser numerica.',
        );
      }

      ficha = await this.getFichaByNumero(fichaNumero);

      if (!ficha) {
        throw new NotFoundException('La ficha seleccionada no existe.');
      }

      if (ficha.fic_estado !== 'Activa') {
        throw new BadRequestException('La ficha seleccionada no esta activa.');
      }
    }

    const especializacion =
      this.sanitizeText(payload.especializacion) ||
      (tipoUsuario === 'instructor'
        ? this.sanitizeText(ficha?.programa || ficha?.fic_programa)
        : '');

    const yaExiste = await this.usuarioRepository.findOneBy({
      usuCedula: cedula,
    });

    if (yaExiste) {
      if (tipoUsuario === 'instructor' && yaExiste.rolSisIdFk === 2) {
        if (!fichaNumero) {
          throw new ConflictException('Ya existe un instructor con esa cedula.');
        }

        const fichaAsignada = await this.ensureUsuarioFichaAssignment(
          this.dataSource,
          cedula,
          fichaNumero,
        );

        let shouldSaveInstructor = false;

        if (!this.sanitizeText(yaExiste.usuEspecializacion) && especializacion) {
          yaExiste.usuEspecializacion = especializacion;
          shouldSaveInstructor = true;
        }

        if (!this.sanitizeText(yaExiste.usuSexo) && sexoNormalizado) {
          yaExiste.usuSexo = sexoNormalizado;
          shouldSaveInstructor = true;
        }

        if (shouldSaveInstructor) {
          await this.usuarioRepository.save(yaExiste);
        }

        const [registro] = await this.dataSource.query(
          'SELECT fecha_registro FROM usuario WHERE usu_cedula = ? LIMIT 1',
          [cedula],
        );

        return {
          ok: true,
          mensaje: fichaAsignada
            ? 'Ficha asignada correctamente al instructor existente.'
            : 'El instructor ya tenia la ficha asignada.',
          instructor: {
            documento: String(yaExiste.usuCedula),
            tipoDocumento: yaExiste.usuTipoDocumento || 'CC',
            nombre: yaExiste.usuNombres || nombre,
            apellido: yaExiste.usuApellidos || apellidos,
            especializacion:
              yaExiste.usuEspecializacion || especializacion || '',
            sexo: yaExiste.usuSexo || sexoNormalizado || '',
            ficha: fichaNumero ? String(fichaNumero) : '',
            fichaNombre: ficha?.fichaNombre || '',
            programa: ficha?.programa || ficha?.fic_programa || '',
            telefono: yaExiste.usuTelefono || telefono || '',
            email: yaExiste.usuCorreo || correo || '',
            fechaInscripcion: this.formatDateToIso(registro?.fecha_registro),
            estado: yaExiste.usuEstado || 'Activo',
          },
          fichaAsignada,
        };
      }

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
          usuSexo: sexoNormalizado,
          usuContrasena: hash,
          rolSisIdFk: 2,
          usuEstado: 'Activo',
        });

        await queryRunner.manager.save(Usuario, nuevoInstructor);

        if (fichaNumero) {
          await this.ensureUsuarioFichaAssignment(queryRunner, cedula, fichaNumero);
        }

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
            sexo: nuevoInstructor.usuSexo || '',
            ficha: fichaNumero ? String(fichaNumero) : '',
            fichaNombre: ficha?.fichaNombre || '',
            programa: ficha?.programa || ficha?.fic_programa || '',
            telefono: nuevoInstructor.usuTelefono || '',
            email: nuevoInstructor.usuCorreo || '',
            fechaInscripcion: this.formatDateToIso(registro?.fecha_registro),
            estado: nuevoInstructor.usuEstado || 'Activo',
          },
        };
      }

      if (!fichaNumero) {
        throw new BadRequestException('La ficha es obligatoria y debe ser numerica.');
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

      await this.ensureUsuarioFichaAssignment(queryRunner, cedula, fichaNumero);

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

  async updateInstructor(cedula: string, payload: UpdateInstructorDto) {
    await this.ensureUsuarioColumns();
    await this.ensureFichaSchema();

    const documento = Number(cedula);
    if (!documento || Number.isNaN(documento)) {
      throw new BadRequestException('La cedula del instructor es invalida.');
    }

    const instructor = await this.usuarioRepository.findOne({
      where: {
        usuCedula: documento,
        rolSisIdFk: 2,
      },
    });

    if (!instructor) {
      throw new NotFoundException('No se encontro el instructor solicitado.');
    }

    const nombre = this.sanitizeText(payload.nombre ?? instructor.usuNombres);
    const apellidos = this.sanitizeText(
      payload.apellidos ?? instructor.usuApellidos,
    );
    const correo = this.sanitizeText(payload.correo ?? instructor.usuCorreo);
    const telefono = this.sanitizeText(payload.telefono ?? instructor.usuTelefono);
    const sexo = this.sanitizeText(payload.sexo ?? instructor.usuSexo);
    const especializacion = this.sanitizeText(
      payload.especializacion ?? instructor.usuEspecializacion,
    );
    const shouldUpdateFichas = Array.isArray(payload.fichas);
    const fichasSeleccionadas = shouldUpdateFichas
      ? Array.from(
          new Set(
            (payload.fichas || [])
              .map((item) => Number(String(item ?? '').trim()))
              .filter((item) => !Number.isNaN(item) && item > 0),
          ),
        )
      : await this.getFichasAsignadasUsuario(documento);

    if (!nombre) {
      throw new BadRequestException('El nombre es obligatorio.');
    }

    if (!apellidos) {
      throw new BadRequestException('El apellido es obligatorio.');
    }

    if (!correo) {
      throw new BadRequestException('El correo es obligatorio.');
    }

    if (!especializacion) {
      throw new BadRequestException('La especializacion es obligatoria.');
    }

    if (sexo && !SEXOS_USUARIO.includes(sexo as SexoUsuario)) {
      throw new BadRequestException('El sexo debe ser Hombre o Mujer.');
    }

    const fichasDetalle = await this.getFichasByNumeros(fichasSeleccionadas);

    if (fichasDetalle.length !== fichasSeleccionadas.length) {
      throw new NotFoundException('Una o varias fichas seleccionadas no existen.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      instructor.usuNombres = nombre;
      instructor.usuApellidos = apellidos;
      instructor.usuCorreo = correo;
      instructor.usuTelefono = telefono || null;
      instructor.usuSexo = sexo ? (sexo as SexoUsuario) : null;
      instructor.usuEspecializacion = especializacion;

      await queryRunner.manager.save(Usuario, instructor);

      if (shouldUpdateFichas) {
        await queryRunner.query(
          'DELETE FROM usuario_ficha WHERE usu_cedula_FK = ?',
          [documento],
        );

        for (const fichaNumero of fichasSeleccionadas) {
          await this.ensureUsuarioFichaAssignment(
            queryRunner,
            documento,
            fichaNumero,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo actualizar el instructor: ${err?.message || 'Error interno.'}`,
      );
    } finally {
      await queryRunner.release();
    }

    return {
      ok: true,
      mensaje: 'Instructor actualizado correctamente.',
      instructor: {
        documento: String(instructor.usuCedula),
        tipoDocumento: instructor.usuTipoDocumento || 'CC',
        nombre: instructor.usuNombres || '',
        apellido: instructor.usuApellidos || '',
        especializacion: instructor.usuEspecializacion || '',
        sexo: instructor.usuSexo || '',
        telefono: instructor.usuTelefono || '',
        email: instructor.usuCorreo || '',
        fechaInscripcion: this.formatDateToIso(instructor.fechaRegistro),
        fichasCargo: fichasDetalle.map((item) => item.ficha),
        fichasDetalle,
      },
    };
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

  async deleteInstructor(cedula: string) {
    const documento = Number(cedula);
    if (!documento || Number.isNaN(documento)) {
      throw new BadRequestException('La cedula del instructor es invalida.');
    }

    const instructor = await this.usuarioRepository.findOne({
      where: {
        usuCedula: documento,
        rolSisIdFk: 2,
      },
      select: ['usuCedula', 'usuNombres', 'usuApellidos'],
    });

    if (!instructor) {
      throw new NotFoundException('No se encontro el instructor solicitado.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.deleteUsuarioReferences(queryRunner, documento);

      await queryRunner.query(
        'DELETE FROM usuario WHERE usu_cedula = ? AND rol_sis_ID_FK = 2',
        [documento],
      );

      await queryRunner.commitTransaction();

      return {
        ok: true,
        documento: String(documento),
        mensaje: `Instructor ${instructor.usuNombres || ''} ${instructor.usuApellidos || ''} eliminado correctamente.`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const err = error as { message?: string };
      throw new InternalServerErrorException(
        `No se pudo eliminar el instructor: ${err?.message || 'Error interno.'}`,
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
