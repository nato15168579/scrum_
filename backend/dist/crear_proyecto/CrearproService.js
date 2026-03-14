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
const UsuProDetPar_1 = require("../entities/UsuProDetPar");
let CrearproService = class CrearproService {
    constructor(proyectoRepository, usuRepository) {
        this.proyectoRepository = proyectoRepository;
        this.usuRepository = usuRepository;
    }
    getProjectTableName() {
        return this.proyectoRepository.metadata.tableName;
    }
    getEscapedProjectTableName() {
        return `\`${this.getProjectTableName().replace(/`/g, '``')}\``;
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
        await this.proyectoRepository.query(`
      CREATE TABLE IF NOT EXISTS \`ficha_proyecto\` (
        \`pro_ID_FK\` int(11) NOT NULL COMMENT 'id del proyecto asociado a la ficha',
        \`fic_numero_FK\` int(11) NOT NULL COMMENT 'numero de ficha asociada al proyecto',
        \`fip_fecha_asignacion\` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'fecha de asignacion del proyecto a la ficha',
        PRIMARY KEY (\`pro_ID_FK\`),
        KEY \`idx_ficha_proyecto_ficha\` (\`fic_numero_FK\`),
        CONSTRAINT \`ficha_proyecto_ibfk_1\` FOREIGN KEY (\`pro_ID_FK\`) REFERENCES ${escapedProjectTableName} (\`pro_ID\`),
        CONSTRAINT \`ficha_proyecto_ibfk_2\` FOREIGN KEY (\`fic_numero_FK\`) REFERENCES \`fichas\` (\`fic_numero\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
        return true;
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
    async checkProjectExists(nombre) {
        const proyecto = await this.proyectoRepository.findOne({ where: { proNombre: nombre } });
        return { exists: !!proyecto };
    }
    async createProject(data) {
        const existe = await this.proyectoRepository.findOne({ where: { proNombre: data.nombre } });
        if (existe)
            throw new common_1.ConflictException('El nombre del proyecto ya está registrado');
        try {
            const ultimo = await this.proyectoRepository.findOne({
                where: {},
                order: { proId: 'DESC' }
            });
            const nuevoId = ultimo ? ultimo.proId + 1 : 1;
            const hasProjectCodeColumn = await this.ensureProjectCodeSchema();
            const codigoProyecto = hasProjectCodeColumn
                ? await this.generateUniqueProjectCode(nuevoId)
                : null;
            const fechaInicioNormalizada = typeof data.fechaInicio === 'string'
                ? (data.fechaInicio.trim() || null)
                : data.fecha;
            const fechaFinNormalizada = typeof data.fechaFin === 'string'
                ? (data.fechaFin.trim() || null)
                : data.fecha;
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
            const relacion = await this.usuRepository.findOne({
                where: { detParId: data.cedula }
            });
            const idParametroValido = relacion ? relacion.detParId : 1;
            const nuevoProyecto = this.proyectoRepository.create({
                proId: nuevoId,
                proNombre: data.nombre,
                proObjetivoGeneral: data.objetivo,
                proFechaInicio: fechaInicioNormalizada,
                detParIdFk: idParametroValido,
                proDescription: data.objetivo,
                proJustificacion: "N/A",
                proObjetivosEspecificos: "N/A",
                proFechaFin: fechaFinNormalizada,
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
            console.error("ERROR CRÍTICO:", error);
            throw new common_1.InternalServerErrorException('No se pudo completar el registro en la base de datos.');
        }
    }
};
exports.CrearproService = CrearproService;
exports.CrearproService = CrearproService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Proyecto_1.Proyecto)),
    __param(1, (0, typeorm_1.InjectRepository)(UsuProDetPar_1.UsuProDetPar)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CrearproService);
//# sourceMappingURL=CrearproService.js.map