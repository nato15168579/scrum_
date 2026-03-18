"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Usuario_1 = require("../entities/Usuario");
const bcrypt = require("bcrypt");
const SchemaIntrospection_1 = require("../shared/database/SchemaIntrospection");
const ESTADOS_USUARIO = ['Activo', 'Inactivo'];
const SEXOS_USUARIO = ['Hombre', 'Mujer'];
const ESTADOS_FICHA = ['Activa', 'Inactiva'];
let ListaService = class ListaService {
    constructor(usuarioRepository, dataSource) {
        this.usuarioRepository = usuarioRepository;
        this.dataSource = dataSource;
        this.schema = new SchemaIntrospection_1.SchemaIntrospection(dataSource);
    }
    async columnExists(tableName, columnName) {
        return this.schema.columnExists(tableName, columnName);
    }
    async tableExists(tableName) {
        return this.schema.tableExists(tableName);
    }
    async getTableType(tableName) {
        return this.schema.getTableType(tableName);
    }
    async ensureLegacyAdminViews() {
        await this.schema.ensureLegacyAdminViews();
    }
    async resolvePhysicalTableName(tableName) {
        if (tableName === 'fichas') {
            const legacyType = await this.getTableType('fichas');
            if (legacyType !== 'BASE TABLE' && (await this.tableExists('ficha'))) {
                return 'ficha';
            }
        }
        if (tableName === 'usuario_ficha') {
            const legacyType = await this.getTableType('usuario_ficha');
            if (legacyType !== 'BASE TABLE' && (await this.tableExists('usu_fic'))) {
                return 'usu_fic';
            }
        }
        return tableName;
    }
    async ensureUsuarioFichaFechaAsignacionColumn() {
        const hasFechaAsignacion = await this.columnExists('usuario_ficha', 'usf_fecha_asignacion');
        if (!hasFechaAsignacion) {
            await this.dataSource.query(`
        ALTER TABLE usuario_ficha
        ADD COLUMN usf_fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        COMMENT 'fecha de asignacion del usuario a la ficha'
      `);
        }
    }
    async ensureFechaRegistroColumn() {
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
    async ensureEstadoColumn() {
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
    async ensureEspecializacionColumn() {
        const hasEspecializacion = await this.columnExists('usuario', 'usu_especializacion');
        if (!hasEspecializacion) {
            await this.dataSource.query(`
        ALTER TABLE usuario
        ADD COLUMN usu_especializacion VARCHAR(120) NULL
        COMMENT 'especializacion del instructor'
      `);
        }
    }
    async ensureSexoColumn() {
        const hasSexo = await this.columnExists('usuario', 'usu_sexo');
        if (!hasSexo) {
            await this.dataSource.query(`
        ALTER TABLE usuario
        ADD COLUMN usu_sexo ENUM('Hombre','Mujer') NULL
        COMMENT 'sexo del aprendiz'
      `);
        }
    }
    async ensureUsuarioCedulaBigInt() {
        const [usuarioCedula] = await this.dataSource.query(`
        SELECT DATA_TYPE AS dataType
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'usuario'
          AND COLUMN_NAME = 'usu_cedula'
      `);
        if (!usuarioCedula) {
            throw new common_1.InternalServerErrorException('La tabla usuario debe tener la columna usu_cedula.');
        }
        if (String(usuarioCedula.dataType || '').toLowerCase() === 'bigint') {
            return;
        }
        const foreignKeys = await this.dataSource.query(`
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
      `);
        for (const foreignKey of foreignKeys || []) {
            await this.dataSource.query(`
          ALTER TABLE \`${foreignKey.tableName}\`
          DROP FOREIGN KEY \`${foreignKey.constraintName}\`
        `);
        }
        for (const foreignKey of foreignKeys || []) {
            await this.dataSource.query(`
          ALTER TABLE \`${foreignKey.tableName}\`
          MODIFY COLUMN \`${foreignKey.columnName}\` BIGINT ${foreignKey.isNullable === 'YES' ? 'NULL' : 'NOT NULL'}
        `);
        }
        await this.dataSource.query(`
      ALTER TABLE usuario
      MODIFY COLUMN usu_cedula BIGINT NOT NULL COMMENT 'cedula del usuario'
    `);
        for (const foreignKey of foreignKeys || []) {
            await this.dataSource.query(`
          ALTER TABLE \`${foreignKey.tableName}\`
          ADD CONSTRAINT \`${foreignKey.constraintName}\`
          FOREIGN KEY (\`${foreignKey.columnName}\`)
          REFERENCES usuario (usu_cedula)
          ON DELETE ${foreignKey.deleteRule}
          ON UPDATE ${foreignKey.updateRule}
        `);
        }
    }
    async ensureUsuarioColumns() {
        await this.ensureUsuarioCedulaBigInt();
        await this.ensureFechaRegistroColumn();
        await this.ensureEstadoColumn();
        await this.ensureEspecializacionColumn();
        await this.ensureSexoColumn();
    }
    async ensureFichaSchema() {
        await this.ensureLegacyAdminViews();
        const missingTables = [];
        if (!(await this.tableExists('fichas'))) {
            missingTables.push('fichas');
        }
        if (!(await this.tableExists('usuario_ficha'))) {
            missingTables.push('usuario_ficha');
        }
        if (missingTables.length > 0) {
            throw new common_1.InternalServerErrorException(`Faltan tablas requeridas en la base de datos: ${missingTables.join(', ')}. Importa el esquema SQL actualizado.`);
        }
        await this.ensureUsuarioFichaFechaAsignacionColumn();
        const hasFichaNombre = await this.columnExists('fichas', 'fic_nombre');
        const hasFichaArea = await this.columnExists('fichas', 'fic_area');
        if (!hasFichaNombre && !hasFichaArea) {
            throw new common_1.InternalServerErrorException('La tabla fichas debe tener la columna fic_nombre o fic_area.');
        }
    }
    async getFichaNombreSelect(alias = 'f') {
        const prefix = alias ? `${alias}.` : '';
        if (await this.columnExists('fichas', 'fic_nombre')) {
            return `${prefix}fic_nombre`;
        }
        if (await this.columnExists('fichas', 'fic_area')) {
            return `${prefix}fic_area`;
        }
        return 'NULL';
    }
    async getFichaNombreColumn() {
        if (await this.columnExists('fichas', 'fic_nombre')) {
            return 'fic_nombre';
        }
        if (await this.columnExists('fichas', 'fic_area')) {
            return 'fic_area';
        }
        throw new common_1.InternalServerErrorException('La tabla fichas debe tener la columna fic_nombre o fic_area.');
    }
    normalizeCatalogValue(value) {
        return this.sanitizeText(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    }
    resolveCatalogValue(value, allowedValues) {
        const normalizedValue = this.normalizeCatalogValue(value);
        return (allowedValues.find((allowedValue) => this.normalizeCatalogValue(allowedValue) === normalizedValue) || '');
    }
    escapeSqlLiteral(value) {
        return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    async getColumnMetadata(tableName, columnName) {
        const physicalTableName = await this.resolvePhysicalTableName(tableName);
        const [column] = await this.dataSource.query(`
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
      `, [physicalTableName, columnName]);
        return column || null;
    }
    async getEnumColumnOptions(tableName, columnName) {
        const column = await this.getColumnMetadata(tableName, columnName);
        if (!column || String(column.dataType || '').toLowerCase() !== 'enum') {
            return [];
        }
        const matches = String(column.columnType || '').match(/'((?:[^'\\\\]|\\\\.)*)'/g);
        return (matches || []).map((match) => match.slice(1, -1).replace(/\\\\'/g, "'"));
    }
    async ensureEnumColumnValue(tableName, columnName, value) {
        const physicalTableName = await this.resolvePhysicalTableName(tableName);
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
        const hasNullDefault = column.columnDefault === null ||
            column.columnDefault === undefined ||
            this.normalizeCatalogValue(column.columnDefault) === 'NULL';
        const defaultClause = hasNullDefault
            ? column.isNullable === 'YES'
                ? ' DEFAULT NULL'
                : ''
            : ` DEFAULT '${this.escapeSqlLiteral(String(column.columnDefault))}'`;
        const commentClause = this.sanitizeText(column.columnComment)
            ? ` COMMENT '${this.escapeSqlLiteral(String(column.columnComment))}'`
            : '';
        await this.dataSource.query(`
        ALTER TABLE \`${physicalTableName}\`
        MODIFY COLUMN \`${columnName}\` ENUM(${nextValues
            .map((item) => `'${this.escapeSqlLiteral(item)}'`)
            .join(', ')}) ${nullClause}${defaultClause}${commentClause}
      `);
        return normalizedValue;
    }
    async getFichaAreasByPrograma() {
        await this.ensureFichaSchema();
        const fichaNombreSelect = await this.getFichaNombreSelect('');
        const rows = await this.dataSource.query(`
        SELECT
          ${fichaNombreSelect} AS nombre,
          fic_programa AS programa
        FROM fichas
        WHERE TRIM(COALESCE(${fichaNombreSelect}, '')) <> ''
          AND TRIM(COALESCE(fic_programa, '')) <> ''
        ORDER BY fic_programa ASC, ${fichaNombreSelect} ASC
      `);
        const areasByPrograma = {};
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
    normalizeEstado(value) {
        return value === 'Inactivo' ? 'Inactivo' : 'Activo';
    }
    formatDateToIso(value) {
        if (!value)
            return null;
        const parsedDate = new Date(String(value));
        if (Number.isNaN(parsedDate.getTime()))
            return null;
        return parsedDate.toISOString();
    }
    buildFichaDetalle(row) {
        if (!(row === null || row === void 0 ? void 0 : row.ficha))
            return null;
        return {
            ficha: String(row.ficha),
            nombre: String(row.fichaNombre || 'Sin nombre'),
            programa: String(row.programa || 'Sin programa'),
            estado: String(row.fichaEstado || 'Sin estado'),
            fechaCreacion: this.formatDateToIso(row.fichaFechaCreacion),
        };
    }
    async getRolUsuario(cedula) {
        var _a;
        const documento = Number(cedula);
        if (!documento || Number.isNaN(documento)) {
            return null;
        }
        const usuario = await this.usuarioRepository.findOne({
            where: { usuCedula: documento },
            select: ['rolSisIdFk'],
        });
        return (_a = usuario === null || usuario === void 0 ? void 0 : usuario.rolSisIdFk) !== null && _a !== void 0 ? _a : null;
    }
    async getFichasAsignadasUsuario(cedula) {
        const rows = await this.dataSource.query(`
        SELECT fic_numero_FK AS ficha
        FROM usuario_ficha
        WHERE usu_cedula_FK = ?
        ORDER BY fic_numero_FK ASC
      `, [cedula]);
        return (rows || [])
            .map((row) => Number(row.ficha))
            .filter((ficha) => !Number.isNaN(ficha));
    }
    async ensureUsuarioFichaAssignment(queryExecutor, cedula, fichaNumero) {
        const [existingAssignment] = await queryExecutor.query(`
        SELECT COUNT(*) AS total
        FROM usuario_ficha
        WHERE usu_cedula_FK = ? AND fic_numero_FK = ?
      `, [cedula, fichaNumero]);
        if (Number((existingAssignment === null || existingAssignment === void 0 ? void 0 : existingAssignment.total) || 0) > 0) {
            return false;
        }
        await queryExecutor.query(`
        INSERT INTO usuario_ficha (usu_cedula_FK, fic_numero_FK, usf_fecha_asignacion)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [cedula, fichaNumero]);
        return true;
    }
    sanitizeText(value) {
        return String(value !== null && value !== void 0 ? value : '').trim();
    }
    normalizeCedula(value) {
        const parsed = Number(this.sanitizeText(value));
        if (!parsed || Number.isNaN(parsed)) {
            return null;
        }
        return parsed;
    }
    formatCambioSistemaValue(value, maxLen = 90) {
        const raw = this.sanitizeText(value);
        const printable = raw ? raw : '(vacio)';
        const clipped = printable.length > maxLen
            ? `${printable.slice(0, Math.max(0, maxLen - 3))}...`
            : printable;
        return JSON.stringify(clipped);
    }
    formatCambioSistemaList(values, maxLen = 220) {
        const normalized = Array.from(new Set(values))
            .filter((item) => !Number.isNaN(item) && item > 0)
            .sort((a, b) => a - b);
        const json = JSON.stringify(normalized);
        if (json.length <= maxLen) {
            return json;
        }
        return `${json.slice(0, Math.max(0, maxLen - 3))}...`;
    }
    pushCambioSistemaIfDifferent(cambios, label, before, after) {
        const beforeValue = this.sanitizeText(before);
        const afterValue = this.sanitizeText(after);
        if (beforeValue === afterValue) {
            return;
        }
        cambios.push(`${label}: ${this.formatCambioSistemaValue(before)} -> ${this.formatCambioSistemaValue(after)}`);
    }
    pushCambioSistemaListIfDifferent(cambios, label, before, after) {
        const beforeNormalized = Array.from(new Set(before))
            .filter((item) => !Number.isNaN(item) && item > 0)
            .sort((a, b) => a - b);
        const afterNormalized = Array.from(new Set(after))
            .filter((item) => !Number.isNaN(item) && item > 0)
            .sort((a, b) => a - b);
        const sameLength = beforeNormalized.length === afterNormalized.length;
        const sameItems = sameLength &&
            beforeNormalized.every((value, index) => value === afterNormalized[index]);
        if (sameItems) {
            return;
        }
        cambios.push(`${label}: ${this.formatCambioSistemaList(beforeNormalized)} -> ${this.formatCambioSistemaList(afterNormalized)}`);
    }
    async insertCambioSistema(queryExecutor, actorCedula, descripcion) {
        if (!actorCedula) {
            return;
        }
        const mensaje = this.sanitizeText(descripcion).slice(0, 500);
        if (!mensaje) {
            return;
        }
        try {
            if (!(await this.tableExists('cambios_sistema'))) {
                return;
            }
            await queryExecutor.query(`
          INSERT INTO cambios_sistema (cam_descripcion, usu_cedula_FK)
          VALUES (?, ?)
        `, [mensaje, actorCedula]);
        }
        catch (_a) {
        }
    }
    buildDefaultPassword(nombre) {
        var _a;
        const normalizedFirstName = (_a = this.sanitizeText(nombre)
            .split(/\s+/)
            .find(Boolean)) === null || _a === void 0 ? void 0 : _a.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return `${normalizedFirstName || 'usuario'}123`;
    }
    async getFichaActualUsuario(cedula) {
        const [row] = await this.dataSource.query(`
        SELECT fic_numero_FK AS ficha, usf_fecha_asignacion AS fechaAsignacion
        FROM usuario_ficha
        WHERE usu_cedula_FK = ?
        ORDER BY usf_fecha_asignacion ASC
        LIMIT 1
      `, [cedula]);
        return row || null;
    }
    async getFichaByNumero(fichaNumero) {
        const fichaNombreSelect = await this.getFichaNombreSelect('');
        const [ficha] = await this.dataSource.query(`
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
      `, [fichaNumero]);
        return ficha || null;
    }
    async getFichasByNumeros(fichas) {
        await this.ensureFichaSchema();
        const uniqueFichas = Array.from(new Set(fichas.filter((item) => !Number.isNaN(item))));
        if (uniqueFichas.length === 0) {
            return [];
        }
        const fichaNombreSelect = await this.getFichaNombreSelect('f');
        const placeholders = uniqueFichas.map(() => '?').join(', ');
        const rows = await this.dataSource.query(`
        SELECT
          CAST(f.fic_numero AS CHAR) AS ficha,
          ${fichaNombreSelect} AS fichaNombre,
          f.fic_programa AS programa,
          f.fic_estado AS fichaEstado,
          f.fic_fecha_creacion AS fichaFechaCreacion
        FROM fichas f
        WHERE f.fic_numero IN (${placeholders})
        ORDER BY f.fic_numero ASC
      `, uniqueFichas);
        return (rows || [])
            .map((row) => this.buildFichaDetalle(row))
            .filter((row) => Boolean(row));
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
    mapAprendizResponse(row) {
        return {
            documento: String(row.documento),
            tipoDocumento: String(row.tipoDocumento || 'CC'),
            ficha: row.ficha ? String(row.ficha) : 'Sin ficha',
            area: String(row.fichaNombre || 'Sin area'),
            fichaNombre: String(row.fichaNombre || 'Sin nombre de ficha'),
            programa: String(row.programa || 'Sin programa'),
            nombre: String(row.nombre || ''),
            apellido: String(row.apellido || ''),
            telefono: String(row.telefono || ''),
            email: String(row.email || ''),
            sexo: String(row.sexo || ''),
            fechaInscripcion: this.formatDateToIso(row.fechaInscripcion),
            estado: this.normalizeEstado(row.estado),
        };
    }
    async deleteUsuarioReferences(queryRunner, cedula) {
        const references = await queryRunner.query(`
        SELECT
          TABLE_NAME AS tableName,
          COLUMN_NAME AS columnName
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
          AND REFERENCED_TABLE_NAME = 'usuario'
          AND REFERENCED_COLUMN_NAME = 'usu_cedula'
        ORDER BY TABLE_NAME ASC
      `);
        for (const reference of references || []) {
            await queryRunner.query(`DELETE FROM \`${reference.tableName}\` WHERE \`${reference.columnName}\` = ?`, [cedula]);
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
        return (fichas || []).map((ficha) => ({
            numero: String(ficha.numero),
            nombre: String(ficha.nombre || 'Sin nombre'),
            programa: String(ficha.programa || 'Sin programa'),
            estado: String(ficha.estado || 'Sin estado'),
            fechaCreacion: this.formatDateToIso(ficha.fechaCreacion),
        }));
    }
    async createFicha(payload) {
        var _a;
        await this.ensureFichaSchema();
        const numero = Number(String((_a = payload.numero) !== null && _a !== void 0 ? _a : '').trim());
        const nombre = this.sanitizeText(payload.nombre);
        const programa = this.sanitizeText(payload.programa);
        const estado = this.sanitizeText(payload.estado);
        const allowCustomCatalogValues = Boolean(payload.allowCustomCatalogValues);
        if (!numero || Number.isNaN(numero)) {
            throw new common_1.BadRequestException('El numero de ficha es obligatorio y debe ser numerico.');
        }
        if (!nombre) {
            throw new common_1.BadRequestException('El area o nombre de la ficha es obligatorio.');
        }
        if (!programa) {
            throw new common_1.BadRequestException('El programa de la ficha es obligatorio.');
        }
        if (estado && !ESTADOS_FICHA.includes(estado)) {
            throw new common_1.BadRequestException('El estado de la ficha debe ser Activa o Inactiva.');
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
                throw new common_1.BadRequestException(`El programa de la ficha debe ser uno de: ${allowedProgramas.join(', ')}.`);
            }
            normalizedPrograma = await this.ensureEnumColumnValue('fichas', 'fic_programa', programa);
        }
        let normalizedNombre = allowedAreas.length
            ? this.resolveCatalogValue(nombre, allowedAreas)
            : nombre;
        const areasByPrograma = await this.getFichaAreasByPrograma();
        const allowedAreasForPrograma = areasByPrograma[normalizedPrograma] || [];
        if (!normalizedNombre) {
            if (!allowCustomCatalogValues) {
                throw new common_1.BadRequestException(`El area de la ficha debe ser una de: ${allowedAreas.join(', ')}.`);
            }
            normalizedNombre = await this.ensureEnumColumnValue('fichas', fichaNombreColumn, nombre);
        }
        if (!allowCustomCatalogValues &&
            allowedAreasForPrograma.length > 0 &&
            !allowedAreasForPrograma.includes(normalizedNombre)) {
            throw new common_1.BadRequestException(`El area seleccionada no pertenece al programa ${normalizedPrograma}.`);
        }
        const fichaEstado = estado || 'Activa';
        if (fichaExistente) {
            const fichaNombreActual = this.sanitizeText(fichaExistente.fichaNombre);
            const fichaProgramaActual = this.sanitizeText(fichaExistente.programa || fichaExistente.fic_programa);
            if (fichaNombreActual && fichaProgramaActual) {
                throw new common_1.ConflictException(`La ficha ${numero} ya existe.`);
            }
            await this.dataSource.query(`
          UPDATE fichas
          SET ${fichaNombreColumn} = ?, fic_programa = ?, fic_estado = ?
          WHERE fic_numero = ?
        `, [normalizedNombre, normalizedPrograma, fichaEstado, numero]);
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
        await this.dataSource.query(`
        INSERT INTO fichas (fic_numero, ${fichaNombreColumn}, fic_programa, fic_estado)
        VALUES (?, ?, ?, ?)
      `, [numero, normalizedNombre, normalizedPrograma, fichaEstado]);
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
    async updateFicha(numero, payload, actorCedula) {
        var _a, _b, _c, _d, _e, _f, _g;
        await this.ensureFichaSchema();
        const fichaNumero = Number(this.sanitizeText(numero));
        if (!fichaNumero || Number.isNaN(fichaNumero)) {
            throw new common_1.BadRequestException('El numero de ficha es invalido.');
        }
        const actorDocumento = this.normalizeCedula(actorCedula);
        const fichaExistente = await this.getFichaByNumero(fichaNumero);
        if (!fichaExistente) {
            throw new common_1.NotFoundException(`No se encontro la ficha ${fichaNumero}.`);
        }
        const fichaNombreColumn = await this.getFichaNombreColumn();
        const allowCustomCatalogValues = Boolean(payload.allowCustomCatalogValues);
        const nombre = this.sanitizeText((_a = payload.nombre) !== null && _a !== void 0 ? _a : fichaExistente.fichaNombre);
        const programa = this.sanitizeText((_c = (_b = payload.programa) !== null && _b !== void 0 ? _b : fichaExistente.programa) !== null && _c !== void 0 ? _c : fichaExistente.fic_programa);
        const estado = this.sanitizeText((_e = (_d = payload.estado) !== null && _d !== void 0 ? _d : fichaExistente.estado) !== null && _e !== void 0 ? _e : fichaExistente.fic_estado);
        if (!nombre) {
            throw new common_1.BadRequestException('El area o nombre de la ficha es obligatorio.');
        }
        if (!programa) {
            throw new common_1.BadRequestException('El programa de la ficha es obligatorio.');
        }
        if (estado && !ESTADOS_FICHA.includes(estado)) {
            throw new common_1.BadRequestException('El estado de la ficha debe ser Activa o Inactiva.');
        }
        const allowedAreas = await this.getEnumColumnOptions('fichas', fichaNombreColumn);
        const allowedProgramas = await this.getEnumColumnOptions('fichas', 'fic_programa');
        let normalizedPrograma = allowedProgramas.length
            ? this.resolveCatalogValue(programa, allowedProgramas)
            : programa;
        if (!normalizedPrograma) {
            if (!allowCustomCatalogValues) {
                throw new common_1.BadRequestException(`El programa de la ficha debe ser uno de: ${allowedProgramas.join(', ')}.`);
            }
            normalizedPrograma = await this.ensureEnumColumnValue('fichas', 'fic_programa', programa);
        }
        let normalizedNombre = allowedAreas.length
            ? this.resolveCatalogValue(nombre, allowedAreas)
            : nombre;
        if (!normalizedNombre) {
            if (!allowCustomCatalogValues) {
                throw new common_1.BadRequestException(`El area de la ficha debe ser una de: ${allowedAreas.join(', ')}.`);
            }
            normalizedNombre = await this.ensureEnumColumnValue('fichas', fichaNombreColumn, nombre);
        }
        const fichaEstado = estado || 'Activa';
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Programa', (_f = fichaExistente.programa) !== null && _f !== void 0 ? _f : fichaExistente.fic_programa, normalizedPrograma);
        this.pushCambioSistemaIfDifferent(cambios, 'Area', fichaExistente.fichaNombre, normalizedNombre);
        this.pushCambioSistemaIfDifferent(cambios, 'Estado ficha', (_g = fichaExistente.estado) !== null && _g !== void 0 ? _g : fichaExistente.fic_estado, fichaEstado);
        const descripcionCambio = cambios.length > 0
            ? `Ficha ${fichaNumero} actualizada. ${cambios.join('; ')}`
            : `Ficha ${fichaNumero} editada. Sin cambios detectados.`;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`
          UPDATE fichas
          SET ${fichaNombreColumn} = ?, fic_programa = ?, fic_estado = ?
          WHERE fic_numero = ?
        `, [normalizedNombre, normalizedPrograma, fichaEstado, fichaNumero]);
            await this.insertCambioSistema(queryRunner, actorDocumento, descripcionCambio);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                mensaje: cambios.length > 0
                    ? `Ficha ${fichaNumero} actualizada correctamente.`
                    : `No se detectaron cambios para la ficha ${fichaNumero}.`,
                ficha: {
                    numero: String(fichaNumero),
                    nombre: normalizedNombre,
                    programa: normalizedPrograma,
                    estado: fichaEstado,
                },
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo actualizar la ficha: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteFicha(numero, actorCedula) {
        var _a;
        await this.ensureFichaSchema();
        const fichaNumero = Number(this.sanitizeText(numero));
        if (!fichaNumero || Number.isNaN(fichaNumero)) {
            throw new common_1.BadRequestException('El numero de ficha es invalido.');
        }
        const actorDocumento = this.normalizeCedula(actorCedula);
        const fichaExistente = await this.getFichaByNumero(fichaNumero);
        if (!fichaExistente) {
            throw new common_1.NotFoundException(`No se encontro la ficha ${fichaNumero}.`);
        }
        const estadoActual = this.sanitizeText((_a = fichaExistente.estado) !== null && _a !== void 0 ? _a : fichaExistente.fic_estado) || 'Activa';
        if (estadoActual === 'Inactiva') {
            return {
                ok: true,
                mensaje: `La ficha ${fichaNumero} ya se encuentra Inactiva.`,
            };
        }
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Estado ficha', estadoActual, 'Inactiva');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`UPDATE fichas SET fic_estado = 'Inactiva' WHERE fic_numero = ?`, [fichaNumero]);
            await this.insertCambioSistema(queryRunner, actorDocumento, `Ficha ${fichaNumero} eliminada. ${cambios.join('; ')}`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                mensaje: `Ficha ${fichaNumero} eliminada correctamente.`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo eliminar la ficha: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async renamePrograma(payload, actorCedula) {
        await this.ensureFichaSchema();
        const actorDocumento = this.normalizeCedula(actorCedula);
        const programaActualRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.programaActual);
        const programaNuevoRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.programaNuevo);
        if (!programaActualRaw) {
            throw new common_1.BadRequestException('El programa actual es obligatorio.');
        }
        if (!programaNuevoRaw) {
            throw new common_1.BadRequestException('El programa nuevo es obligatorio.');
        }
        const allowedProgramas = await this.getEnumColumnOptions('fichas', 'fic_programa');
        const programaActual = allowedProgramas.length
            ? this.resolveCatalogValue(programaActualRaw, allowedProgramas)
            : programaActualRaw;
        if (!programaActual) {
            throw new common_1.BadRequestException(`El programa actual debe ser uno de: ${allowedProgramas.join(', ')}.`);
        }
        let programaNuevo = allowedProgramas.length
            ? this.resolveCatalogValue(programaNuevoRaw, allowedProgramas)
            : programaNuevoRaw;
        if (!programaNuevo) {
            programaNuevo = await this.ensureEnumColumnValue('fichas', 'fic_programa', programaNuevoRaw);
        }
        if (this.sanitizeText(programaActual) === this.sanitizeText(programaNuevo)) {
            return {
                ok: true,
                mensaje: 'No se detectaron cambios en el programa.',
            };
        }
        const [countRow] = await this.dataSource.query('SELECT COUNT(*) AS total FROM fichas WHERE fic_programa = ?', [programaActual]);
        const total = Number((countRow === null || countRow === void 0 ? void 0 : countRow.total) || 0);
        if (!total) {
            throw new common_1.NotFoundException('No se encontraron fichas con el programa indicado.');
        }
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Programa', programaActual, programaNuevo);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query('UPDATE fichas SET fic_programa = ? WHERE fic_programa = ?', [programaNuevo, programaActual]);
            await this.insertCambioSistema(queryRunner, actorDocumento, `Catalogo de programas actualizado. ${cambios.join('; ')}. Fichas afectadas: ${total}.`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                mensaje: 'Programa actualizado correctamente.',
                fichasAfectadas: total,
                antes: programaActual,
                despues: programaNuevo,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo actualizar el programa: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async deletePrograma(payload, actorCedula) {
        await this.ensureFichaSchema();
        const actorDocumento = this.normalizeCedula(actorCedula);
        const programaRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.programa);
        if (!programaRaw) {
            throw new common_1.BadRequestException('El programa es obligatorio.');
        }
        const allowedProgramas = await this.getEnumColumnOptions('fichas', 'fic_programa');
        const programa = allowedProgramas.length
            ? this.resolveCatalogValue(programaRaw, allowedProgramas)
            : programaRaw;
        if (!programa) {
            throw new common_1.BadRequestException(`El programa debe ser uno de: ${allowedProgramas.join(', ')}.`);
        }
        const [countRow] = await this.dataSource.query('SELECT COUNT(*) AS total FROM fichas WHERE fic_programa = ?', [programa]);
        const total = Number((countRow === null || countRow === void 0 ? void 0 : countRow.total) || 0);
        if (!total) {
            throw new common_1.NotFoundException('No se encontraron fichas con el programa indicado.');
        }
        const column = await this.getColumnMetadata('fichas', 'fic_programa');
        const isNullable = String((column === null || column === void 0 ? void 0 : column.isNullable) || '').toUpperCase() === 'YES';
        let replacementValue = null;
        if (!isNullable) {
            replacementValue = await this.ensureEnumColumnValue('fichas', 'fic_programa', 'Sin programa');
        }
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Programa', programa, replacementValue !== null && replacementValue !== void 0 ? replacementValue : '');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (replacementValue === null) {
                await queryRunner.query('UPDATE fichas SET fic_programa = NULL WHERE fic_programa = ?', [programa]);
            }
            else {
                await queryRunner.query('UPDATE fichas SET fic_programa = ? WHERE fic_programa = ?', [replacementValue, programa]);
            }
            await this.insertCambioSistema(queryRunner, actorDocumento, `Programa eliminado. ${cambios.join('; ')}. Fichas afectadas: ${total}.`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                mensaje: 'Programa eliminado correctamente.',
                fichasAfectadas: total,
                programa,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo eliminar el programa: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async renameArea(payload, actorCedula) {
        await this.ensureFichaSchema();
        const actorDocumento = this.normalizeCedula(actorCedula);
        const fichaNombreColumn = await this.getFichaNombreColumn();
        const programaRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.programa);
        const areaActualRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.areaActual);
        const areaNuevaRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.areaNueva);
        if (!areaActualRaw) {
            throw new common_1.BadRequestException('El area actual es obligatoria.');
        }
        if (!areaNuevaRaw) {
            throw new common_1.BadRequestException('El area nueva es obligatoria.');
        }
        const allowedAreas = await this.getEnumColumnOptions('fichas', fichaNombreColumn);
        const allowedProgramas = await this.getEnumColumnOptions('fichas', 'fic_programa');
        const areaActual = allowedAreas.length
            ? this.resolveCatalogValue(areaActualRaw, allowedAreas)
            : areaActualRaw;
        if (!areaActual) {
            throw new common_1.BadRequestException(`El area actual debe ser una de: ${allowedAreas.join(', ')}.`);
        }
        let areaNueva = allowedAreas.length
            ? this.resolveCatalogValue(areaNuevaRaw, allowedAreas)
            : areaNuevaRaw;
        if (!areaNueva) {
            areaNueva = await this.ensureEnumColumnValue('fichas', fichaNombreColumn, areaNuevaRaw);
        }
        if (this.sanitizeText(areaActual) === this.sanitizeText(areaNueva)) {
            return { ok: true, mensaje: 'No se detectaron cambios en el area.' };
        }
        const programa = programaRaw
            ? allowedProgramas.length
                ? this.resolveCatalogValue(programaRaw, allowedProgramas)
                : programaRaw
            : '';
        if (programaRaw && !programa) {
            throw new common_1.BadRequestException(`El programa debe ser uno de: ${allowedProgramas.join(', ')}.`);
        }
        const whereSql = programa
            ? `WHERE ${fichaNombreColumn} = ? AND fic_programa = ?`
            : `WHERE ${fichaNombreColumn} = ?`;
        const countParams = programa ? [areaActual, programa] : [areaActual];
        const [countRow] = await this.dataSource.query(`SELECT COUNT(*) AS total FROM fichas ${whereSql}`, countParams);
        const total = Number((countRow === null || countRow === void 0 ? void 0 : countRow.total) || 0);
        if (!total) {
            throw new common_1.NotFoundException('No se encontraron fichas con el area indicada.');
        }
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Area', areaActual, areaNueva);
        if (programa) {
            this.pushCambioSistemaIfDifferent(cambios, 'Programa', programa, programa);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const updateSql = programa
                ? `UPDATE fichas SET ${fichaNombreColumn} = ? WHERE ${fichaNombreColumn} = ? AND fic_programa = ?`
                : `UPDATE fichas SET ${fichaNombreColumn} = ? WHERE ${fichaNombreColumn} = ?`;
            const updateParams = programa
                ? [areaNueva, areaActual, programa]
                : [areaNueva, areaActual];
            await queryRunner.query(updateSql, updateParams);
            await this.insertCambioSistema(queryRunner, actorDocumento, `Catalogo de areas actualizado. ${cambios.join('; ')}. Fichas afectadas: ${total}.`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                mensaje: 'Area actualizada correctamente.',
                fichasAfectadas: total,
                antes: areaActual,
                despues: areaNueva,
                programa: programa || null,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo actualizar el area: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteArea(payload, actorCedula) {
        await this.ensureFichaSchema();
        const actorDocumento = this.normalizeCedula(actorCedula);
        const fichaNombreColumn = await this.getFichaNombreColumn();
        const programaRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.programa);
        const areaRaw = this.sanitizeText(payload === null || payload === void 0 ? void 0 : payload.area);
        if (!areaRaw) {
            throw new common_1.BadRequestException('El area es obligatoria.');
        }
        const allowedAreas = await this.getEnumColumnOptions('fichas', fichaNombreColumn);
        const allowedProgramas = await this.getEnumColumnOptions('fichas', 'fic_programa');
        const area = allowedAreas.length
            ? this.resolveCatalogValue(areaRaw, allowedAreas)
            : areaRaw;
        if (!area) {
            throw new common_1.BadRequestException(`El area debe ser una de: ${allowedAreas.join(', ')}.`);
        }
        const programa = programaRaw
            ? allowedProgramas.length
                ? this.resolveCatalogValue(programaRaw, allowedProgramas)
                : programaRaw
            : '';
        if (programaRaw && !programa) {
            throw new common_1.BadRequestException(`El programa debe ser uno de: ${allowedProgramas.join(', ')}.`);
        }
        const whereSql = programa
            ? `WHERE ${fichaNombreColumn} = ? AND fic_programa = ?`
            : `WHERE ${fichaNombreColumn} = ?`;
        const countParams = programa ? [area, programa] : [area];
        const [countRow] = await this.dataSource.query(`SELECT COUNT(*) AS total FROM fichas ${whereSql}`, countParams);
        const total = Number((countRow === null || countRow === void 0 ? void 0 : countRow.total) || 0);
        if (!total) {
            throw new common_1.NotFoundException('No se encontraron fichas con el area indicada.');
        }
        const column = await this.getColumnMetadata('fichas', fichaNombreColumn);
        const isNullable = String((column === null || column === void 0 ? void 0 : column.isNullable) || '').toUpperCase() === 'YES';
        let replacementValue = null;
        if (!isNullable) {
            replacementValue = await this.ensureEnumColumnValue('fichas', fichaNombreColumn, 'Sin area');
        }
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Area', area, replacementValue !== null && replacementValue !== void 0 ? replacementValue : '');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const updateSql = programa
                ? `UPDATE fichas SET ${fichaNombreColumn} = ${replacementValue === null ? 'NULL' : '?'} WHERE ${fichaNombreColumn} = ? AND fic_programa = ?`
                : `UPDATE fichas SET ${fichaNombreColumn} = ${replacementValue === null ? 'NULL' : '?'} WHERE ${fichaNombreColumn} = ?`;
            const updateParams = replacementValue === null
                ? programa
                    ? [area, programa]
                    : [area]
                : programa
                    ? [replacementValue, area, programa]
                    : [replacementValue, area];
            await queryRunner.query(updateSql, updateParams);
            await this.insertCambioSistema(queryRunner, actorDocumento, `Area eliminada. ${cambios.join('; ')}. Fichas afectadas: ${total}.`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                mensaje: 'Area eliminada correctamente.',
                fichasAfectadas: total,
                area,
                programa: programa || null,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo eliminar el area: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async importUsuarios(rows) {
        await this.ensureUsuarioColumns();
        await this.ensureFichaSchema();
        if (!Array.isArray(rows) || rows.length === 0) {
            throw new common_1.BadRequestException('Debes enviar al menos un usuario para importar.');
        }
        const normalizedRows = rows.map((item, index) => ({
            fila: index + 2,
            documento: this.sanitizeText(item === null || item === void 0 ? void 0 : item.documento),
            tipoDocumento: this.sanitizeText(item === null || item === void 0 ? void 0 : item.tipoDocumento).toUpperCase() || 'CC',
            ficha: this.sanitizeText(item === null || item === void 0 ? void 0 : item.ficha),
            nombre: this.sanitizeText(item === null || item === void 0 ? void 0 : item.nombre),
            apellido: this.sanitizeText(item === null || item === void 0 ? void 0 : item.apellido),
            sexo: this.sanitizeText(item === null || item === void 0 ? void 0 : item.sexo),
            telefono: this.sanitizeText(item === null || item === void 0 ? void 0 : item.telefono),
            email: this.sanitizeText(item === null || item === void 0 ? void 0 : item.email),
            especializacion: this.sanitizeText(item === null || item === void 0 ? void 0 : item.especializacion),
            tipoUsuario: this.sanitizeText(item === null || item === void 0 ? void 0 : item.tipoUsuario).toLowerCase(),
        }));
        const validationErrors = normalizedRows
            .flatMap((row) => {
            const rowErrors = [];
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
                    message: 'El tipo de usuario debe ser Aprendiz o Instructor.',
                });
            }
            if (row.sexo && !SEXOS_USUARIO.includes(row.sexo)) {
                rowErrors.push({
                    fila: row.fila,
                    documento: row.documento || 'Sin documento',
                    message: 'El sexo debe ser Hombre o Mujer.',
                });
            }
            if (row.tipoUsuario === 'aprendiz' &&
                (!row.ficha || Number.isNaN(Number(row.ficha)))) {
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
            if (row.tipoUsuario === 'instructor' &&
                !row.especializacion &&
                !row.ficha) {
                rowErrors.push({
                    fila: row.fila,
                    documento: row.documento || 'Sin documento',
                    message: 'La ficha es obligatoria para el instructor en esta plantilla de importacion.',
                });
            }
            return rowErrors;
        });
        if (validationErrors.length > 0) {
            throw new common_1.BadRequestException({
                code: 'INVALID_IMPORT_ROWS',
                message: 'El archivo contiene filas invalidas.',
                errors: validationErrors,
            });
        }
        const fichaNumbers = Array.from(new Set(normalizedRows
            .map((row) => Number(row.ficha))
            .filter((item) => !Number.isNaN(item))));
        const fichaNombreSelect = await this.getFichaNombreSelect('');
        const existingFichas = fichaNumbers.length > 0
            ? await this.dataSource.query(`
              SELECT
                CAST(fic_numero AS CHAR) AS numero,
                ${fichaNombreSelect} AS nombre,
                fic_programa AS programa,
                fic_estado AS estado
              FROM fichas
              WHERE fic_numero IN (${fichaNumbers.map(() => '?').join(', ')})
            `, fichaNumbers)
            : [];
        const existingFichaMap = new Map((existingFichas || []).map((item) => [
            String(item.numero),
            {
                nombre: this.sanitizeText(item.nombre),
                programa: this.sanitizeText(item.programa),
                estado: this.sanitizeText(item.estado) || 'Activa',
            },
        ]));
        const missingFichas = fichaNumbers
            .map(String)
            .filter((numero) => {
            const ficha = existingFichaMap.get(numero);
            return !ficha || !ficha.nombre || !ficha.programa;
        })
            .sort((a, b) => Number(a) - Number(b));
        if (missingFichas.length > 0) {
            throw new common_1.BadRequestException({
                code: 'MISSING_FICHAS',
                message: 'Hay fichas que no existen o estan incompletas en la base de datos. Completa su area y programa antes de continuar.',
                missingFichas: missingFichas.map((numero) => {
                    const ficha = existingFichaMap.get(numero);
                    return {
                        numero,
                        nombre: (ficha === null || ficha === void 0 ? void 0 : ficha.nombre) || '',
                        programa: (ficha === null || ficha === void 0 ? void 0 : ficha.programa) || '',
                        estado: (ficha === null || ficha === void 0 ? void 0 : ficha.estado) === 'Inactiva' ? 'Inactiva' : 'Activa',
                    };
                }),
            });
        }
        const created = [];
        const errors = [];
        for (const row of normalizedRows) {
            const password = this.buildDefaultPassword(row.nombre);
            try {
                await this.createUsuario({
                    tipoUsuario: row.tipoUsuario,
                    cedula: row.documento,
                    tipoDocumento: row.tipoDocumento,
                    nombre: row.nombre,
                    apellidos: row.apellido,
                    ficha: row.ficha || undefined,
                    correo: row.email,
                    telefono: row.telefono,
                    sexo: row.tipoUsuario === 'aprendiz' ? row.sexo : undefined,
                    especializacion: row.tipoUsuario === 'instructor'
                        ? row.especializacion || undefined
                        : undefined,
                    password,
                });
                created.push({
                    fila: row.fila,
                    documento: row.documento,
                    nombre: row.nombre,
                    tipoUsuario: row.tipoUsuario,
                    passwordTemporal: password,
                });
            }
            catch (error) {
                errors.push({
                    fila: row.fila,
                    documento: row.documento,
                    message: error instanceof Error
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
    async findAllAprendices(cedulaSolicitante) {
        await this.ensureUsuarioColumns();
        await this.ensureFichaSchema();
        const fichaNombreSelect = await this.getFichaNombreSelect('f');
        const rolSolicitante = await this.getRolUsuario(cedulaSolicitante);
        let filtroFichas = '';
        let params = [];
        if (rolSolicitante === 2) {
            const fichasAsignadas = await this.getFichasAsignadasUsuario(Number(cedulaSolicitante));
            if (fichasAsignadas.length === 0) {
                return [];
            }
            filtroFichas = ` AND uf.fic_numero_FK IN (${fichasAsignadas.map(() => '?').join(', ')})`;
            params = fichasAsignadas;
        }
        const rows = await this.dataSource.query(`
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
    `, params);
        const aprendicesMap = new Map();
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
    async findAllInstructores(_cedulaSolicitante) {
        void _cedulaSolicitante;
        await this.ensureUsuarioColumns();
        await this.ensureFichaSchema();
        const fichaNombreSelect = await this.getFichaNombreSelect('f');
        const rows = await this.dataSource.query(`
      SELECT
        u.usu_cedula AS documento,
        u.usu_tipodedocumento AS tipoDocumento,
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
        const instructoresMap = new Map();
        for (const row of rows || []) {
            const documento = String(row.documento);
            if (!instructoresMap.has(documento)) {
                instructoresMap.set(documento, {
                    documento,
                    tipoDocumento: row.tipoDocumento || 'CC',
                    especializacion: row.especializacion || 'Sin especializacion',
                    fichasCargo: [],
                    fichasDetalle: [],
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
            if (fichaDetalle &&
                !instructor.fichasCargo.includes(fichaDetalle.ficha)) {
                instructor.fichasCargo.push(fichaDetalle.ficha);
                instructor.fichasDetalle.push(fichaDetalle);
            }
        }
        return Array.from(instructoresMap.values());
    }
    async createUsuario(payload) {
        await this.ensureUsuarioColumns();
        const tipoUsuario = payload.tipoUsuario === 'instructor' ? 'instructor' : 'aprendiz';
        const cedula = Number(payload.cedula);
        const nombre = this.sanitizeText(payload.nombre);
        const apellidos = this.sanitizeText(payload.apellidos);
        const correo = this.sanitizeText(payload.correo);
        const telefono = this.sanitizeText(payload.telefono);
        const password = this.sanitizeText(payload.password) || this.buildDefaultPassword(nombre);
        const tipoDocumento = this.sanitizeText(payload.tipoDocumento) || 'CC';
        const fichaRaw = this.sanitizeText(payload.ficha);
        const sexo = this.sanitizeText(payload.sexo);
        if (!cedula || Number.isNaN(cedula)) {
            throw new common_1.BadRequestException('La cedula es obligatoria y debe ser numerica.');
        }
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre es obligatorio.');
        }
        if (!apellidos) {
            throw new common_1.BadRequestException('El apellido es obligatorio.');
        }
        if (!password || password.length < 4) {
            throw new common_1.BadRequestException('La contrasena es obligatoria.');
        }
        if (sexo && !SEXOS_USUARIO.includes(sexo)) {
            throw new common_1.BadRequestException('El sexo debe ser Hombre o Mujer.');
        }
        const sexoNormalizado = sexo ? sexo : null;
        let fichaNumero = null;
        let ficha = null;
        if (tipoUsuario === 'instructor' && !fichaRaw) {
            throw new common_1.BadRequestException('La ficha es obligatoria para el instructor y debe ser numerica.');
        }
        if (fichaRaw) {
            await this.ensureFichaSchema();
            fichaNumero = Number(fichaRaw);
            if (!fichaNumero || Number.isNaN(fichaNumero)) {
                throw new common_1.BadRequestException('La ficha es obligatoria y debe ser numerica.');
            }
            ficha = await this.getFichaByNumero(fichaNumero);
            if (!ficha) {
                throw new common_1.NotFoundException('La ficha seleccionada no existe.');
            }
            if (ficha.fic_estado !== 'Activa') {
                throw new common_1.BadRequestException('La ficha seleccionada no esta activa.');
            }
        }
        const especializacion = this.sanitizeText(payload.especializacion) ||
            (tipoUsuario === 'instructor'
                ? this.sanitizeText((ficha === null || ficha === void 0 ? void 0 : ficha.programa) || (ficha === null || ficha === void 0 ? void 0 : ficha.fic_programa))
                : '');
        const yaExiste = await this.usuarioRepository.findOneBy({
            usuCedula: cedula,
        });
        if (yaExiste) {
            if (tipoUsuario === 'instructor' && yaExiste.rolSisIdFk === 2) {
                if (!fichaNumero) {
                    throw new common_1.ConflictException('Ya existe un instructor con esa cedula.');
                }
                const fichaAsignada = await this.ensureUsuarioFichaAssignment(this.dataSource, cedula, fichaNumero);
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
                const [registro] = await this.dataSource.query('SELECT fecha_registro FROM usuario WHERE usu_cedula = ? LIMIT 1', [cedula]);
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
                        especializacion: yaExiste.usuEspecializacion || especializacion || '',
                        sexo: yaExiste.usuSexo || sexoNormalizado || '',
                        ficha: fichaNumero ? String(fichaNumero) : '',
                        fichaNombre: (ficha === null || ficha === void 0 ? void 0 : ficha.fichaNombre) || '',
                        programa: (ficha === null || ficha === void 0 ? void 0 : ficha.programa) || (ficha === null || ficha === void 0 ? void 0 : ficha.fic_programa) || '',
                        telefono: yaExiste.usuTelefono || telefono || '',
                        email: yaExiste.usuCorreo || correo || '',
                        fechaInscripcion: this.formatDateToIso(registro === null || registro === void 0 ? void 0 : registro.fecha_registro),
                        estado: yaExiste.usuEstado || 'Activo',
                    },
                    fichaAsignada,
                };
            }
            throw new common_1.ConflictException('Ya existe un usuario con esa cedula.');
        }
        const hash = await bcrypt.hash(password, 10);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (tipoUsuario === 'instructor') {
                if (!correo) {
                    throw new common_1.BadRequestException('El correo es obligatorio para el instructor.');
                }
                if (!especializacion) {
                    throw new common_1.BadRequestException('La especializacion es obligatoria para el instructor.');
                }
                const nuevoInstructor = queryRunner.manager.create(Usuario_1.Usuario, {
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
                await queryRunner.manager.save(Usuario_1.Usuario, nuevoInstructor);
                if (fichaNumero) {
                    await this.ensureUsuarioFichaAssignment(queryRunner, cedula, fichaNumero);
                }
                const [registro] = await queryRunner.query('SELECT fecha_registro FROM usuario WHERE usu_cedula = ? LIMIT 1', [cedula]);
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
                        fichaNombre: (ficha === null || ficha === void 0 ? void 0 : ficha.fichaNombre) || '',
                        programa: (ficha === null || ficha === void 0 ? void 0 : ficha.programa) || (ficha === null || ficha === void 0 ? void 0 : ficha.fic_programa) || '',
                        telefono: nuevoInstructor.usuTelefono || '',
                        email: nuevoInstructor.usuCorreo || '',
                        fechaInscripcion: this.formatDateToIso(registro === null || registro === void 0 ? void 0 : registro.fecha_registro),
                        estado: nuevoInstructor.usuEstado || 'Activo',
                    },
                };
            }
            if (!fichaNumero) {
                throw new common_1.BadRequestException('La ficha es obligatoria y debe ser numerica.');
            }
            const nuevoAprendiz = queryRunner.manager.create(Usuario_1.Usuario, {
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
            await queryRunner.manager.save(Usuario_1.Usuario, nuevoAprendiz);
            await this.ensureUsuarioFichaAssignment(queryRunner, cedula, fichaNumero);
            const [registro] = await queryRunner.query('SELECT fecha_registro FROM usuario WHERE usu_cedula = ? LIMIT 1', [cedula]);
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
                    fechaInscripcion: this.formatDateToIso(registro === null || registro === void 0 ? void 0 : registro.fecha_registro),
                    estado: nuevoAprendiz.usuEstado || 'Activo',
                },
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo registrar el usuario: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateAprendiz(cedula, payload, actorCedula) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        await this.ensureUsuarioColumns();
        await this.ensureFichaSchema();
        const documento = Number(cedula);
        if (!documento || Number.isNaN(documento)) {
            throw new common_1.BadRequestException('La cedula del aprendiz es invalida.');
        }
        const actorDocumento = this.normalizeCedula(actorCedula);
        const aprendiz = await this.usuarioRepository.findOne({
            where: {
                usuCedula: documento,
                rolSisIdFk: 1,
            },
        });
        if (!aprendiz) {
            throw new common_1.NotFoundException('No se encontro el aprendiz solicitado.');
        }
        const nombre = this.sanitizeText((_a = payload.nombre) !== null && _a !== void 0 ? _a : aprendiz.usuNombres);
        const apellidos = this.sanitizeText((_b = payload.apellidos) !== null && _b !== void 0 ? _b : aprendiz.usuApellidos);
        const correo = this.sanitizeText((_c = payload.correo) !== null && _c !== void 0 ? _c : aprendiz.usuCorreo);
        const telefono = this.sanitizeText((_d = payload.telefono) !== null && _d !== void 0 ? _d : aprendiz.usuTelefono);
        const sexo = this.sanitizeText((_e = payload.sexo) !== null && _e !== void 0 ? _e : aprendiz.usuSexo);
        const estado = this.sanitizeText((_f = payload.estado) !== null && _f !== void 0 ? _f : aprendiz.usuEstado);
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre es obligatorio.');
        }
        if (!apellidos) {
            throw new common_1.BadRequestException('El apellido es obligatorio.');
        }
        if (!correo) {
            throw new common_1.BadRequestException('El correo es obligatorio.');
        }
        if (!ESTADOS_USUARIO.includes(estado)) {
            throw new common_1.BadRequestException('El estado debe ser Activo o Inactivo.');
        }
        if (sexo && !SEXOS_USUARIO.includes(sexo)) {
            throw new common_1.BadRequestException('El sexo debe ser Hombre o Mujer.');
        }
        const fichaActual = await this.getFichaActualUsuario(documento);
        const fichaNumero = Number(String((_h = (_g = payload.ficha) !== null && _g !== void 0 ? _g : fichaActual === null || fichaActual === void 0 ? void 0 : fichaActual.ficha) !== null && _h !== void 0 ? _h : '').trim());
        if (!fichaNumero || Number.isNaN(fichaNumero)) {
            throw new common_1.BadRequestException('La ficha es obligatoria y debe ser numerica.');
        }
        const ficha = await this.getFichaByNumero(fichaNumero);
        if (!ficha) {
            throw new common_1.NotFoundException('La ficha seleccionada no existe.');
        }
        if (ficha.fic_estado !== 'Activa') {
            throw new common_1.BadRequestException('La ficha seleccionada no esta activa.');
        }
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Nombre', aprendiz.usuNombres, nombre);
        this.pushCambioSistemaIfDifferent(cambios, 'Apellidos', aprendiz.usuApellidos, apellidos);
        this.pushCambioSistemaIfDifferent(cambios, 'Correo', aprendiz.usuCorreo, correo);
        this.pushCambioSistemaIfDifferent(cambios, 'Telefono', aprendiz.usuTelefono, telefono);
        this.pushCambioSistemaIfDifferent(cambios, 'Sexo', aprendiz.usuSexo, sexo);
        this.pushCambioSistemaIfDifferent(cambios, 'Estado', aprendiz.usuEstado, estado);
        this.pushCambioSistemaIfDifferent(cambios, 'Ficha', fichaActual === null || fichaActual === void 0 ? void 0 : fichaActual.ficha, fichaNumero);
        const descripcionCambio = cambios.length
            ? `Actualizo aprendiz ${documento} (${nombre} ${apellidos}). Cambios: ${cambios.join('; ')}`
            : `Actualizo aprendiz ${documento} (${nombre} ${apellidos}). Sin cambios detectados.`;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            aprendiz.usuNombres = nombre;
            aprendiz.usuApellidos = apellidos;
            aprendiz.usuCorreo = correo;
            aprendiz.usuTelefono = telefono || null;
            aprendiz.usuSexo = sexo ? sexo : null;
            aprendiz.usuEstado = estado;
            await queryRunner.manager.save(Usuario_1.Usuario, aprendiz);
            await queryRunner.query('DELETE FROM usuario_ficha WHERE usu_cedula_FK = ?', [documento]);
            await queryRunner.query(`
          INSERT INTO usuario_ficha (usu_cedula_FK, fic_numero_FK, usf_fecha_asignacion)
          VALUES (?, ?, ?)
        `, [
                documento,
                fichaNumero,
                (fichaActual === null || fichaActual === void 0 ? void 0 : fichaActual.fechaAsignacion) || new Date(),
            ]);
            await this.insertCambioSistema(queryRunner, actorDocumento, descripcionCambio);
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
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo actualizar el aprendiz: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateInstructor(cedula, payload, actorCedula) {
        var _a, _b, _c, _d, _e, _f;
        await this.ensureUsuarioColumns();
        await this.ensureFichaSchema();
        const documento = Number(cedula);
        if (!documento || Number.isNaN(documento)) {
            throw new common_1.BadRequestException('La cedula del instructor es invalida.');
        }
        const actorDocumento = this.normalizeCedula(actorCedula);
        const instructor = await this.usuarioRepository.findOne({
            where: {
                usuCedula: documento,
                rolSisIdFk: 2,
            },
        });
        if (!instructor) {
            throw new common_1.NotFoundException('No se encontro el instructor solicitado.');
        }
        const nombre = this.sanitizeText((_a = payload.nombre) !== null && _a !== void 0 ? _a : instructor.usuNombres);
        const apellidos = this.sanitizeText((_b = payload.apellidos) !== null && _b !== void 0 ? _b : instructor.usuApellidos);
        const correo = this.sanitizeText((_c = payload.correo) !== null && _c !== void 0 ? _c : instructor.usuCorreo);
        const telefono = this.sanitizeText((_d = payload.telefono) !== null && _d !== void 0 ? _d : instructor.usuTelefono);
        const sexo = this.sanitizeText((_e = payload.sexo) !== null && _e !== void 0 ? _e : instructor.usuSexo);
        const especializacion = this.sanitizeText((_f = payload.especializacion) !== null && _f !== void 0 ? _f : instructor.usuEspecializacion);
        const shouldUpdateFichas = Array.isArray(payload.fichas);
        const fichasSeleccionadas = shouldUpdateFichas
            ? Array.from(new Set((payload.fichas || [])
                .map((item) => Number(String(item !== null && item !== void 0 ? item : '').trim()))
                .filter((item) => !Number.isNaN(item) && item > 0)))
            : await this.getFichasAsignadasUsuario(documento);
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre es obligatorio.');
        }
        if (!apellidos) {
            throw new common_1.BadRequestException('El apellido es obligatorio.');
        }
        if (!correo) {
            throw new common_1.BadRequestException('El correo es obligatorio.');
        }
        if (!especializacion) {
            throw new common_1.BadRequestException('La especializacion es obligatoria.');
        }
        if (sexo && !SEXOS_USUARIO.includes(sexo)) {
            throw new common_1.BadRequestException('El sexo debe ser Hombre o Mujer.');
        }
        const fichasDetalle = await this.getFichasByNumeros(fichasSeleccionadas);
        if (fichasDetalle.length !== fichasSeleccionadas.length) {
            throw new common_1.NotFoundException('Una o varias fichas seleccionadas no existen.');
        }
        const fichasAntes = shouldUpdateFichas
            ? await this.getFichasAsignadasUsuario(documento)
            : null;
        const cambios = [];
        this.pushCambioSistemaIfDifferent(cambios, 'Nombre', instructor.usuNombres, nombre);
        this.pushCambioSistemaIfDifferent(cambios, 'Apellidos', instructor.usuApellidos, apellidos);
        this.pushCambioSistemaIfDifferent(cambios, 'Correo', instructor.usuCorreo, correo);
        this.pushCambioSistemaIfDifferent(cambios, 'Telefono', instructor.usuTelefono, telefono);
        this.pushCambioSistemaIfDifferent(cambios, 'Sexo', instructor.usuSexo, sexo);
        this.pushCambioSistemaIfDifferent(cambios, 'Especializacion', instructor.usuEspecializacion, especializacion);
        if (shouldUpdateFichas && fichasAntes) {
            this.pushCambioSistemaListIfDifferent(cambios, 'Fichas', fichasAntes, fichasSeleccionadas);
        }
        const descripcionCambio = cambios.length
            ? `Actualizo instructor ${documento} (${nombre} ${apellidos}). Cambios: ${cambios.join('; ')}`
            : `Actualizo instructor ${documento} (${nombre} ${apellidos}). Sin cambios detectados.`;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            instructor.usuNombres = nombre;
            instructor.usuApellidos = apellidos;
            instructor.usuCorreo = correo;
            instructor.usuTelefono = telefono || null;
            instructor.usuSexo = sexo ? sexo : null;
            instructor.usuEspecializacion = especializacion;
            await queryRunner.manager.save(Usuario_1.Usuario, instructor);
            if (shouldUpdateFichas) {
                await queryRunner.query('DELETE FROM usuario_ficha WHERE usu_cedula_FK = ?', [documento]);
                for (const fichaNumero of fichasSeleccionadas) {
                    await this.ensureUsuarioFichaAssignment(queryRunner, documento, fichaNumero);
                }
            }
            await this.insertCambioSistema(queryRunner, actorDocumento, descripcionCambio);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo actualizar el instructor: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
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
    async deleteAprendiz(cedula, actorCedula) {
        const documento = Number(cedula);
        if (!documento || Number.isNaN(documento)) {
            throw new common_1.BadRequestException('La cedula del aprendiz es invalida.');
        }
        const actorDocumento = this.normalizeCedula(actorCedula);
        const aprendiz = await this.usuarioRepository.findOne({
            where: {
                usuCedula: documento,
                rolSisIdFk: 1,
            },
            select: ['usuCedula', 'usuNombres', 'usuApellidos'],
        });
        if (!aprendiz) {
            throw new common_1.NotFoundException('No se encontro el aprendiz solicitado.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await this.deleteUsuarioReferences(queryRunner, documento);
            await queryRunner.query('DELETE FROM usuario WHERE usu_cedula = ? AND rol_sis_ID_FK = 1', [documento]);
            await this.insertCambioSistema(queryRunner, actorDocumento, `Elimino aprendiz ${documento} (${aprendiz.usuNombres || ''} ${aprendiz.usuApellidos || ''})`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                documento: String(documento),
                mensaje: `Aprendiz ${aprendiz.usuNombres || ''} ${aprendiz.usuApellidos || ''} eliminado correctamente.`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo eliminar el aprendiz: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteInstructor(cedula, actorCedula) {
        const documento = Number(cedula);
        if (!documento || Number.isNaN(documento)) {
            throw new common_1.BadRequestException('La cedula del instructor es invalida.');
        }
        const actorDocumento = this.normalizeCedula(actorCedula);
        const instructor = await this.usuarioRepository.findOne({
            where: {
                usuCedula: documento,
                rolSisIdFk: 2,
            },
            select: ['usuCedula', 'usuNombres', 'usuApellidos'],
        });
        if (!instructor) {
            throw new common_1.NotFoundException('No se encontro el instructor solicitado.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await this.deleteUsuarioReferences(queryRunner, documento);
            await queryRunner.query('DELETE FROM usuario WHERE usu_cedula = ? AND rol_sis_ID_FK = 2', [documento]);
            await this.insertCambioSistema(queryRunner, actorDocumento, `Elimino instructor ${documento} (${instructor.usuNombres || ''} ${instructor.usuApellidos || ''})`);
            await queryRunner.commitTransaction();
            return {
                ok: true,
                documento: String(documento),
                mensaje: `Instructor ${instructor.usuNombres || ''} ${instructor.usuApellidos || ''} eliminado correctamente.`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            const err = error;
            throw new common_1.InternalServerErrorException(`No se pudo eliminar el instructor: ${(err === null || err === void 0 ? void 0 : err.message) || 'Error interno.'}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async updateAprendizEstado(cedula, estado) {
        await this.ensureUsuarioColumns();
        const documento = Number(cedula);
        if (!documento || Number.isNaN(documento)) {
            throw new common_1.BadRequestException('La cedula del aprendiz es invalida.');
        }
        if (!ESTADOS_USUARIO.includes(estado)) {
            throw new common_1.BadRequestException('El estado debe ser Activo o Inactivo.');
        }
        const aprendiz = await this.usuarioRepository.findOne({
            where: {
                usuCedula: documento,
                rolSisIdFk: 1,
            },
        });
        if (!aprendiz) {
            throw new common_1.NotFoundException('No se encontro el aprendiz solicitado.');
        }
        aprendiz.usuEstado = estado;
        await this.usuarioRepository.save(aprendiz);
        return {
            ok: true,
            documento: String(aprendiz.usuCedula),
            estado: aprendiz.usuEstado,
        };
    }
    async getInstructorStats(cedula) {
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
};
exports.ListaService = ListaService;
exports.ListaService = ListaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Usuario_1.Usuario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], ListaService);
//# sourceMappingURL=ListaService.js.map