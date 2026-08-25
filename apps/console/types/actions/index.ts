import type { AppErrorShape } from "@/types/errors";

export type ActionSuccess<T> = {
  ok: true;
  data: T;
};

export type ActionFailure = {
  ok: false;
  error: AppErrorShape;
};

export type ActionResult<T> =
  | ActionSuccess<T>
  | ActionFailure;

export type ActionContext = {
  actorId?: string | null;
  requestId?: string | null;
};
