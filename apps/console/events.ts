import type { AppEventMap } from "@/types/events";

type Handler<T> = (payload: T) => void;

class TypedEventBus<TEvents extends Record<string, unknown>> {
  private readonly handlers = new Map<
    keyof TEvents,
    Set<Handler<TEvents[keyof TEvents]>>
  >();

  on<TKey extends keyof TEvents>(
    event: TKey,
    handler: Handler<TEvents[TKey]>,
  ) {
    const handlers =
      this.handlers.get(event) ??
      new Set<Handler<TEvents[keyof TEvents]>>();

    handlers.add(handler as Handler<TEvents[keyof TEvents]>);
    this.handlers.set(event, handlers);

    return () => {
      handlers.delete(handler as Handler<TEvents[keyof TEvents]>);
      if (handlers.size === 0) this.handlers.delete(event);
    };
  }

  emit<TKey extends keyof TEvents>(
    event: TKey,
    payload: TEvents[TKey],
  ) {
    for (const handler of this.handlers.get(event) ?? []) {
      handler(payload);
    }
  }
}

export const appEvents = new TypedEventBus<AppEventMap>();
