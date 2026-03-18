/**
 * SchemaIntrospection
 * -------------------
 * Helper liviano para:
 * - Consultar `information_schema` (existencia de tablas/columnas).
 * - Detectar si un nombre corresponde a VIEW vs BASE TABLE.
 * - Crear vistas de compatibilidad ("legacy") cuando la base de datos cambie
 *   nombres de tablas entre versiones.
 *
 * Notas de diseno:
 * - Usa cache en memoria porque el esquema no cambia normalmente durante la vida
 *   de un proceso (mejora performance y reduce carga en MySQL).
 * - No acepta input de usuario como identificador directo. Aun asi, ofrece
 *   `wrapIdentifier` para escapado seguro cuando se necesite interpolar nombres
 *   de tablas/columnas (los valores SIEMPRE van por parametros `?`).
 */
import { DataSource } from 'typeorm';

export class SchemaIntrospection {
  private readonly tableExistsCache = new Map<string, boolean>();
  private readonly columnExistsCache = new Map<string, boolean>();
  private readonly tableTypeCache = new Map<string, string | null>();
  private ensureLegacyViewsPromise: Promise<void> | null = null;

  constructor(private readonly dataSource: DataSource) {}

  wrapIdentifier(identifier: string) {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  async tableExists(tableName: string) {
    const normalized = String(tableName || '').trim();
    if (!normalized) return false;
    if (this.tableExistsCache.has(normalized)) {
      return this.tableExistsCache.get(normalized) as boolean;
    }

    const [row] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
      [normalized],
    );

    const exists = Number(row?.total || 0) > 0;
    this.tableExistsCache.set(normalized, exists);
    return exists;
  }

  async columnExists(tableName: string, columnName: string) {
    const normalizedTable = String(tableName || '').trim();
    const normalizedColumn = String(columnName || '').trim();
    if (!normalizedTable || !normalizedColumn) return false;

    const cacheKey = `${normalizedTable}.${normalizedColumn}`;
    if (this.columnExistsCache.has(cacheKey)) {
      return this.columnExistsCache.get(cacheKey) as boolean;
    }

    const [row] = await this.dataSource.query(
      `
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `,
      [normalizedTable, normalizedColumn],
    );

    const exists = Number(row?.total || 0) > 0;
    this.columnExistsCache.set(cacheKey, exists);
    return exists;
  }

  async getTableType(tableName: string) {
    const normalized = String(tableName || '').trim();
    if (!normalized) return null;
    if (this.tableTypeCache.has(normalized)) {
      return this.tableTypeCache.get(normalized) as string | null;
    }

    const [row] = await this.dataSource.query(
      `
        SELECT TABLE_TYPE AS tableType
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        LIMIT 1
      `,
      [normalized],
    );

    const tableType = String(row?.tableType || '').toUpperCase() || null;
    this.tableTypeCache.set(normalized, tableType);
    return tableType;
  }

  /**
   * Crea vistas legacy solo si detecta que existen las tablas modernas.
   * Se ejecuta a demanda y se memoiza para evitar trabajo repetido.
   */
  async ensureLegacyAdminViews() {
    if (!this.ensureLegacyViewsPromise) {
      this.ensureLegacyViewsPromise = this.ensureLegacyAdminViewsInternal();
    }
    return this.ensureLegacyViewsPromise;
  }

  private async ensureLegacyAdminViewsInternal() {
    const legacyFichaType = await this.getTableType('fichas');
    const modernFichaType = await this.getTableType('ficha');

    if (modernFichaType && legacyFichaType !== 'BASE TABLE') {
      await this.dataSource.query(`
        CREATE OR REPLACE VIEW fichas AS
        SELECT
          fic_id AS fic_numero,
          fic_area,
          fic_programa,
          fic_fecha_creacion,
          fic_estado
        FROM ficha
      `);

      // Invalida caches relacionadas.
      this.tableTypeCache.delete('fichas');
      this.tableExistsCache.delete('fichas');
    }

    const legacyUsuarioFichaType = await this.getTableType('usuario_ficha');
    const modernUsuarioFichaType = await this.getTableType('usu_fic');

    if (modernUsuarioFichaType && legacyUsuarioFichaType !== 'BASE TABLE') {
      await this.dataSource.query(`
        CREATE OR REPLACE VIEW usuario_ficha AS
        SELECT
          usu_cedula_FK,
          fic_numero_FK,
          usf_fecha_asignacion
        FROM usu_fic
      `);

      this.tableTypeCache.delete('usuario_ficha');
      this.tableExistsCache.delete('usuario_ficha');
    }
  }
}
