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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerproService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const SchemaIntrospection_1 = require("../shared/database/SchemaIntrospection");
let VerproService = class VerproService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.schema = new SchemaIntrospection_1.SchemaIntrospection(dataSource);
    }
    wrapIdentifier(identifier) {
        return this.schema.wrapIdentifier(identifier);
    }
    tableExists(tableName) {
        return this.schema.tableExists(tableName);
    }
    columnExists(tableName, columnName) {
        return this.schema.columnExists(tableName, columnName);
    }
    getTableType(tableName) {
        return this.schema.getTableType(tableName);
    }
    ensureLegacyAdminViews() {
        return this.schema.ensureLegacyAdminViews();
    }
    async resolveUsuProDetParRoleColumn() {
        if (await this.columnExists('usu_pro_det_par', 'det_par_ID_FK')) {
            return 'det_par_ID_FK';
        }
        if (await this.columnExists('usu_pro_det_par', 'det_par_ID_')) {
            return 'det_par_ID_';
        }
        return null;
    }
    async resolveProyectoTable() {
        const candidates = ['proyecto', ' proyecto'];
        for (const candidate of candidates) {
            if (await this.tableExists(candidate)) {
                return candidate;
            }
        }
        return null;
    }
    async resolveFichaNombreColumn() {
        if (await this.columnExists('fichas', 'fic_nombre')) {
            return 'fic_nombre';
        }
        if (await this.columnExists('fichas', 'fic_area')) {
            return 'fic_area';
        }
        return null;
    }
    async resolveRolesScrum() {
        const hasDetalleParametro = await this.tableExists('detalle_parametro');
        if (!hasDetalleParametro)
            return [];
        const rows = await this.dataSource.query(`
      SELECT
        det_par_ID AS detParId,
        det_par_descripcion AS descripcion
      FROM detalle_parametro
      WHERE par_ID_FK = 2
      ORDER BY det_par_ID ASC
    `);
        return Array.isArray(rows) ? rows : [];
    }
    async resolveDefaultRolScrumId() {
        const roles = await this.resolveRolesScrum();
        const scrumTeam = roles.find((item) => String((item === null || item === void 0 ? void 0 : item.descripcion) || '')
            .trim()
            .toLowerCase()
            .includes('scrum team'));
        if (scrumTeam === null || scrumTeam === void 0 ? void 0 : scrumTeam.detParId) {
            return Number(scrumTeam.detParId);
        }
        const firstRole = roles[0];
        return (firstRole === null || firstRole === void 0 ? void 0 : firstRole.detParId) ? Number(firstRole.detParId) : null;
    }
    async resolveDefaultEstadoId() {
        const hasDetalleParametro = await this.tableExists('detalle_parametro');
        if (!hasDetalleParametro)
            return null;
        const [row] = await this.dataSource.query(`
      SELECT
        det_par_ID AS detParId
      FROM detalle_parametro
      WHERE par_ID_FK = 1
      ORDER BY
        CASE
          WHEN LOWER(TRIM(COALESCE(det_par_descripcion, ''))) = 'por hacer' THEN 0
          ELSE 1
        END,
        det_par_ID ASC
      LIMIT 1
    `);
        return (row === null || row === void 0 ? void 0 : row.detParId) ? Number(row.detParId) : null;
    }
    async resolveHistoriaEstadoColumn() {
        const candidates = ['det_par_ID_FK', 'det_par_ID_estado_FK'];
        for (const candidate of candidates) {
            if (await this.columnExists('historia_usuario', candidate)) {
                return candidate;
            }
        }
        return null;
    }
    async resolveObservacionEstadoColumn() {
        const candidates = ['det_par_id_FK', 'obs_estado_FK'];
        for (const candidate of candidates) {
            if (await this.columnExists('observaciones', candidate)) {
                return candidate;
            }
        }
        return null;
    }
    async resolveCriteriaProjectColumn() {
        const candidates = ['pro_ID_his_FK', 'pro_ID_FK'];
        for (const candidate of candidates) {
            if (await this.columnExists('criterios_aceptacion', candidate)) {
                return candidate;
            }
        }
        return null;
    }
    async resolveCriteriaHistoriaColumn() {
        const candidates = ['his_id_FK', 'his_ID_FK'];
        for (const candidate of candidates) {
            if (await this.columnExists('criterios_aceptacion', candidate)) {
                return candidate;
            }
        }
        return null;
    }
    normalizeIntegerFieldInput(value, label, options) {
        const normalized = String(value !== null && value !== void 0 ? value : '').trim();
        if (!normalized) {
            return null;
        }
        if (!/^-?\d+$/.test(normalized)) {
            throw new common_1.BadRequestException(`El campo ${label} debe ser un numero entero.`);
        }
        const parsed = Number(normalized);
        if (!Number.isSafeInteger(parsed)) {
            throw new common_1.BadRequestException(`El campo ${label} no es valido.`);
        }
        if (typeof (options === null || options === void 0 ? void 0 : options.min) === 'number' && parsed < options.min) {
            throw new common_1.BadRequestException(`El campo ${label} debe ser mayor o igual a ${options.min}.`);
        }
        if (typeof (options === null || options === void 0 ? void 0 : options.max) === 'number' && parsed > options.max) {
            throw new common_1.BadRequestException(`El campo ${label} debe ser menor o igual a ${options.max}.`);
        }
        return parsed;
    }
    async resolveUsuarioResponsableCedula(value) {
        const normalized = String(value !== null && value !== void 0 ? value : '').trim();
        if (!normalized)
            return null;
        if (!/^\d+$/.test(normalized)) {
            throw new common_1.BadRequestException('La cedula del usuario responsable no es valida.');
        }
        const hasUsuario = await this.tableExists('usuario');
        if (!hasUsuario) {
            throw new common_1.BadRequestException('No fue posible validar el usuario responsable.');
        }
        const [row] = await this.dataSource.query(`
        SELECT usu_cedula AS cedula
        FROM usuario
        WHERE usu_cedula = ?
        LIMIT 1
      `, [Number(normalized)]);
        if (!(row === null || row === void 0 ? void 0 : row.cedula)) {
            throw new common_1.NotFoundException('El usuario responsable no existe.');
        }
        return Number(row.cedula);
    }
    async resolveNextProjectScopedId(tableName, idColumn, projectColumn, projectId) {
        const tableRef = this.wrapIdentifier(tableName);
        const idColumnRef = this.wrapIdentifier(idColumn);
        const projectColumnRef = this.wrapIdentifier(projectColumn);
        const [row] = await this.dataSource.query(`
        SELECT COALESCE(MAX(${idColumnRef}), 0) + 1 AS nextId
        FROM ${tableRef}
        WHERE ${projectColumnRef} = ?
      `, [projectId]);
        return Number((row === null || row === void 0 ? void 0 : row.nextId) || 1);
    }
    async findProyectoContext(id) {
        await this.ensureLegacyAdminViews();
        const proyectoTable = await this.resolveProyectoTable();
        if (!proyectoTable) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        const tableRef = this.wrapIdentifier(proyectoTable);
        const hasFichaProyecto = await this.tableExists('ficha_proyecto');
        const hasFichaColumn = await this.columnExists(proyectoTable, 'fic_numero_FK');
        let joinFichaProyecto = '';
        let fichaSelect = 'NULL AS fichaNumero';
        if (hasFichaProyecto) {
            joinFichaProyecto = 'LEFT JOIN ficha_proyecto fp ON fp.pro_ID_FK = p.pro_ID';
            fichaSelect = hasFichaColumn
                ? 'COALESCE(fp.fic_numero_FK, p.fic_numero_FK) AS fichaNumero'
                : 'fp.fic_numero_FK AS fichaNumero';
        }
        else if (hasFichaColumn) {
            fichaSelect = 'p.fic_numero_FK AS fichaNumero';
        }
        const [proyecto] = await this.dataSource.query(`
        SELECT
          p.pro_ID AS proId,
          p.pro_nombre AS proNombre,
          ${fichaSelect}
        FROM ${tableRef} p
        ${joinFichaProyecto}
        WHERE p.pro_ID = ?
        LIMIT 1
      `, [id]);
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        return {
            proyectoTable,
            tableRef,
            proyecto,
        };
    }
    async findProyectoAprendices(id) {
        await this.ensureLegacyAdminViews();
        const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
        const hasUsuario = await this.tableExists('usuario');
        const hasDetalleParametro = await this.tableExists('detalle_parametro');
        const hasUsuarioFicha = await this.tableExists('usuario_ficha');
        const rolColumn = await this.resolveUsuProDetParRoleColumn();
        const rolColumnRef = rolColumn ? `up.${this.wrapIdentifier(rolColumn)}` : 'NULL';
        if (!hasUsuProDetPar || !hasUsuario) {
            return [];
        }
        const joinDetalleParametro = hasDetalleParametro && rolColumn
            ? `LEFT JOIN detalle_parametro dp ON dp.det_par_ID = ${rolColumnRef}`
            : '';
        const rolSelect = hasDetalleParametro && rolColumn
            ? 'dp.det_par_descripcion AS rolScrum,'
            : 'NULL AS rolScrum,';
        const joinUsuarioFicha = hasUsuarioFicha
            ? 'LEFT JOIN usuario_ficha uf ON uf.usu_cedula_FK = u.usu_cedula'
            : '';
        const fichaSelect = hasUsuarioFicha
            ? 'uf.fic_numero_FK AS fichaNumero,'
            : 'NULL AS fichaNumero,';
        return await this.dataSource.query(`
        SELECT
          u.usu_cedula AS cedula,
          u.usu_tipodedocumento AS tipoDocumento,
          u.usu_nombres AS nombres,
          u.usu_apellidos AS apellidos,
          u.usu_correo AS correo,
          u.usu_telefono AS telefono,
          u.usu_sexo AS sexo,
          u.usu_estado AS estado,
          ${fichaSelect}
          ${rolColumnRef} AS detParId,
          ${rolSelect}
          up.pro_ID AS proId
        FROM usu_pro_det_par up
        INNER JOIN usuario u
          ON u.usu_cedula = up.usu_cedula
         AND u.rol_sis_ID_FK = 1
        ${joinDetalleParametro}
        ${joinUsuarioFicha}
        WHERE up.pro_ID = ?
        ORDER BY u.usu_apellidos ASC, u.usu_nombres ASC
      `, [id]);
    }
    async findFichaAprendicesForProject(id, fichaNumero) {
        await this.ensureLegacyAdminViews();
        const hasUsuario = await this.tableExists('usuario');
        const hasUsuarioFicha = await this.tableExists('usuario_ficha');
        const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
        const rolColumn = await this.resolveUsuProDetParRoleColumn();
        const rolColumnRef = rolColumn ? this.wrapIdentifier(rolColumn) : null;
        if (!hasUsuario || !hasUsuarioFicha) {
            return [];
        }
        const { tableRef } = await this.findProyectoContext(id);
        const assignmentJoin = hasUsuProDetPar && rolColumnRef
            ? `
        LEFT JOIN usu_pro_det_par current_up
          ON current_up.usu_cedula = u.usu_cedula
         AND current_up.pro_ID = ?
        LEFT JOIN (
          SELECT
            up.usu_cedula,
            MIN(up.pro_ID) AS otroProyectoId,
            MIN(up.${rolColumnRef}) AS otroDetParId
          FROM usu_pro_det_par up
          WHERE up.pro_ID <> ?
          GROUP BY up.usu_cedula
        ) other_up
          ON other_up.usu_cedula = u.usu_cedula
        LEFT JOIN ${tableRef} other_p
          ON other_p.pro_ID = other_up.otroProyectoId
        LEFT JOIN detalle_parametro current_dp
          ON current_dp.det_par_ID = current_up.${rolColumnRef}
        LEFT JOIN detalle_parametro other_dp
          ON other_dp.det_par_ID = other_up.otroDetParId
      `
            : `
        LEFT JOIN (
          SELECT NULL AS usu_cedula, NULL AS pro_ID, NULL AS det_par_ID_
        ) current_up
          ON 1 = 0
        LEFT JOIN (
          SELECT NULL AS usu_cedula, NULL AS otroProyectoId, NULL AS otroDetParId
        ) other_up
          ON 1 = 0
        LEFT JOIN ${tableRef} other_p
          ON 1 = 0
        LEFT JOIN detalle_parametro current_dp
          ON 1 = 0
        LEFT JOIN detalle_parametro other_dp
          ON 1 = 0
      `;
        const rows = await this.dataSource.query(`
        SELECT DISTINCT
          u.usu_cedula AS cedula,
          u.usu_tipodedocumento AS tipoDocumento,
          u.usu_nombres AS nombres,
          u.usu_apellidos AS apellidos,
          u.usu_correo AS correo,
          u.usu_telefono AS telefono,
          u.usu_sexo AS sexo,
          u.usu_estado AS estado,
          uf.fic_numero_FK AS fichaNumero,
          CASE
            WHEN current_up.pro_ID IS NULL THEN 0
            ELSE 1
          END AS asignadoProyectoActual,
          ${rolColumnRef ? `current_up.${rolColumnRef}` : 'NULL'} AS detParIdActual,
          current_dp.det_par_descripcion AS rolScrumActual,
          other_up.otroProyectoId AS otroProyectoId,
          other_p.pro_nombre AS otroProyectoNombre,
          other_dp.det_par_descripcion AS otroRolScrum
        FROM usuario_ficha uf
        INNER JOIN usuario u
          ON u.usu_cedula = uf.usu_cedula_FK
         AND u.rol_sis_ID_FK = 1
        ${assignmentJoin}
        WHERE uf.fic_numero_FK = ?
        ORDER BY u.usu_apellidos ASC, u.usu_nombres ASC
      `, hasUsuProDetPar && rolColumnRef ? [id, id, fichaNumero] : [fichaNumero]);
        return Array.isArray(rows) ? rows : [];
    }
    async getAprendizProyectoAssignment(id, cedula) {
        const rolColumn = await this.resolveUsuProDetParRoleColumn();
        const rolColumnRef = rolColumn ? this.wrapIdentifier(rolColumn) : null;
        const rows = await this.dataSource.query(`
        SELECT
          usu_cedula AS cedula,
          ${rolColumnRef ? rolColumnRef : 'NULL'} AS detParId,
          pro_ID AS proId
        FROM usu_pro_det_par
        WHERE pro_ID = ?
          AND usu_cedula = ?
      `, [id, Number(cedula)]);
        return Array.isArray(rows) ? rows : [];
    }
    normalizeCedulasList(values) {
        const seen = new Set();
        return (values || [])
            .map((value) => String(value !== null && value !== void 0 ? value : '').trim())
            .filter((value) => {
            if (!value || seen.has(value))
                return false;
            seen.add(value);
            return true;
        });
    }
    normalizeTextFieldInput(value, maxLength, label) {
        const normalized = String(value !== null && value !== void 0 ? value : '').trim();
        if (!normalized) {
            return null;
        }
        if (normalized.length > maxLength) {
            throw new common_1.BadRequestException(`El campo ${label} supera el maximo de ${maxLength} caracteres.`);
        }
        return normalized;
    }
    async findHistoriasUsuarioByProyecto(id) {
        const hasHistorias = await this.tableExists('historia_usuario');
        if (!hasHistorias)
            return [];
        const hasCriterios = await this.tableExists('criterios_aceptacion');
        const hasUsuario = await this.tableExists('usuario');
        const historiaEstadoColumn = await this.resolveHistoriaEstadoColumn();
        const hasHistoriaResponsable = await this.columnExists('historia_usuario', 'usu_cedula_FK');
        const criteriaHistoriaColumn = await this.resolveCriteriaHistoriaColumn();
        const criteriaProjectHistoryColumn = await this.resolveCriteriaProjectColumn();
        const joinResponsables = hasHistoriaResponsable && hasUsuario
            ? `
          LEFT JOIN usuario u
            ON u.usu_cedula = hu.usu_cedula_FK
        `
            : hasCriterios &&
                hasUsuario &&
                criteriaHistoriaColumn &&
                criteriaProjectHistoryColumn
                ? `
          LEFT JOIN criterios_aceptacion ca
            ON ca.${this.wrapIdentifier(criteriaHistoriaColumn)} = hu.his_ID
           AND ca.${this.wrapIdentifier(criteriaProjectHistoryColumn)} = hu.pro_ID_FK
          LEFT JOIN usuario u
            ON u.usu_cedula = ca.usu_cedula_FK
        `
                : '';
        const responsablesSelect = hasHistoriaResponsable && hasUsuario
            ? `
          NULLIF(
            TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))),
            ''
          ) AS responsable
        `
            : hasCriterios &&
                hasUsuario &&
                criteriaHistoriaColumn &&
                criteriaProjectHistoryColumn
                ? `
          NULLIF(
            GROUP_CONCAT(
              DISTINCT NULLIF(
                TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))),
                ''
              )
              ORDER BY u.usu_apellidos ASC, u.usu_nombres ASC
              SEPARATOR ', '
            ),
            ''
          ) AS responsable
        `
                : 'NULL AS responsable';
        const responsableCedulaSelect = hasHistoriaResponsable
            ? 'hu.usu_cedula_FK AS responsableCedula'
            : 'NULL AS responsableCedula';
        const estadoSelect = historiaEstadoColumn
            ? `hu.${this.wrapIdentifier(historiaEstadoColumn)} AS detParIdFk`
            : 'NULL AS detParIdFk';
        const rows = await this.dataSource.query(`
        SELECT
          hu.his_ID AS hisId,
          hu.his_titulo AS titulo,
          hu.his_descripcion AS descripcion,
          hu.his_puntaje AS puntaje,
          hu.his_numero_sprint AS numeroSprint,
          ${estadoSelect},
          ${responsableCedulaSelect},
          ${responsablesSelect}
        FROM historia_usuario hu
        ${joinResponsables}
        WHERE hu.pro_ID_FK = ?
        GROUP BY
          hu.his_ID,
          hu.his_titulo,
          hu.his_descripcion,
          hu.his_puntaje,
          hu.his_numero_sprint,
          ${historiaEstadoColumn ? `hu.${this.wrapIdentifier(historiaEstadoColumn)}` : 'NULL'},
          ${hasHistoriaResponsable ? 'hu.usu_cedula_FK' : 'NULL'}
        ORDER BY hu.his_ID ASC
      `, [id]);
        return Array.isArray(rows) ? rows : [];
    }
    async findCriteriosAceptacionByProyecto(id) {
        const hasCriterios = await this.tableExists('criterios_aceptacion');
        if (!hasCriterios)
            return [];
        const hasUsuario = await this.tableExists('usuario');
        const hasHistorias = await this.tableExists('historia_usuario');
        const criteriaProjectColumn = await this.resolveCriteriaProjectColumn();
        const criteriaHistoriaColumn = await this.resolveCriteriaHistoriaColumn();
        if (!criteriaProjectColumn) {
            return [];
        }
        const joinUsuario = hasUsuario
            ? `
        LEFT JOIN usuario u
          ON u.usu_cedula = ca.usu_cedula_FK
      `
            : '';
        const joinHistoria = hasHistorias && criteriaHistoriaColumn
            ? `
        LEFT JOIN historia_usuario hu
          ON hu.his_ID = ca.${this.wrapIdentifier(criteriaHistoriaColumn)}
         AND hu.pro_ID_FK = ca.${this.wrapIdentifier(criteriaProjectColumn)}
      `
            : '';
        const responsableSelect = hasUsuario
            ? `
        NULLIF(
          TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))),
          ''
        ) AS responsable
      `
            : 'NULL AS responsable';
        const rows = await this.dataSource.query(`
        SELECT
          ca.cri_ID AS criId,
          ca.cri_tiempo AS tiempo,
          ca.cri_descripcion AS descripcion,
          ${criteriaHistoriaColumn
            ? `ca.${this.wrapIdentifier(criteriaHistoriaColumn)} AS hisId`
            : 'NULL AS hisId'},
          ${joinHistoria ? 'hu.his_titulo AS historiaTitulo' : 'NULL AS historiaTitulo'},
          ${await this.columnExists('criterios_aceptacion', 'estado_FK')
            ? 'ca.estado_FK AS estadoFk'
            : 'NULL AS estadoFk'},
          ${await this.columnExists('criterios_aceptacion', 'usu_cedula_FK')
            ? 'ca.usu_cedula_FK AS responsableCedula'
            : 'NULL AS responsableCedula'},
          ${responsableSelect}
        FROM criterios_aceptacion ca
        ${joinUsuario}
        ${joinHistoria}
        WHERE ca.${criteriaProjectColumn} = ?
        ORDER BY ca.cri_ID ASC
      `, [id]);
        return Array.isArray(rows) ? rows : [];
    }
    async findSugerenciasByProyecto(id) {
        const hasObservaciones = await this.tableExists('observaciones');
        if (!hasObservaciones)
            return [];
        const hasUsuario = await this.tableExists('usuario');
        const observacionEstadoColumn = await this.resolveObservacionEstadoColumn();
        const joinUsuario = hasUsuario
            ? `
        LEFT JOIN usuario u
          ON u.usu_cedula = obs.usu_cedula_FK
      `
            : '';
        const responsableSelect = hasUsuario
            ? `
        NULLIF(
          TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))),
          ''
        ) AS responsable
      `
            : 'NULL AS responsable';
        const rows = await this.dataSource.query(`
        SELECT
          obs.obs_ID AS obsId,
          CONCAT('Sugerencia #', obs.obs_ID) AS titulo,
          obs.obs_descripcion AS descripcion,
          obs.obs_fecha AS fecha,
          obs.usu_cedula_FK AS responsableCedula,
          ${observacionEstadoColumn
            ? `obs.${this.wrapIdentifier(observacionEstadoColumn)} AS detParIdFk`
            : 'NULL AS detParIdFk'},
          ${responsableSelect}
        FROM observaciones obs
        ${joinUsuario}
        WHERE obs.pro_ID_FK = ?
        ORDER BY obs.obs_fecha DESC, obs.obs_ID DESC
      `, [id]);
        return Array.isArray(rows) ? rows : [];
    }
    async findAll() {
        await this.ensureLegacyAdminViews();
        const proyectoTable = await this.resolveProyectoTable();
        if (!proyectoTable)
            return [];
        const tableRef = this.wrapIdentifier(proyectoTable);
        const hasFichaProyecto = await this.tableExists('ficha_proyecto');
        const hasFichaColumn = await this.columnExists(proyectoTable, 'fic_numero_FK');
        let joinFichaProyecto = '';
        let fichaSelect = 'NULL AS fichaNumero';
        if (hasFichaProyecto) {
            joinFichaProyecto =
                'LEFT JOIN ficha_proyecto fp ON fp.pro_ID_FK = p.pro_ID';
            fichaSelect = hasFichaColumn
                ? 'COALESCE(fp.fic_numero_FK, p.fic_numero_FK) AS fichaNumero'
                : 'fp.fic_numero_FK AS fichaNumero';
        }
        else if (hasFichaColumn) {
            fichaSelect = 'p.fic_numero_FK AS fichaNumero';
        }
        return await this.dataSource.query(`
      SELECT
        p.pro_ID AS proId,
        p.pro_codigo AS proCodigo,
        p.pro_nombre AS proNombre,
        p.pro_descripcion AS proDescription,
        p.pro_objetivo_general AS proObjetivoGeneral,
        p.pro_fecha_inicio AS proFechaInicio,
        p.pro_fecha_fin AS proFechaFin,
        p.det_par_ID_FK AS detParIdFk,
        ${fichaSelect}
      FROM ${tableRef} p
      ${joinFichaProyecto}
      ORDER BY p.pro_ID DESC
      `);
    }
    async findOne(id) {
        await this.ensureLegacyAdminViews();
        const proyectoTable = await this.resolveProyectoTable();
        if (!proyectoTable) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        const tableRef = this.wrapIdentifier(proyectoTable);
        const hasFichaProyecto = await this.tableExists('ficha_proyecto');
        const hasFichaColumn = await this.columnExists(proyectoTable, 'fic_numero_FK');
        let joinFichaProyecto = '';
        let fichaSelect = 'NULL AS fichaNumero';
        if (hasFichaProyecto) {
            joinFichaProyecto =
                'LEFT JOIN ficha_proyecto fp ON fp.pro_ID_FK = p.pro_ID';
            fichaSelect = hasFichaColumn
                ? 'COALESCE(fp.fic_numero_FK, p.fic_numero_FK) AS fichaNumero'
                : 'fp.fic_numero_FK AS fichaNumero';
        }
        else if (hasFichaColumn) {
            fichaSelect = 'p.fic_numero_FK AS fichaNumero';
        }
        const result = await this.dataSource.query(`
      SELECT
        p.pro_ID AS proId,
        p.pro_codigo AS proCodigo,
        p.pro_nombre AS proNombre,
        p.pro_descripcion AS proDescription,
        p.pro_objetivo_general AS proObjetivoGeneral,
        p.pro_fecha_inicio AS proFechaInicio,
        p.pro_fecha_fin AS proFechaFin,
        p.det_par_ID_FK AS detParIdFk,
        ${fichaSelect}
      FROM ${tableRef} p
      ${joinFichaProyecto}
      WHERE p.pro_ID = ?
      LIMIT 1
      `, [id]);
        const proyecto = Array.isArray(result) && result.length > 0 ? result[0] : null;
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        return proyecto;
    }
    async findAdminDetalle(id) {
        await this.ensureLegacyAdminViews();
        const proyectoTable = await this.resolveProyectoTable();
        if (!proyectoTable) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        const tableRef = this.wrapIdentifier(proyectoTable);
        const hasFichaProyecto = await this.tableExists('ficha_proyecto');
        const hasFichaColumn = await this.columnExists(proyectoTable, 'fic_numero_FK');
        const hasDetalleParametro = await this.tableExists('detalle_parametro');
        const hasFichas = await this.tableExists('fichas');
        const fichaNombreColumn = await this.resolveFichaNombreColumn();
        const fichaAreaColumnSelect = fichaNombreColumn
            ? `f.${fichaNombreColumn}`
            : 'NULL';
        let joinFichaProyecto = '';
        let joinFichas = '';
        let fichaSelect = `NULL AS fichaNumero,
           NULL AS fichaPrograma,
           NULL AS fichaArea,
           NULL AS fichaEstado`;
        if (hasFichas && (hasFichaProyecto || hasFichaColumn)) {
            if (hasFichaProyecto) {
                joinFichaProyecto =
                    'LEFT JOIN ficha_proyecto fp ON fp.pro_ID_FK = p.pro_ID';
                const fichaNumeroExpr = hasFichaColumn
                    ? 'COALESCE(fp.fic_numero_FK, p.fic_numero_FK)'
                    : 'fp.fic_numero_FK';
                joinFichas = `LEFT JOIN fichas f ON f.fic_numero = ${fichaNumeroExpr}`;
                fichaSelect = `${fichaNumeroExpr} AS fichaNumero,
           f.fic_programa AS fichaPrograma,
           ${fichaAreaColumnSelect} AS fichaArea,
           f.fic_estado AS fichaEstado`;
            }
            else {
                joinFichas = 'LEFT JOIN fichas f ON f.fic_numero = p.fic_numero_FK';
                fichaSelect = `p.fic_numero_FK AS fichaNumero,
           f.fic_programa AS fichaPrograma,
           ${fichaAreaColumnSelect} AS fichaArea,
           f.fic_estado AS fichaEstado`;
            }
        }
        const estadoSelect = hasDetalleParametro
            ? 'dp.det_par_descripcion AS estadoNombre'
            : 'NULL AS estadoNombre';
        const joinDetalleParametro = hasDetalleParametro
            ? 'LEFT JOIN detalle_parametro dp ON dp.det_par_ID = p.det_par_ID_FK'
            : '';
        const [proyecto] = await this.dataSource.query(`
        SELECT
          p.pro_ID AS proId,
          p.pro_codigo AS proCodigo,
          p.pro_nombre AS proNombre,
          p.pro_descripcion AS proDescription,
          p.pro_objetivo_general AS proObjetivoGeneral,
          p.pro_objetivos_especificos AS proObjetivosEspecificos,
          p.pro_justificacion AS proJustificacion,
          p.pro_fecha_inicio AS proFechaInicio,
          p.pro_fecha_fin AS proFechaFin,
          p.det_par_ID_FK AS detParIdFk,
          ${estadoSelect},
          ${fichaSelect}
        FROM ${tableRef} p
        ${joinDetalleParametro}
        ${joinFichaProyecto}
        ${joinFichas}
        WHERE p.pro_ID = ?
        LIMIT 1
      `, [id]);
        if (!proyecto) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
        const hasUsuario = await this.tableExists('usuario');
        const hasUsuarioFicha = await this.tableExists('usuario_ficha');
        let aprendices = [];
        if (hasUsuProDetPar && hasUsuario) {
            const fichaNombreColumnForAprendiz = fichaNombreColumn;
            const fichaAreaSelect = fichaNombreColumnForAprendiz
                ? `f.${fichaNombreColumnForAprendiz}`
                : 'NULL';
            const joinUsuarioFicha = hasUsuarioFicha
                ? 'LEFT JOIN usuario_ficha uf ON uf.usu_cedula_FK = u.usu_cedula'
                : '';
            const joinFichaAprendiz = hasUsuarioFicha && hasFichas
                ? 'LEFT JOIN fichas f ON f.fic_numero = uf.fic_numero_FK'
                : '';
            const joinRolScrum = hasDetalleParametro
                ? 'LEFT JOIN detalle_parametro dp_rol ON dp_rol.det_par_ID = up.det_par_ID_FK'
                : '';
            const rolScrumSelect = hasDetalleParametro
                ? `up.det_par_ID_FK AS detParId,
             dp_rol.det_par_descripcion AS rolScrum`
                : `NULL AS detParId,
             NULL AS rolScrum`;
            aprendices = await this.dataSource.query(`
          SELECT
            u.usu_cedula AS cedula,
            u.usu_tipodedocumento AS tipoDocumento,
            u.usu_nombres AS nombres,
            u.usu_apellidos AS apellidos,
             u.usu_correo AS correo,
             u.usu_telefono AS telefono,
             u.usu_sexo AS sexo,
             u.usu_estado AS estado,
             ${rolScrumSelect},
             uf.fic_numero_FK AS fichaNumero,
             f.fic_programa AS fichaPrograma,
             ${fichaAreaSelect} AS fichaArea
           FROM usu_pro_det_par up
           INNER JOIN usuario u
             ON u.usu_cedula = up.usu_cedula
            AND u.rol_sis_ID_FK = 1
           ${joinRolScrum}
           ${joinUsuarioFicha}
           ${joinFichaAprendiz}
           WHERE up.pro_ID = ?
           ORDER BY u.usu_apellidos ASC, u.usu_nombres ASC
         `, [id]);
        }
        const [historiasUsuario, criteriosAceptacion, sugerencias] = await Promise.all([
            this.findHistoriasUsuarioByProyecto(id),
            this.findCriteriosAceptacionByProyecto(id),
            this.findSugerenciasByProyecto(id),
        ]);
        return {
            proyecto,
            aprendices,
            historiasUsuario,
            criteriosAceptacion,
            sugerencias,
        };
    }
    async updateAdminDetalle(id, payload) {
        await this.ensureLegacyAdminViews();
        const projectContext = await this.findProyectoContext(id);
        const fieldConfig = {
            proDescription: {
                column: 'pro_descripcion',
                label: 'Descripcion',
                maxLength: 200,
            },
            proObjetivoGeneral: {
                column: 'pro_objetivo_general',
                label: 'Objetivo general',
                maxLength: 500,
            },
            proObjetivosEspecificos: {
                column: 'pro_objetivos_especificos',
                label: 'Objetivos especificos',
                maxLength: 500,
            },
            proJustificacion: {
                column: 'pro_justificacion',
                label: 'Justificacion',
                maxLength: 500,
            },
        };
        const updates = [];
        const values = [];
        Object.keys(fieldConfig).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(payload, key)) {
                return;
            }
            const config = fieldConfig[key];
            updates.push(`${config.column} = ?`);
            values.push(this.normalizeTextFieldInput(payload[key], config.maxLength, config.label));
        });
        if (updates.length === 0) {
            throw new common_1.BadRequestException('Debes enviar al menos un campo editable del proyecto.');
        }
        await this.dataSource.query(`
        UPDATE ${projectContext.tableRef}
        SET ${updates.join(', ')}
        WHERE pro_ID = ?
      `, [...values, id]);
        return await this.findAdminDetalle(id);
    }
    async findAdminAprendicesEditor(id) {
        var _a;
        await this.ensureLegacyAdminViews();
        const { proyecto } = await this.findProyectoContext(id);
        const rolesScrum = await this.resolveRolesScrum();
        const fichaNumero = String((_a = proyecto === null || proyecto === void 0 ? void 0 : proyecto.fichaNumero) !== null && _a !== void 0 ? _a : '').trim();
        const [aprendicesProyecto, aprendicesFicha] = await Promise.all([
            this.findProyectoAprendices(id),
            fichaNumero ? this.findFichaAprendicesForProject(id, fichaNumero) : [],
        ]);
        return {
            proyecto: {
                proId: Number((proyecto === null || proyecto === void 0 ? void 0 : proyecto.proId) || id),
                proNombre: (proyecto === null || proyecto === void 0 ? void 0 : proyecto.proNombre) || null,
                fichaNumero: fichaNumero || null,
            },
            aprendicesProyecto,
            aprendicesFicha,
            rolesScrum,
        };
    }
    async addAprendizToProyecto(id, cedula, detParId) {
        var _a, _b;
        await this.ensureLegacyAdminViews();
        const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
        const hasUsuario = await this.tableExists('usuario');
        const hasUsuarioFicha = await this.tableExists('usuario_ficha');
        const rolColumn = await this.resolveUsuProDetParRoleColumn();
        const rolColumnRef = rolColumn ? this.wrapIdentifier(rolColumn) : null;
        if (!hasUsuProDetPar || !hasUsuario || !hasUsuarioFicha || !rolColumnRef) {
            throw new common_1.BadRequestException('No fue posible editar los aprendices de este proyecto.');
        }
        const { proyecto } = await this.findProyectoContext(id);
        const fichaNumero = String((_a = proyecto === null || proyecto === void 0 ? void 0 : proyecto.fichaNumero) !== null && _a !== void 0 ? _a : '').trim();
        if (!fichaNumero) {
            throw new common_1.BadRequestException('Este proyecto no tiene una ficha asociada para agregar aprendices.');
        }
        const aprendizRows = await this.dataSource.query(`
        SELECT
          u.usu_cedula AS cedula,
          uf.fic_numero_FK AS fichaNumero
        FROM usuario u
        INNER JOIN usuario_ficha uf
          ON uf.usu_cedula_FK = u.usu_cedula
        WHERE u.usu_cedula = ?
          AND u.rol_sis_ID_FK = 1
        LIMIT 1
      `, [Number(cedula)]);
        const aprendiz = Array.isArray(aprendizRows) ? aprendizRows[0] : null;
        if (!aprendiz) {
            throw new common_1.NotFoundException('El aprendiz no existe.');
        }
        if (String((_b = aprendiz.fichaNumero) !== null && _b !== void 0 ? _b : '').trim() !== fichaNumero) {
            throw new common_1.BadRequestException('El aprendiz no pertenece a la ficha asociada a este proyecto.');
        }
        const currentAssignment = await this.getAprendizProyectoAssignment(id, cedula);
        if (currentAssignment.length > 0) {
            throw new common_1.ConflictException('El aprendiz ya esta asignado a este proyecto.');
        }
        const otherAssignments = await this.dataSource.query(`
        SELECT
          up.pro_ID AS proId,
          p.pro_nombre AS proNombre
        FROM usu_pro_det_par up
        LEFT JOIN ${this.wrapIdentifier((await this.findProyectoContext(id)).proyectoTable)} p
          ON p.pro_ID = up.pro_ID
        WHERE up.usu_cedula = ?
          AND up.pro_ID <> ?
        LIMIT 1
      `, [Number(cedula), id]);
        const otherProject = Array.isArray(otherAssignments) ? otherAssignments[0] : null;
        if (otherProject) {
            const otherProjectName = String(otherProject.proNombre || '').trim();
            throw new common_1.ConflictException(otherProjectName
                ? `El aprendiz ya esta asignado a otro proyecto: ${otherProjectName}.`
                : 'El aprendiz ya esta asignado a otro proyecto.');
        }
        const rolesScrum = await this.resolveRolesScrum();
        const roleId = detParId || (await this.resolveDefaultRolScrumId());
        if (!roleId) {
            throw new common_1.BadRequestException('No se encontro un rol Scrum disponible para asignar.');
        }
        const validRole = rolesScrum.some((item) => Number(item.detParId) === Number(roleId));
        if (!validRole) {
            throw new common_1.BadRequestException('El rol Scrum seleccionado no es valido.');
        }
        await this.dataSource.query(`
        INSERT INTO usu_pro_det_par (usu_cedula, ${rolColumnRef}, pro_ID)
        VALUES (?, ?, ?)
      `, [Number(cedula), Number(roleId), id]);
        return {
            success: true,
            message: 'Aprendiz agregado correctamente al proyecto.',
        };
    }
    async saveProyectoAprendices(id, payload) {
        var _a, _b, _c;
        await this.ensureLegacyAdminViews();
        const addCedulas = this.normalizeCedulasList(payload === null || payload === void 0 ? void 0 : payload.addCedulas);
        const removeCedulas = this.normalizeCedulasList(payload === null || payload === void 0 ? void 0 : payload.removeCedulas);
        if (addCedulas.length === 0 && removeCedulas.length === 0) {
            return {
                success: true,
                added: [],
                removed: [],
            };
        }
        const overlap = addCedulas.find((cedula) => removeCedulas.includes(cedula));
        if (overlap) {
            throw new common_1.BadRequestException('Un aprendiz no puede agregarse y eliminarse al mismo tiempo.');
        }
        const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
        const hasUsuario = await this.tableExists('usuario');
        const hasUsuarioFicha = await this.tableExists('usuario_ficha');
        const rolColumn = await this.resolveUsuProDetParRoleColumn();
        const rolColumnRef = rolColumn ? this.wrapIdentifier(rolColumn) : null;
        if (!hasUsuProDetPar || !hasUsuario || !hasUsuarioFicha || !rolColumnRef) {
            throw new common_1.BadRequestException('No fue posible guardar los cambios de aprendices en este proyecto.');
        }
        const projectContext = await this.findProyectoContext(id);
        const fichaNumero = String((_b = (_a = projectContext.proyecto) === null || _a === void 0 ? void 0 : _a.fichaNumero) !== null && _b !== void 0 ? _b : '').trim();
        if (!fichaNumero) {
            throw new common_1.BadRequestException('Este proyecto no tiene una ficha asociada para editar aprendices.');
        }
        const defaultRolScrumId = await this.resolveDefaultRolScrumId();
        if (!defaultRolScrumId && addCedulas.length > 0) {
            throw new common_1.BadRequestException('No se encontro un rol Scrum disponible para asignar.');
        }
        const added = [];
        const removed = [];
        for (const cedula of removeCedulas) {
            const rows = await this.dataSource.query(`
          SELECT
            u.usu_nombres AS nombres,
            u.usu_apellidos AS apellidos
          FROM usu_pro_det_par up
          INNER JOIN usuario u
            ON u.usu_cedula = up.usu_cedula
          WHERE up.pro_ID = ?
            AND up.usu_cedula = ?
          LIMIT 1
        `, [id, Number(cedula)]);
            const row = Array.isArray(rows) ? rows[0] : null;
            if (!row) {
                throw new common_1.NotFoundException(`El aprendiz con documento ${cedula} no esta asignado a este proyecto.`);
            }
            removed.push(`${String(row.nombres || '').trim()} ${String(row.apellidos || '').trim()}`.trim() ||
                cedula);
        }
        for (const cedula of addCedulas) {
            const aprendizRows = await this.dataSource.query(`
          SELECT
            u.usu_cedula AS cedula,
            u.usu_nombres AS nombres,
            u.usu_apellidos AS apellidos,
            uf.fic_numero_FK AS fichaNumero
          FROM usuario u
          INNER JOIN usuario_ficha uf
            ON uf.usu_cedula_FK = u.usu_cedula
          WHERE u.usu_cedula = ?
            AND u.rol_sis_ID_FK = 1
          LIMIT 1
        `, [Number(cedula)]);
            const aprendiz = Array.isArray(aprendizRows) ? aprendizRows[0] : null;
            if (!aprendiz) {
                throw new common_1.NotFoundException(`El aprendiz con documento ${cedula} no existe.`);
            }
            if (String((_c = aprendiz.fichaNumero) !== null && _c !== void 0 ? _c : '').trim() !== fichaNumero) {
                throw new common_1.BadRequestException(`El aprendiz con documento ${cedula} no pertenece a la ficha de este proyecto.`);
            }
            const currentAssignment = await this.getAprendizProyectoAssignment(id, cedula);
            if (currentAssignment.length > 0) {
                throw new common_1.ConflictException(`El aprendiz con documento ${cedula} ya esta asignado a este proyecto.`);
            }
            const otherAssignments = await this.dataSource.query(`
          SELECT
            up.pro_ID AS proId,
            p.pro_nombre AS proNombre
          FROM usu_pro_det_par up
          LEFT JOIN ${this.wrapIdentifier(projectContext.proyectoTable)} p
            ON p.pro_ID = up.pro_ID
          WHERE up.usu_cedula = ?
            AND up.pro_ID <> ?
          LIMIT 1
        `, [Number(cedula), id]);
            const otherProject = Array.isArray(otherAssignments)
                ? otherAssignments[0]
                : null;
            if (otherProject) {
                const projectName = String(otherProject.proNombre || '').trim();
                throw new common_1.ConflictException(projectName
                    ? `El aprendiz con documento ${cedula} ya esta asignado a otro proyecto: ${projectName}.`
                    : `El aprendiz con documento ${cedula} ya esta asignado a otro proyecto.`);
            }
            added.push(`${String(aprendiz.nombres || '').trim()} ${String(aprendiz.apellidos || '').trim()}`.trim() ||
                cedula);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (const cedula of removeCedulas) {
                await queryRunner.query(`
            DELETE FROM usu_pro_det_par
            WHERE pro_ID = ?
              AND usu_cedula = ?
          `, [id, Number(cedula)]);
            }
            for (const cedula of addCedulas) {
                await queryRunner.query(`
            INSERT INTO usu_pro_det_par (usu_cedula, ${rolColumnRef}, pro_ID)
            VALUES (?, ?, ?)
          `, [Number(cedula), Number(defaultRolScrumId), id]);
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        return {
            success: true,
            added,
            removed,
        };
    }
    async updateAprendizProyectoRole(id, cedula, detParId) {
        await this.ensureLegacyAdminViews();
        const rolColumn = await this.resolveUsuProDetParRoleColumn();
        const rolColumnRef = rolColumn ? this.wrapIdentifier(rolColumn) : null;
        const assignments = await this.getAprendizProyectoAssignment(id, cedula);
        if (!rolColumnRef || assignments.length === 0) {
            throw new common_1.NotFoundException('El aprendiz no esta asignado a este proyecto.');
        }
        const rolesScrum = await this.resolveRolesScrum();
        const validRole = rolesScrum.some((item) => Number(item.detParId) === Number(detParId));
        if (!validRole) {
            throw new common_1.BadRequestException('El rol Scrum seleccionado no es valido.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.query(`
          DELETE FROM usu_pro_det_par
          WHERE pro_ID = ?
            AND usu_cedula = ?
        `, [id, Number(cedula)]);
            await queryRunner.query(`
          INSERT INTO usu_pro_det_par (usu_cedula, ${rolColumnRef}, pro_ID)
          VALUES (?, ?, ?)
        `, [Number(cedula), Number(detParId), id]);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        return {
            success: true,
            message: 'Rol Scrum actualizado correctamente.',
        };
    }
    async removeAprendizFromProyecto(id, cedula) {
        var _a;
        await this.ensureLegacyAdminViews();
        const result = await this.dataSource.query(`
        DELETE FROM usu_pro_det_par
        WHERE pro_ID = ?
          AND usu_cedula = ?
      `, [id, Number(cedula)]);
        const affectedRows = Number((result === null || result === void 0 ? void 0 : result.affectedRows) || ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.affectedRows) || 0);
        if (affectedRows === 0) {
            throw new common_1.NotFoundException('El aprendiz no esta asignado a este proyecto.');
        }
        return {
            success: true,
            message: 'Aprendiz eliminado correctamente del proyecto.',
        };
    }
    async createHistoriaUsuario(id, payload) {
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const hasHistorias = await this.tableExists('historia_usuario');
        if (!hasHistorias) {
            throw new common_1.BadRequestException('No fue posible crear historias de usuario en este proyecto.');
        }
        const historiaEstadoColumn = await this.resolveHistoriaEstadoColumn();
        const titulo = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.titulo, 255, 'Titulo');
        const descripcion = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.descripcion, 500, 'Descripcion');
        if (!titulo) {
            throw new common_1.BadRequestException('El titulo de la historia es obligatorio.');
        }
        if (!descripcion) {
            throw new common_1.BadRequestException('La descripcion de la historia de usuario es obligatoria.');
        }
        const puntaje = this.normalizeIntegerFieldInput(payload === null || payload === void 0 ? void 0 : payload.puntaje, 'Puntaje', {
            min: 0,
        });
        const numeroSprint = this.normalizeIntegerFieldInput(payload === null || payload === void 0 ? void 0 : payload.numeroSprint, 'Sprint', { min: 0 });
        const responsableCedula = await this.resolveUsuarioResponsableCedula(payload === null || payload === void 0 ? void 0 : payload.actorCedula);
        const defaultEstadoId = await this.resolveDefaultEstadoId();
        const nextHistoriaId = await this.resolveNextProjectScopedId('historia_usuario', 'his_ID', 'pro_ID_FK', id);
        const columns = [
            'his_ID',
            'pro_ID_FK',
            'his_titulo',
            'his_descripcion',
            'his_puntaje',
            'his_numero_sprint',
        ];
        const values = [nextHistoriaId, id, titulo, descripcion, puntaje, numeroSprint];
        const placeholders = ['?', '?', '?', '?', '?', '?'];
        if (historiaEstadoColumn && defaultEstadoId) {
            columns.push(historiaEstadoColumn);
            values.push(defaultEstadoId);
            placeholders.push('?');
        }
        if (responsableCedula && (await this.columnExists('historia_usuario', 'usu_cedula_FK'))) {
            columns.push('usu_cedula_FK');
            values.push(responsableCedula);
            placeholders.push('?');
        }
        await this.dataSource.query(`
        INSERT INTO historia_usuario (${columns
            .map((column) => this.wrapIdentifier(column))
            .join(', ')})
        VALUES (${placeholders.join(', ')})
      `, values);
        return await this.findAdminDetalle(id);
    }
    async updateHistoriaUsuario(id, hisId, payload) {
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const historiaRows = await this.dataSource.query(`
        SELECT 1 AS found
        FROM historia_usuario
        WHERE pro_ID_FK = ?
          AND his_ID = ?
        LIMIT 1
      `, [id, hisId]);
        if (!Array.isArray(historiaRows) || !historiaRows[0]) {
            throw new common_1.NotFoundException(`La historia de usuario ${hisId} no existe en este proyecto.`);
        }
        const updates = [];
        const values = [];
        if (Object.prototype.hasOwnProperty.call(payload, 'titulo')) {
            const titulo = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.titulo, 255, 'Titulo');
            if (!titulo) {
                throw new common_1.BadRequestException('El titulo de la historia es obligatorio.');
            }
            updates.push('his_titulo = ?');
            values.push(titulo);
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'descripcion')) {
            const descripcion = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.descripcion, 500, 'Descripcion');
            if (!descripcion) {
                throw new common_1.BadRequestException('La descripcion de la historia de usuario es obligatoria.');
            }
            updates.push('his_descripcion = ?');
            values.push(descripcion);
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'puntaje')) {
            updates.push('his_puntaje = ?');
            values.push(this.normalizeIntegerFieldInput(payload === null || payload === void 0 ? void 0 : payload.puntaje, 'Puntaje', {
                min: 0,
            }));
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'numeroSprint')) {
            updates.push('his_numero_sprint = ?');
            values.push(this.normalizeIntegerFieldInput(payload === null || payload === void 0 ? void 0 : payload.numeroSprint, 'Sprint', {
                min: 0,
            }));
        }
        if (updates.length === 0) {
            throw new common_1.BadRequestException('Debes enviar al menos un campo editable de la historia de usuario.');
        }
        await this.dataSource.query(`
        UPDATE historia_usuario
        SET ${updates.join(', ')}
        WHERE pro_ID_FK = ?
          AND his_ID = ?
      `, [...values, id, hisId]);
        return await this.findAdminDetalle(id);
    }
    async deleteHistoriaUsuario(id, hisId) {
        var _a;
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const result = await this.dataSource.query(`
        DELETE FROM historia_usuario
        WHERE pro_ID_FK = ?
          AND his_ID = ?
      `, [id, hisId]);
        const affectedRows = Number((result === null || result === void 0 ? void 0 : result.affectedRows) || ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.affectedRows) || 0);
        if (affectedRows === 0) {
            throw new common_1.NotFoundException(`La historia de usuario ${hisId} no existe en este proyecto.`);
        }
        return await this.findAdminDetalle(id);
    }
    async createCriterioAceptacion(id, payload) {
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const hasCriterios = await this.tableExists('criterios_aceptacion');
        if (!hasCriterios) {
            throw new common_1.BadRequestException('No fue posible crear criterios de aceptacion en este proyecto.');
        }
        const criteriaProjectColumn = await this.resolveCriteriaProjectColumn();
        const criteriaHistoriaColumn = await this.resolveCriteriaHistoriaColumn();
        if (!criteriaProjectColumn) {
            throw new common_1.BadRequestException('No fue posible relacionar el criterio de aceptacion con el proyecto.');
        }
        const descripcion = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.descripcion, 500, 'Descripcion');
        const tiempo = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.tiempo, 50, 'Tiempo');
        if (!descripcion) {
            throw new common_1.BadRequestException('La descripcion del criterio de aceptacion es obligatoria.');
        }
        const responsableCedula = await this.resolveUsuarioResponsableCedula(payload === null || payload === void 0 ? void 0 : payload.actorCedula);
        if (!responsableCedula) {
            throw new common_1.BadRequestException('No fue posible identificar al usuario responsable del criterio.');
        }
        const hisId = Object.prototype.hasOwnProperty.call(payload, 'hisId')
            ? this.normalizeIntegerFieldInput(payload === null || payload === void 0 ? void 0 : payload.hisId, 'Historia de usuario', {
                min: 1,
            })
            : null;
        if (hisId) {
            const historiaRows = await this.dataSource.query(`
          SELECT 1 AS found
          FROM historia_usuario
          WHERE pro_ID_FK = ?
            AND his_ID = ?
          LIMIT 1
        `, [id, hisId]);
            if (!Array.isArray(historiaRows) || !historiaRows[0]) {
                throw new common_1.NotFoundException(`La historia de usuario ${hisId} no existe en este proyecto.`);
            }
        }
        const defaultEstadoId = await this.resolveDefaultEstadoId();
        if (!defaultEstadoId) {
            throw new common_1.BadRequestException('No se encontro un estado disponible para crear el criterio.');
        }
        const nextCriterioId = await this.resolveNextProjectScopedId('criterios_aceptacion', 'cri_ID', criteriaProjectColumn, id);
        const columns = [
            'cri_ID',
            criteriaProjectColumn,
            'usu_cedula_FK',
            'estado_FK',
            'cri_tiempo',
            'cri_descripcion',
        ];
        const values = [
            nextCriterioId,
            id,
            responsableCedula,
            defaultEstadoId,
            tiempo,
            descripcion,
        ];
        const placeholders = ['?', '?', '?', '?', '?', '?'];
        if (criteriaHistoriaColumn) {
            columns.push(criteriaHistoriaColumn);
            values.push(hisId);
            placeholders.push('?');
        }
        await this.dataSource.query(`
        INSERT INTO criterios_aceptacion (${columns
            .map((column) => this.wrapIdentifier(column))
            .join(', ')})
        VALUES (${placeholders.join(', ')})
      `, values);
        return await this.findAdminDetalle(id);
    }
    async updateCriterioAceptacion(id, criId, payload) {
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const criteriaProjectColumn = await this.resolveCriteriaProjectColumn();
        const criteriaHistoriaColumn = await this.resolveCriteriaHistoriaColumn();
        if (!criteriaProjectColumn) {
            throw new common_1.BadRequestException('No fue posible identificar el proyecto de este criterio.');
        }
        const criterioRows = await this.dataSource.query(`
        SELECT 1 AS found
        FROM criterios_aceptacion
        WHERE ${this.wrapIdentifier(criteriaProjectColumn)} = ?
          AND cri_ID = ?
        LIMIT 1
      `, [id, criId]);
        if (!Array.isArray(criterioRows) || !criterioRows[0]) {
            throw new common_1.NotFoundException(`El criterio de aceptacion ${criId} no existe en este proyecto.`);
        }
        const updates = [];
        const values = [];
        if (Object.prototype.hasOwnProperty.call(payload, 'descripcion')) {
            const descripcion = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.descripcion, 500, 'Descripcion');
            if (!descripcion) {
                throw new common_1.BadRequestException('La descripcion del criterio de aceptacion es obligatoria.');
            }
            updates.push('cri_descripcion = ?');
            values.push(descripcion);
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'tiempo')) {
            updates.push('cri_tiempo = ?');
            values.push(this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.tiempo, 50, 'Tiempo'));
        }
        if (criteriaHistoriaColumn && Object.prototype.hasOwnProperty.call(payload, 'hisId')) {
            const hisId = this.normalizeIntegerFieldInput(payload === null || payload === void 0 ? void 0 : payload.hisId, 'Historia de usuario', { min: 1 });
            if (hisId) {
                const historiaRows = await this.dataSource.query(`
            SELECT 1 AS found
            FROM historia_usuario
            WHERE pro_ID_FK = ?
              AND his_ID = ?
            LIMIT 1
          `, [id, hisId]);
                if (!Array.isArray(historiaRows) || !historiaRows[0]) {
                    throw new common_1.NotFoundException(`La historia de usuario ${hisId} no existe en este proyecto.`);
                }
            }
            updates.push(`${this.wrapIdentifier(criteriaHistoriaColumn)} = ?`);
            values.push(hisId);
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'actorCedula')) {
            const responsableCedula = await this.resolveUsuarioResponsableCedula(payload === null || payload === void 0 ? void 0 : payload.actorCedula);
            if (!responsableCedula) {
                throw new common_1.BadRequestException('No fue posible identificar al usuario responsable del criterio.');
            }
            updates.push('usu_cedula_FK = ?');
            values.push(responsableCedula);
        }
        if (updates.length === 0) {
            throw new common_1.BadRequestException('Debes enviar al menos un campo editable del criterio de aceptacion.');
        }
        await this.dataSource.query(`
        UPDATE criterios_aceptacion
        SET ${updates.join(', ')}
        WHERE ${this.wrapIdentifier(criteriaProjectColumn)} = ?
          AND cri_ID = ?
      `, [...values, id, criId]);
        return await this.findAdminDetalle(id);
    }
    async deleteCriterioAceptacion(id, criId) {
        var _a;
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const criteriaProjectColumn = await this.resolveCriteriaProjectColumn();
        if (!criteriaProjectColumn) {
            throw new common_1.BadRequestException('No fue posible identificar el proyecto de este criterio.');
        }
        const result = await this.dataSource.query(`
        DELETE FROM criterios_aceptacion
        WHERE ${this.wrapIdentifier(criteriaProjectColumn)} = ?
          AND cri_ID = ?
      `, [id, criId]);
        const affectedRows = Number((result === null || result === void 0 ? void 0 : result.affectedRows) || ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.affectedRows) || 0);
        if (affectedRows === 0) {
            throw new common_1.NotFoundException(`El criterio de aceptacion ${criId} no existe en este proyecto.`);
        }
        return await this.findAdminDetalle(id);
    }
    async createSugerencia(id, payload) {
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const hasObservaciones = await this.tableExists('observaciones');
        if (!hasObservaciones) {
            throw new common_1.BadRequestException('No fue posible crear sugerencias en este proyecto.');
        }
        const descripcion = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.descripcion, 255, 'Descripcion');
        if (!descripcion) {
            throw new common_1.BadRequestException('La descripcion de la sugerencia es obligatoria.');
        }
        const responsableCedula = await this.resolveUsuarioResponsableCedula(payload === null || payload === void 0 ? void 0 : payload.actorCedula);
        const observacionEstadoColumn = await this.resolveObservacionEstadoColumn();
        const defaultEstadoId = await this.resolveDefaultEstadoId();
        const columns = ['obs_fecha', 'obs_descripcion', 'pro_ID_FK'];
        const values = [descripcion, id];
        const placeholders = ['CURDATE()', '?', '?'];
        if (responsableCedula && (await this.columnExists('observaciones', 'usu_cedula_FK'))) {
            columns.push('usu_cedula_FK');
            values.push(responsableCedula);
            placeholders.push('?');
        }
        if (observacionEstadoColumn && defaultEstadoId) {
            columns.push(observacionEstadoColumn);
            values.push(defaultEstadoId);
            placeholders.push('?');
        }
        await this.dataSource.query(`
        INSERT INTO observaciones (${columns
            .map((column) => this.wrapIdentifier(column))
            .join(', ')})
        VALUES (${placeholders.join(', ')})
      `, values);
        return await this.findAdminDetalle(id);
    }
    async updateSugerencia(id, obsId, payload) {
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const sugerenciaRows = await this.dataSource.query(`
        SELECT 1 AS found
        FROM observaciones
        WHERE pro_ID_FK = ?
          AND obs_ID = ?
        LIMIT 1
      `, [id, obsId]);
        if (!Array.isArray(sugerenciaRows) || !sugerenciaRows[0]) {
            throw new common_1.NotFoundException(`La sugerencia ${obsId} no existe en este proyecto.`);
        }
        const updates = [];
        const values = [];
        if (Object.prototype.hasOwnProperty.call(payload, 'descripcion')) {
            const descripcion = this.normalizeTextFieldInput(payload === null || payload === void 0 ? void 0 : payload.descripcion, 255, 'Descripcion');
            if (!descripcion) {
                throw new common_1.BadRequestException('La descripcion de la sugerencia es obligatoria.');
            }
            updates.push('obs_descripcion = ?');
            values.push(descripcion);
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'actorCedula')) {
            const responsableCedula = await this.resolveUsuarioResponsableCedula(payload === null || payload === void 0 ? void 0 : payload.actorCedula);
            updates.push('usu_cedula_FK = ?');
            values.push(responsableCedula);
        }
        if (updates.length === 0) {
            throw new common_1.BadRequestException('Debes enviar al menos un campo editable de la sugerencia.');
        }
        await this.dataSource.query(`
        UPDATE observaciones
        SET ${updates.join(', ')}
        WHERE pro_ID_FK = ?
          AND obs_ID = ?
      `, [...values, id, obsId]);
        return await this.findAdminDetalle(id);
    }
    async deleteSugerencia(id, obsId) {
        var _a;
        await this.ensureLegacyAdminViews();
        await this.findProyectoContext(id);
        const result = await this.dataSource.query(`
        DELETE FROM observaciones
        WHERE pro_ID_FK = ?
          AND obs_ID = ?
      `, [id, obsId]);
        const affectedRows = Number((result === null || result === void 0 ? void 0 : result.affectedRows) || ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.affectedRows) || 0);
        if (affectedRows === 0) {
            throw new common_1.NotFoundException(`La sugerencia ${obsId} no existe en este proyecto.`);
        }
        return await this.findAdminDetalle(id);
    }
};
exports.VerproService = VerproService;
exports.VerproService = VerproService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], VerproService);
//# sourceMappingURL=VerproService.js.map