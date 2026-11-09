declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: unknown[]): { changes: number };
      get(...params: unknown[]): unknown;
      all(...params: unknown[]): unknown[];
    };
    close(): void;
  }
}
