/** Minimal structural D1 contract: works with the Cloudflare binding and test adapters. */
export interface D1Result<T = unknown> {
  success: boolean;
  results: T[];
  meta: { changes?: number; [key: string]: unknown };
  error?: string;
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = unknown>(): Promise<D1Result<T>>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
export interface ApiEnvironment {
  DB: D1Database;
}
