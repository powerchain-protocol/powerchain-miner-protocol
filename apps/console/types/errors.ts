export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "VALIDATION_FAILED"
  | "INTERNAL_ERROR";

export type AppErrorShape = {
  code: AppErrorCode;
  message: string;
  status: number;
  details?: unknown;
};
