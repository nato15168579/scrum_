import { Injectable, NotFoundException } from '@nestjs/common';
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

    return {
      proyecto,
      aprendices,
    };
  }
}
