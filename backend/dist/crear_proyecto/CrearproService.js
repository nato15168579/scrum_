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
exports.CrearproService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Proyecto_1 = require("../entities/Proyecto");
let CrearproService = class CrearproService {
    constructor(proyectoRepository) {
        this.proyectoRepository = proyectoRepository;
    }
    getProjectTableName() {
        return this.proyectoRepository.metadata.tableName;
    }
    getEscapedProjectTableName() {
        return `\`${this.getProjectTableName().replace(/`/g, '``')}\``;
    }
    async tableExists(tableName) {
        const [row] = await this.proyectoRepository.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `, [tableName]);
        return Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
    }
    async columnExists(tableName, columnName) {
        const [row] = await this.proyectoRepository.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `, [tableName, columnName]);
        return Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
    }
    async resolveFichaTableName() {
        if (await this.tableExists('ficha')) {
            return 'ficha';
        }
        if (await this.tableExists('fichas')) {
            return 'fichas';
        }
        return null;
    }
    async resolveFichaNumeroColumn(tableName) {
        if (await this.columnExists(tableName, 'fic_id')) {
            return 'fic_id';
        }
        if (await this.columnExists(tableName, 'fic_numero')) {
            return 'fic_numero';
        }
        return null;
    }
    async fichaExists(fichaNumero) {
        const fichaTableName = await this.resolveFichaTableName();
        if (!fichaTableName) {
            return false;
        }
        const fichaNumeroColumn = await this.resolveFichaNumeroColumn(fichaTableName);
        if (!fichaNumeroColumn) {
            return false;
        }
        const escapedFichaTableName = `\`${fichaTableName.replace(/`/g, '``')}\``;
        const escapedFichaNumeroColumn = `\`${fichaNumeroColumn.replace(/`/g, '``')}\``;
        const [row] = await this.proyectoRepository.query(`SELECT COUNT(*) AS total FROM ${escapedFichaTableName} WHERE ${escapedFichaNumeroColumn} = ?`, [fichaNumero]);
        return Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
    }
    async projectCodeColumnExists() {
        const proyectoTableName = this.getProjectTableName();
        const result = await this.proyectoRepository.query(`
        SELECT 1 AS ok
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND column_name = 'pro_codigo'
        LIMIT 1
      `, [proyectoTableName]);
        return Array.isArray(result) && result.length > 0;
    }
    async ensureFichaProyectoSchema() {
        const escapedProjectTableName = this.getEscapedProjectTableName();
        const fichaTableName = await this.resolveFichaTableName();
        const fichaNumeroColumn = fichaTableName
            ? await this.resolveFichaNumeroColumn(fichaTableName)
            : null;
        if (!fichaTableName || !fichaNumeroColumn) {
            throw new common_1.InternalServerErrorException('No existe una tabla de fichas compatible para relacionar proyectos.');
        }
        const escapedFichaTableName = `\`${fichaTableName.replace(/`/g, '``')}\``;
        const escapedFichaNumeroColumn = `\`${fichaNumeroColumn.replace(/`/g, '``')}\``;
        await this.proyectoRepository.query(`
        CREATE TABLE IF NOT EXISTS \`ficha_proyecto\` (
          \`pro_ID_FK\` int(11) NOT NULL COMMENT 'id del proyecto asociado a la ficha',
          \`fic_numero_FK\` int(11) NOT NULL COMMENT 'numero de ficha asociada al proyecto',
          \`fip_fecha_asignacion\` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'fecha de asignacion del proyecto a la ficha',
          PRIMARY KEY (\`pro_ID_FK\`),
          KEY \`idx_ficha_proyecto_ficha\` (\`fic_numero_FK\`),
          CONSTRAINT \`ficha_proyecto_ibfk_1\` FOREIGN KEY (\`pro_ID_FK\`) REFERENCES ${escapedProjectTableName} (\`pro_ID\`),
          CONSTRAINT \`ficha_proyecto_ibfk_2\` FOREIGN KEY (\`fic_numero_FK\`) REFERENCES ${escapedFichaTableName} (${escapedFichaNumeroColumn})
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `);
    }
    async ensureProjectCodeSchema() {
        const hasProjectCodeColumn = await this.projectCodeColumnExists();
        const escapedTableName = this.getEscapedProjectTableName();
        if (!hasProjectCodeColumn) {
            await this.proyectoRepository.query(`
          ALTER TABLE ${escapedTableName}
          ADD COLUMN pro_codigo VARCHAR(32) NULL COMMENT 'codigo unico del proyecto' AFTER pro_ID
        `);
        }
        await this.proyectoRepository.query(`
        UPDATE ${escapedTableName}
        SET pro_codigo = CONCAT('PRO-', LPAD(pro_ID, 6, '0'))
        WHERE pro_codigo IS NULL OR pro_codigo = ''
      `);
        const uniqueIndexExistsResult = await this.proyectoRepository.query(`
        SELECT 1 AS ok
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = ?
          AND index_name = 'uq_proyecto_codigo'
        LIMIT 1
      `, [this.getProjectTableName()]);
        const uniqueIndexExists = Array.isArray(uniqueIndexExistsResult) &&
            uniqueIndexExistsResult.length > 0;
        if (!uniqueIndexExists) {
            await this.proyectoRepository.query(`
          ALTER TABLE ${escapedTableName}
          ADD CONSTRAINT uq_proyecto_codigo UNIQUE (pro_codigo)
        `);
        }
        return true;
    }
    async generateUniqueProjectCode(projectId) {
        const baseCode = `PRO-${String(projectId).padStart(6, '0')}`;
        let candidate = baseCode;
        let suffix = 1;
        while (await this.proyectoRepository.findOne({
            where: { proCodigo: candidate },
        })) {
            candidate = `${baseCode}-${suffix}`;
            suffix += 1;
        }
        return candidate;
    }
    async resolveDefaultProjectStatusId() {
        if (!(await this.tableExists('detalle_parametro'))) {
            return null;
        }
        const [row] = await this.proyectoRepository.query(`
        SELECT det_par_ID AS detParId
        FROM detalle_parametro
        WHERE par_ID_FK = 1
        ORDER BY det_par_ID ASC
        LIMIT 1
      `);
        return (row === null || row === void 0 ? void 0 : row.detParId) ? Number(row.detParId) : null;
    }
    async checkProjectExists(nombre) {
        const proyecto = await this.proyectoRepository.findOne({
            where: { proNombre: String(nombre || '').trim() },
        });
        return { exists: !!proyecto };
    }
    async createProject(data) {
        const nombre = String(data.nombre || '').trim();
        const objetivo = String(data.objetivo || '').trim();
        if (!nombre) {
            throw new common_1.BadRequestException('El nombre del proyecto es obligatorio.');
        }
        if (!objetivo) {
            throw new common_1.BadRequestException('El objetivo del proyecto es obligatorio.');
        }
        const existe = await this.proyectoRepository.findOne({
            where: { proNombre: nombre },
        });
        if (existe) {
            throw new common_1.ConflictException('El nombre del proyecto ya esta registrado');
        }
        try {
            const ultimo = await this.proyectoRepository.findOne({
                where: {},
                order: { proId: 'DESC' },
            });
            const nuevoId = ultimo ? ultimo.proId + 1 : 1;
            const hasProjectCodeColumn = await this.ensureProjectCodeSchema();
            const codigoProyecto = hasProjectCodeColumn
                ? await this.generateUniqueProjectCode(nuevoId)
                : null;
            const fechaInicioNormalizada = typeof data.fechaInicio === 'string'
                ? data.fechaInicio.trim() || null
                : null;
            const fechaFinNormalizada = typeof data.fechaFin === 'string'
                ? data.fechaFin.trim() || null
                : null;
            const fichaRaw = typeof data.fichaNumero === 'string'
                ? data.fichaNumero.trim()
                : data.fichaNumero;
            const fichaNumero = fichaRaw === null || fichaRaw === undefined || fichaRaw === ''
                ? null
                : Number(fichaRaw);
            if (fichaNumero !== null &&
                (Number.isNaN(fichaNumero) || fichaNumero <= 0)) {
                throw new common_1.BadRequestException('La ficha seleccionada no es valida.');
            }
            if (fichaNumero !== null && !(await this.fichaExists(fichaNumero))) {
                throw new common_1.BadRequestException('La ficha seleccionada no existe.');
            }
            const fechaCreacionNormalizada = typeof data.fecha === 'string' && data.fecha.trim()
                ? new Date(`${data.fecha.trim()}T00:00:00`)
                : new Date();
            const idParametroValido = await this.resolveDefaultProjectStatusId();
            const nuevoProyecto = this.proyectoRepository.create({
                proId: nuevoId,
                proNombre: nombre,
                proObjetivoGeneral: objetivo,
                proFechaInicio: fechaInicioNormalizada,
                detParIdFk: idParametroValido,
                proDescription: objetivo,
                proJustificacion: 'N/A',
                proObjetivosEspecificos: 'N/A',
                proFechaFin: fechaFinNormalizada,
                proFechaCreacion: fechaCreacionNormalizada,
            });
            if (hasProjectCodeColumn && codigoProyecto) {
                nuevoProyecto.proCodigo = codigoProyecto;
            }
            const saved = await this.proyectoRepository.save(nuevoProyecto);
            if (fichaNumero !== null) {
                await this.ensureFichaProyectoSchema();
                await this.proyectoRepository.query(`
            INSERT INTO \`ficha_proyecto\` (pro_ID_FK, fic_numero_FK)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE fic_numero_FK = VALUES(fic_numero_FK)
          `, [nuevoId, fichaNumero]);
            }
            return saved;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            console.error('ERROR CRITICO:', error);
            throw new common_1.InternalServerErrorException('No se pudo completar el registro en la base de datos.');
        }
    }
};
exports.CrearproService = CrearproService;
exports.CrearproService = CrearproService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Proyecto_1.Proyecto)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CrearproService);
//# sourceMappingURL=CrearproService.js.map