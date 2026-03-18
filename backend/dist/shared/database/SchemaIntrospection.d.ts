import { DataSource } from 'typeorm';
export declare class SchemaIntrospection {
    private readonly dataSource;
    private readonly tableExistsCache;
    private readonly columnExistsCache;
    private readonly tableTypeCache;
    private ensureLegacyViewsPromise;
    constructor(dataSource: DataSource);
    wrapIdentifier(identifier: string): string;
    tableExists(tableName: string): Promise<boolean>;
    columnExists(tableName: string, columnName: string): Promise<boolean>;
    getTableType(tableName: string): Promise<string>;
    ensureLegacyAdminViews(): Promise<void>;
    private ensureLegacyAdminViewsInternal;
}
