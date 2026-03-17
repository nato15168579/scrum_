import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class VerproService {
  constructor(private readonly dataSource: DataSource) {}

  private wrapIdentifier(identifier: string) {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  private async tableExists(tableName: string) {
    const [row] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [tableName],
    );

    return Number(row?.total || 0) > 0;
  }

  private async columnExists(tableName: string, columnName: string) {
    const [row] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return Number(row?.total || 0) > 0;
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

  private async resolveFichaNombreColumn() {
    if (await this.columnExists('fichas', 'fic_nombre')) {
      return 'fic_nombre';
    }

    if (await this.columnExists('fichas', 'fic_area')) {
      return 'fic_area';
    }

    return null;
  }

  private async resolveRolesScrum() {
    const hasDetalleParametro = await this.tableExists('detalle_parametro');
    if (!hasDetalleParametro) return [];

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

  private async resolveDefaultRolScrumId() {
    const roles = await this.resolveRolesScrum();

    const scrumTeam = roles.find((item) =>
      String(item?.descripcion || '')
        .trim()
        .toLowerCase()
        .includes('scrum team'),
    );

    if (scrumTeam?.detParId) {
      return Number(scrumTeam.detParId);
    }

    const firstRole = roles[0];
    return firstRole?.detParId ? Number(firstRole.detParId) : null;
  }

  private async findProyectoContext(id: number) {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
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
    } else if (hasFichaColumn) {
      fichaSelect = 'p.fic_numero_FK AS fichaNumero';
    }

    const [proyecto] = await this.dataSource.query(
      `
        SELECT
          p.pro_ID AS proId,
          p.pro_nombre AS proNombre,
          ${fichaSelect}
        FROM ${tableRef} p
        ${joinFichaProyecto}
        WHERE p.pro_ID = ?
        LIMIT 1
      `,
      [id],
    );

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    return {
      proyectoTable,
      tableRef,
      proyecto,
    };
  }

  private async findProyectoAprendices(id: number) {
    const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
    const hasUsuario = await this.tableExists('usuario');
    const hasDetalleParametro = await this.tableExists('detalle_parametro');
    const hasUsuarioFicha = await this.tableExists('usuario_ficha');

    if (!hasUsuProDetPar || !hasUsuario) {
      return [];
    }

    const joinDetalleParametro = hasDetalleParametro
      ? 'LEFT JOIN detalle_parametro dp ON dp.det_par_ID = up.det_par_ID_'
      : '';

    const rolSelect = hasDetalleParametro
      ? 'dp.det_par_descripcion AS rolScrum,'
      : 'NULL AS rolScrum,';

    const joinUsuarioFicha = hasUsuarioFicha
      ? 'LEFT JOIN usuario_ficha uf ON uf.usu_cedula_FK = u.usu_cedula'
      : '';

    const fichaSelect = hasUsuarioFicha
      ? 'uf.fic_numero_FK AS fichaNumero,'
      : 'NULL AS fichaNumero,';

    return await this.dataSource.query(
      `
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
          up.det_par_ID_ AS detParId,
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
      `,
      [id],
    );
  }

  private async findFichaAprendicesForProject(id: number, fichaNumero: string) {
    const hasUsuario = await this.tableExists('usuario');
    const hasUsuarioFicha = await this.tableExists('usuario_ficha');
    const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');

    if (!hasUsuario || !hasUsuarioFicha) {
      return [];
    }

    const { tableRef } = await this.findProyectoContext(id);

    const assignmentJoin = hasUsuProDetPar
      ? `
        LEFT JOIN usu_pro_det_par current_up
          ON current_up.usu_cedula = u.usu_cedula
         AND current_up.pro_ID = ?
        LEFT JOIN (
          SELECT
            up.usu_cedula,
            MIN(up.pro_ID) AS otroProyectoId,
            MIN(up.det_par_ID_) AS otroDetParId
          FROM usu_pro_det_par up
          WHERE up.pro_ID <> ?
          GROUP BY up.usu_cedula
        ) other_up
          ON other_up.usu_cedula = u.usu_cedula
        LEFT JOIN ${tableRef} other_p
          ON other_p.pro_ID = other_up.otroProyectoId
        LEFT JOIN detalle_parametro current_dp
          ON current_dp.det_par_ID = current_up.det_par_ID_
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

    const rows = await this.dataSource.query(
      `
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
          current_up.det_par_ID_ AS detParIdActual,
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
      `,
      hasUsuProDetPar ? [id, id, fichaNumero] : [fichaNumero],
    );

    return Array.isArray(rows) ? rows : [];
  }

  private async getAprendizProyectoAssignment(id: number, cedula: string | number) {
    const rows = await this.dataSource.query(
      `
        SELECT
          usu_cedula AS cedula,
          det_par_ID_ AS detParId,
          pro_ID AS proId
        FROM usu_pro_det_par
        WHERE pro_ID = ?
          AND usu_cedula = ?
      `,
      [id, Number(cedula)],
    );

    return Array.isArray(rows) ? rows : [];
  }

  private normalizeCedulasList(values?: Array<string | number>) {
    const seen = new Set<string>();

    return (values || [])
      .map((value) => String(value ?? '').trim())
      .filter((value) => {
        if (!value || seen.has(value)) return false;
        seen.add(value);
        return true;
      });
  }

  private normalizeTextFieldInput(
    value: unknown,
    maxLength: number,
    label: string,
  ) {
    const normalized = String(value ?? '').trim();

    if (!normalized) {
      return null;
    }

    if (normalized.length > maxLength) {
      throw new BadRequestException(
        `El campo ${label} supera el maximo de ${maxLength} caracteres.`,
      );
    }

    return normalized;
  }

  private async findHistoriasUsuarioByProyecto(id: number) {
    const hasHistorias = await this.tableExists('historia_usuario');
    if (!hasHistorias) return [];

    const hasCriterios = await this.tableExists('criterios_aceptacion');
    const hasUsuario = await this.tableExists('usuario');
    const hasHistoriaResponsable = await this.columnExists(
      'historia_usuario',
      'usu_cedula_FK',
    );
    const hasCriteriaHistoriaId = await this.columnExists(
      'criterios_aceptacion',
      'his_ID_FK',
    );
    const hasCriteriaProjectHistoryId = await this.columnExists(
      'criterios_aceptacion',
      'pro_ID_his_FK',
    );

    const joinResponsables =
      hasHistoriaResponsable && hasUsuario
        ? `
          LEFT JOIN usuario u
            ON u.usu_cedula = hu.usu_cedula_FK
        `
        : hasCriterios &&
            hasUsuario &&
            hasCriteriaHistoriaId &&
            hasCriteriaProjectHistoryId
        ? `
          LEFT JOIN criterios_aceptacion ca
            ON ca.his_ID_FK = hu.his_ID
           AND ca.pro_ID_his_FK = hu.pro_ID_FK
          LEFT JOIN usuario u
            ON u.usu_cedula = ca.usu_cedula_FK
        `
        : '';

    const responsablesSelect =
      hasHistoriaResponsable && hasUsuario
        ? `
          NULLIF(
            TRIM(CONCAT(COALESCE(u.usu_nombres, ''), ' ', COALESCE(u.usu_apellidos, ''))),
            ''
          ) AS responsable
        `
        : hasCriterios &&
            hasUsuario &&
            hasCriteriaHistoriaId &&
            hasCriteriaProjectHistoryId
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

    const rows = await this.dataSource.query(
      `
        SELECT
          hu.his_ID AS hisId,
          hu.his_titulo AS titulo,
          hu.his_descripcion AS descripcion,
          hu.his_puntaje AS puntaje,
          hu.his_numero_sprint AS numeroSprint,
          ${responsablesSelect}
        FROM historia_usuario hu
        ${joinResponsables}
        WHERE hu.pro_ID_FK = ?
        GROUP BY
          hu.his_ID,
          hu.his_titulo,
          hu.his_descripcion,
          hu.his_puntaje,
          hu.his_numero_sprint
        ORDER BY hu.his_ID ASC
      `,
      [id],
    );

    return Array.isArray(rows) ? rows : [];
  }

  private async findCriteriosAceptacionByProyecto(id: number) {
    const hasCriterios = await this.tableExists('criterios_aceptacion');
    if (!hasCriterios) return [];

    const hasUsuario = await this.tableExists('usuario');
    const criteriaProjectColumn = (await this.columnExists(
      'criterios_aceptacion',
      'pro_ID_his_FK',
    ))
      ? 'pro_ID_his_FK'
      : (await this.columnExists('criterios_aceptacion', 'pro_ID_FK'))
        ? 'pro_ID_FK'
        : null;

    if (!criteriaProjectColumn) {
      return [];
    }

    const joinUsuario = hasUsuario
      ? `
        LEFT JOIN usuario u
          ON u.usu_cedula = ca.usu_cedula_FK
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

    const rows = await this.dataSource.query(
      `
        SELECT
          ca.cri_ID AS criId,
          ca.cri_tiempo AS tiempo,
          ca.cri_descripcion AS descripcion,
          ${responsableSelect}
        FROM criterios_aceptacion ca
        ${joinUsuario}
        WHERE ca.${criteriaProjectColumn} = ?
        ORDER BY ca.cri_ID ASC
      `,
      [id],
    );

    return Array.isArray(rows) ? rows : [];
  }

  private async findSugerenciasByProyecto(id: number) {
    const hasObservaciones = await this.tableExists('observaciones');
    if (!hasObservaciones) return [];

    const rows = await this.dataSource.query(
      `
        SELECT
          obs.obs_ID AS obsId,
          CONCAT('Sugerencia #', obs.obs_ID) AS titulo,
          obs.obs_descripcion AS descripcion
        FROM observaciones obs
        WHERE obs.pro_ID_FK = ?
        ORDER BY obs.obs_fecha DESC, obs.obs_ID DESC
      `,
      [id],
    );

    return Array.isArray(rows) ? rows : [];
  }

  async findAll() {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) return [];

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
    } else if (hasFichaColumn) {
      fichaSelect = 'p.fic_numero_FK AS fichaNumero';
    }
    return await this.dataSource.query(
      `
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
      `,
    );
  }

  async findOne(id: number) {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
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
    } else if (hasFichaColumn) {
      fichaSelect = 'p.fic_numero_FK AS fichaNumero';
    }
    const result = await this.dataSource.query(
      `
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
      `,
      [id],
    );

    const proyecto = Array.isArray(result) && result.length > 0 ? result[0] : null;
    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    return proyecto;
  }

  async findAdminDetalle(id: number) {
    const proyectoTable = await this.resolveProyectoTable();
    if (!proyectoTable) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
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
      } else {
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

    const [proyecto] = await this.dataSource.query(
      `
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
      `,
      [id],
    );

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
    const hasUsuario = await this.tableExists('usuario');
    const hasUsuarioFicha = await this.tableExists('usuario_ficha');

    let aprendices: unknown[] = [];

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

      aprendices = await this.dataSource.query(
        `
          SELECT
            u.usu_cedula AS cedula,
            u.usu_tipodedocumento AS tipoDocumento,
            u.usu_nombres AS nombres,
            u.usu_apellidos AS apellidos,
            u.usu_correo AS correo,
            u.usu_telefono AS telefono,
            u.usu_sexo AS sexo,
            u.usu_estado AS estado,
            uf.fic_numero_FK AS fichaNumero,
            f.fic_programa AS fichaPrograma,
            ${fichaAreaSelect} AS fichaArea
          FROM usu_pro_det_par up
          INNER JOIN usuario u
            ON u.usu_cedula = up.usu_cedula
           AND u.rol_sis_ID_FK = 1
          ${joinUsuarioFicha}
          ${joinFichaAprendiz}
          WHERE up.pro_ID = ?
          ORDER BY u.usu_apellidos ASC, u.usu_nombres ASC
        `,
        [id],
      );
    }

    const [historiasUsuario, criteriosAceptacion, sugerencias] =
      await Promise.all([
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

  async updateAdminDetalle(
    id: number,
    payload: {
      proDescription?: string | null;
      proObjetivoGeneral?: string | null;
      proObjetivosEspecificos?: string | null;
      proJustificacion?: string | null;
    },
  ) {
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
    } as const;

    const updates: string[] = [];
    const values: Array<string | null> = [];

    (
      Object.keys(fieldConfig) as Array<keyof typeof fieldConfig>
    ).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(payload, key)) {
        return;
      }

      const config = fieldConfig[key];
      updates.push(`${config.column} = ?`);
      values.push(
        this.normalizeTextFieldInput(payload[key], config.maxLength, config.label),
      );
    });

    if (updates.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo editable del proyecto.',
      );
    }

    await this.dataSource.query(
      `
        UPDATE ${projectContext.tableRef}
        SET ${updates.join(', ')}
        WHERE pro_ID = ?
      `,
      [...values, id],
    );

    return await this.findAdminDetalle(id);
  }

  async findAdminAprendicesEditor(id: number) {
    const { proyecto } = await this.findProyectoContext(id);
    const rolesScrum = await this.resolveRolesScrum();
    const fichaNumero = String(proyecto?.fichaNumero ?? '').trim();

    const [aprendicesProyecto, aprendicesFicha] = await Promise.all([
      this.findProyectoAprendices(id),
      fichaNumero ? this.findFichaAprendicesForProject(id, fichaNumero) : [],
    ]);

    return {
      proyecto: {
        proId: Number(proyecto?.proId || id),
        proNombre: proyecto?.proNombre || null,
        fichaNumero: fichaNumero || null,
      },
      aprendicesProyecto,
      aprendicesFicha,
      rolesScrum,
    };
  }

  async addAprendizToProyecto(
    id: number,
    cedula: string | number,
    detParId?: number,
  ) {
    const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
    const hasUsuario = await this.tableExists('usuario');
    const hasUsuarioFicha = await this.tableExists('usuario_ficha');

    if (!hasUsuProDetPar || !hasUsuario || !hasUsuarioFicha) {
      throw new BadRequestException(
        'No fue posible editar los aprendices de este proyecto.',
      );
    }

    const { proyecto } = await this.findProyectoContext(id);
    const fichaNumero = String(proyecto?.fichaNumero ?? '').trim();

    if (!fichaNumero) {
      throw new BadRequestException(
        'Este proyecto no tiene una ficha asociada para agregar aprendices.',
      );
    }

    const aprendizRows = await this.dataSource.query(
      `
        SELECT
          u.usu_cedula AS cedula,
          uf.fic_numero_FK AS fichaNumero
        FROM usuario u
        INNER JOIN usuario_ficha uf
          ON uf.usu_cedula_FK = u.usu_cedula
        WHERE u.usu_cedula = ?
          AND u.rol_sis_ID_FK = 1
        LIMIT 1
      `,
      [Number(cedula)],
    );

    const aprendiz = Array.isArray(aprendizRows) ? aprendizRows[0] : null;

    if (!aprendiz) {
      throw new NotFoundException('El aprendiz no existe.');
    }

    if (String(aprendiz.fichaNumero ?? '').trim() !== fichaNumero) {
      throw new BadRequestException(
        'El aprendiz no pertenece a la ficha asociada a este proyecto.',
      );
    }

    const currentAssignment = await this.getAprendizProyectoAssignment(id, cedula);
    if (currentAssignment.length > 0) {
      throw new ConflictException(
        'El aprendiz ya esta asignado a este proyecto.',
      );
    }

    const otherAssignments = await this.dataSource.query(
      `
        SELECT
          up.pro_ID AS proId,
          p.pro_nombre AS proNombre
        FROM usu_pro_det_par up
        LEFT JOIN ${this.wrapIdentifier((await this.findProyectoContext(id)).proyectoTable)} p
          ON p.pro_ID = up.pro_ID
        WHERE up.usu_cedula = ?
          AND up.pro_ID <> ?
        LIMIT 1
      `,
      [Number(cedula), id],
    );

    const otherProject = Array.isArray(otherAssignments) ? otherAssignments[0] : null;

    if (otherProject) {
      const otherProjectName = String(otherProject.proNombre || '').trim();
      throw new ConflictException(
        otherProjectName
          ? `El aprendiz ya esta asignado a otro proyecto: ${otherProjectName}.`
          : 'El aprendiz ya esta asignado a otro proyecto.',
      );
    }

    const rolesScrum = await this.resolveRolesScrum();
    const roleId = detParId || (await this.resolveDefaultRolScrumId());

    if (!roleId) {
      throw new BadRequestException(
        'No se encontro un rol Scrum disponible para asignar.',
      );
    }

    const validRole = rolesScrum.some((item) => Number(item.detParId) === Number(roleId));
    if (!validRole) {
      throw new BadRequestException('El rol Scrum seleccionado no es valido.');
    }

    await this.dataSource.query(
      `
        INSERT INTO usu_pro_det_par (usu_cedula, det_par_ID_, pro_ID)
        VALUES (?, ?, ?)
      `,
      [Number(cedula), Number(roleId), id],
    );

    return {
      success: true,
      message: 'Aprendiz agregado correctamente al proyecto.',
    };
  }

  async saveProyectoAprendices(
    id: number,
    payload: {
      addCedulas?: Array<string | number>;
      removeCedulas?: Array<string | number>;
    },
  ) {
    const addCedulas = this.normalizeCedulasList(payload?.addCedulas);
    const removeCedulas = this.normalizeCedulasList(payload?.removeCedulas);

    if (addCedulas.length === 0 && removeCedulas.length === 0) {
      return {
        success: true,
        added: [],
        removed: [],
      };
    }

    const overlap = addCedulas.find((cedula) => removeCedulas.includes(cedula));
    if (overlap) {
      throw new BadRequestException(
        'Un aprendiz no puede agregarse y eliminarse al mismo tiempo.',
      );
    }

    const hasUsuProDetPar = await this.tableExists('usu_pro_det_par');
    const hasUsuario = await this.tableExists('usuario');
    const hasUsuarioFicha = await this.tableExists('usuario_ficha');

    if (!hasUsuProDetPar || !hasUsuario || !hasUsuarioFicha) {
      throw new BadRequestException(
        'No fue posible guardar los cambios de aprendices en este proyecto.',
      );
    }

    const projectContext = await this.findProyectoContext(id);
    const fichaNumero = String(projectContext.proyecto?.fichaNumero ?? '').trim();

    if (!fichaNumero) {
      throw new BadRequestException(
        'Este proyecto no tiene una ficha asociada para editar aprendices.',
      );
    }

    const defaultRolScrumId = await this.resolveDefaultRolScrumId();
    if (!defaultRolScrumId && addCedulas.length > 0) {
      throw new BadRequestException(
        'No se encontro un rol Scrum disponible para asignar.',
      );
    }

    const added: string[] = [];
    const removed: string[] = [];

    for (const cedula of removeCedulas) {
      const rows = await this.dataSource.query(
        `
          SELECT
            u.usu_nombres AS nombres,
            u.usu_apellidos AS apellidos
          FROM usu_pro_det_par up
          INNER JOIN usuario u
            ON u.usu_cedula = up.usu_cedula
          WHERE up.pro_ID = ?
            AND up.usu_cedula = ?
          LIMIT 1
        `,
        [id, Number(cedula)],
      );

      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row) {
        throw new NotFoundException(
          `El aprendiz con documento ${cedula} no esta asignado a este proyecto.`,
        );
      }

      removed.push(
        `${String(row.nombres || '').trim()} ${String(row.apellidos || '').trim()}`.trim() ||
          cedula,
      );
    }

    for (const cedula of addCedulas) {
      const aprendizRows = await this.dataSource.query(
        `
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
        `,
        [Number(cedula)],
      );

      const aprendiz = Array.isArray(aprendizRows) ? aprendizRows[0] : null;

      if (!aprendiz) {
        throw new NotFoundException(
          `El aprendiz con documento ${cedula} no existe.`,
        );
      }

      if (String(aprendiz.fichaNumero ?? '').trim() !== fichaNumero) {
        throw new BadRequestException(
          `El aprendiz con documento ${cedula} no pertenece a la ficha de este proyecto.`,
        );
      }

      const currentAssignment = await this.getAprendizProyectoAssignment(id, cedula);
      if (currentAssignment.length > 0) {
        throw new ConflictException(
          `El aprendiz con documento ${cedula} ya esta asignado a este proyecto.`,
        );
      }

      const otherAssignments = await this.dataSource.query(
        `
          SELECT
            up.pro_ID AS proId,
            p.pro_nombre AS proNombre
          FROM usu_pro_det_par up
          LEFT JOIN ${this.wrapIdentifier(projectContext.proyectoTable)} p
            ON p.pro_ID = up.pro_ID
          WHERE up.usu_cedula = ?
            AND up.pro_ID <> ?
          LIMIT 1
        `,
        [Number(cedula), id],
      );

      const otherProject = Array.isArray(otherAssignments)
        ? otherAssignments[0]
        : null;

      if (otherProject) {
        const projectName = String(otherProject.proNombre || '').trim();
        throw new ConflictException(
          projectName
            ? `El aprendiz con documento ${cedula} ya esta asignado a otro proyecto: ${projectName}.`
            : `El aprendiz con documento ${cedula} ya esta asignado a otro proyecto.`,
        );
      }

      added.push(
        `${String(aprendiz.nombres || '').trim()} ${String(aprendiz.apellidos || '').trim()}`.trim() ||
          cedula,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const cedula of removeCedulas) {
        await queryRunner.query(
          `
            DELETE FROM usu_pro_det_par
            WHERE pro_ID = ?
              AND usu_cedula = ?
          `,
          [id, Number(cedula)],
        );
      }

      for (const cedula of addCedulas) {
        await queryRunner.query(
          `
            INSERT INTO usu_pro_det_par (usu_cedula, det_par_ID_, pro_ID)
            VALUES (?, ?, ?)
          `,
          [Number(cedula), Number(defaultRolScrumId), id],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return {
      success: true,
      added,
      removed,
    };
  }

  async updateAprendizProyectoRole(
    id: number,
    cedula: string | number,
    detParId: number,
  ) {
    const assignments = await this.getAprendizProyectoAssignment(id, cedula);

    if (assignments.length === 0) {
      throw new NotFoundException(
        'El aprendiz no esta asignado a este proyecto.',
      );
    }

    const rolesScrum = await this.resolveRolesScrum();
    const validRole = rolesScrum.some(
      (item) => Number(item.detParId) === Number(detParId),
    );

    if (!validRole) {
      throw new BadRequestException('El rol Scrum seleccionado no es valido.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `
          DELETE FROM usu_pro_det_par
          WHERE pro_ID = ?
            AND usu_cedula = ?
        `,
        [id, Number(cedula)],
      );

      await queryRunner.query(
        `
          INSERT INTO usu_pro_det_par (usu_cedula, det_par_ID_, pro_ID)
          VALUES (?, ?, ?)
        `,
        [Number(cedula), Number(detParId), id],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return {
      success: true,
      message: 'Rol Scrum actualizado correctamente.',
    };
  }

  async removeAprendizFromProyecto(id: number, cedula: string | number) {
    const result = await this.dataSource.query(
      `
        DELETE FROM usu_pro_det_par
        WHERE pro_ID = ?
          AND usu_cedula = ?
      `,
      [id, Number(cedula)],
    );

    const affectedRows = Number(result?.affectedRows || result?.[0]?.affectedRows || 0);

    if (affectedRows === 0) {
      throw new NotFoundException(
        'El aprendiz no esta asignado a este proyecto.',
      );
    }

    return {
      success: true,
      message: 'Aprendiz eliminado correctamente del proyecto.',
    };
  }
}
