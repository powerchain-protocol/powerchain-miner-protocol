import { z } from "zod";
import {
  AppError,
  toAppError,
} from "@/errors";
import type {
  ActionContext,
  ActionResult,
} from "@/types/actions";

export async function safeAction<
  TSchema extends z.ZodType,
  TResult,
>(input: {
  schema: TSchema;
  value: unknown;
  context?: ActionContext;
  execute(
    value: z.output<TSchema>,
    context: ActionContext,
  ): Promise<TResult>;
}): Promise<ActionResult<TResult>> {
  const parsed =
    input.schema.safeParse(input.value);

  if (!parsed.success) {
    return {
      ok: false,
      error: new AppError({
        code: "VALIDATION_FAILED",
        message:
          "Action input failed validation.",
        status: 422,
        details:
          z.treeifyError(parsed.error),
      }).toJSON(),
    };
  }

  try {
    return {
      ok: true,
      data: await input.execute(
        parsed.data,
        input.context ?? {},
      ),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        toAppError(error).toJSON(),
    };
  }
}
