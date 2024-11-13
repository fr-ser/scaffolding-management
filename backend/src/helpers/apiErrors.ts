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

export const SQLITE_CONSTRAINT_ERROR_CODE = "SQLITE_CONSTRAINT";
