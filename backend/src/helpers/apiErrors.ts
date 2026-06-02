import { ErrorCode } from "@/global/types/backendTypes";

export class ApiError extends Error {
  public errorCode: string;
  public errorStatus: number;

  constructor(code: ErrorCode, statusCode: number = 400) {
    super(code);
    this.errorCode = code;
    this.errorStatus = statusCode;
  }
}

export interface SQLiteError {
  code?: string;
  message?: string;
}

export function isSQLiteConstraintError(error: unknown): boolean {
  return (error as SQLiteError).code?.startsWith("SQLITE_CONSTRAINT") ?? false;
}

export function isSQLiteConstraintErrorOnColumn(error: unknown, column: string): boolean {
  const sqliteError = error as SQLiteError;
  return isSQLiteConstraintError(error) && (sqliteError.message?.includes(column) ?? false);
}
