import type {
  AppErrorCode,
  AppErrorShape,
} from "@/types/errors";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(shape: AppErrorShape) {
    super(shape.message);
    this.name = "AppError";
    this.code = shape.code;
    this.status = shape.status;
    this.details = shape.details;
  }

  toJSON(): AppErrorShape {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError({
      code: "INTERNAL_ERROR",
      message: error.message,
      status: 500,
    });
  }
  return new AppError({
    code: "INTERNAL_ERROR",
    message: "Unexpected application error.",
    status: 500,
    details: error,
  });
}
