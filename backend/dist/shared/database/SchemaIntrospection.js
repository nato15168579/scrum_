"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaIntrospection = void 0;
class SchemaIntrospection {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.tableExistsCache = new Map();
        this.columnExistsCache = new Map();
        this.tableTypeCache = new Map();
        this.ensureLegacyViewsPromise = null;
    }
    wrapIdentifier(identifier) {
        return `\`${identifier.replace(/`/g, '``')}\``;
    }
    async tableExists(tableName) {
        const normalized = String(tableName || '').trim();
        if (!normalized)
            return false;
        if (this.tableExistsCache.has(normalized)) {
            return this.tableExistsCache.get(normalized);
        }
        const [row] = await this.dataSource.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `, [normalized]);
        const exists = Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
        this.tableExistsCache.set(normalized, exists);
        return exists;
    }
    async columnExists(tableName, columnName) {
        const normalizedTable = String(tableName || '').trim();
        const normalizedColumn = String(columnName || '').trim();
        if (!normalizedTable || !normalizedColumn)
            return false;
        const cacheKey = `${normalizedTable}.${normalizedColumn}`;
        if (this.columnExistsCache.has(cacheKey)) {
            return this.columnExistsCache.get(cacheKey);
        }
        const [row] = await this.dataSource.query(`
        SELECT COUNT(*) AS total
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
      `, [normalizedTable, normalizedColumn]);
        const exists = Number((row === null || row === void 0 ? void 0 : row.total) || 0) > 0;
        this.columnExistsCache.set(cacheKey, exists);
        return exists;
    }
    async getTableType(tableName) {
        const normalized = String(tableName || '').trim();
        if (!normalized)
            return null;
        if (this.tableTypeCache.has(normalized)) {
            return this.tableTypeCache.get(normalized);
        }
        const [row] = await this.dataSource.query(`
        SELECT TABLE_TYPE AS tableType
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        LIMIT 1
      `, [normalized]);
        const tableType = String((row === null || row === void 0 ? void 0 : row.tableType) || '').toUpperCase() || null;
        this.tableTypeCache.set(normalized, tableType);
        return tableType;
    }
    async ensureLegacyAdminViews() {
        if (!this.ensureLegacyViewsPromise) {
            this.ensureLegacyViewsPromise = this.ensureLegacyAdminViewsInternal();
        }
        return this.ensureLegacyViewsPromise;
    }
    async ensureLegacyAdminViewsInternal() {
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
exports.SchemaIntrospection = SchemaIntrospection;
//# sourceMappingURL=SchemaIntrospection.js.map