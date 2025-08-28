import { Pool, type QueryResult, type QueryResultRow } from "pg";

// create a single pool instance and export helpers
let pool: Pool | null = null;

export function getPool() {
    if (!pool) {
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
    }
    return pool;
}

export function query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[]
): Promise<QueryResult<R>> {
    return getPool().query<R>(text, params);
}