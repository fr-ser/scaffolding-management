import { ErrorCode } from "@/global/types/backendTypes";

export class ApiError extends Error {
  public errorCode: string;

  constructor(code: ErrorCode) {
    super(code);
    this.errorCode = code;
  }
}

export const SQLITE_CONSTRAINT_ERROR_CODE = "SQLITE_CONSTRAINT";
