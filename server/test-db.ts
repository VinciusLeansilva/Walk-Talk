import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { D1Database, D1PreparedStatement, D1Result } from "./d1.ts";

class Prepared implements D1PreparedStatement {
  constructor(
    private readonly owner: TestDatabase,
    private readonly query: string,
    private readonly values: unknown[] = [],
  ) {}
  bind(...values: unknown[]): D1PreparedStatement {
    return new Prepared(this.owner, this.query, values);
  }
  execute<T>(): D1Result<T> {
    const statement = this.owner.sqlite.prepare(this.query);
    const values = this.values as (
      null | number | bigint | string | Uint8Array
    )[];
    if (statement.columns().length)
      return {
        success: true,
        results: statement.all(...values) as T[],
        meta: { changes: 0 },
      };
    const result = statement.run(...values);
    return {
      success: true,
      results: [],
      meta: {
        changes: Number(result.changes),
        last_row_id: Number(result.lastInsertRowid),
      },
    };
  }
  async first<T = Record<string, unknown>>(column?: string): Promise<T | null> {
    const row = this.owner.sqlite
      .prepare(this.query)
      .get(
        ...(this.values as (null | number | bigint | string | Uint8Array)[]),
      );
    if (!row) return null;
    return (column ? row[column] : row) as T;
  }
  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return this.execute<T>();
  }
  async run<T = unknown>(): Promise<D1Result<T>> {
    return this.execute<T>();
  }
}

/** Applies authored/generated migrations; never reproduces the schema in tests. */
export class TestDatabase implements D1Database {
  readonly sqlite = new DatabaseSync(":memory:");
  constructor() {
    this.sqlite.exec("PRAGMA foreign_keys = ON");
    const directory =
      process.env.WALK_TALK_TEST_MIGRATIONS ||
      fileURLToPath(new URL("../drizzle/", import.meta.url));
    const migrations = readdirSync(directory)
      .filter((file) => file.endsWith(".sql"))
      .sort();
    if (!migrations.length)
      throw new Error(
        "Generate the D1 SQL migration before running API tests.",
      );
    for (const file of migrations)
      this.sqlite.exec(readFileSync(`${directory}/${file}`, "utf8"));
  }
  prepare(query: string): D1PreparedStatement {
    return new Prepared(this, query);
  }
  async batch<T = unknown>(
    statements: D1PreparedStatement[],
  ): Promise<D1Result<T>[]> {
    this.sqlite.exec("BEGIN IMMEDIATE");
    try {
      const results = statements.map((statement) =>
        (statement as Prepared).execute<T>(),
      );
      this.sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      this.sqlite.exec("ROLLBACK");
      throw error;
    }
  }
  close() {
    this.sqlite.close();
  }
}
