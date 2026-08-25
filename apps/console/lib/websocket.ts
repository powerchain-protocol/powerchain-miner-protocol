export type ReconnectingWebSocketOptions = {
  reconnectMs?: number;
  maxReconnectMs?: number;
  onMessage?(data: unknown): void;
  onStatus?(
    status: "connecting" | "open" | "closed" | "error",
  ): void;
};

export function createReconnectingWebSocket(
  url: string,
  options: ReconnectingWebSocketOptions = {},
) {
  if (typeof window === "undefined") {
    throw new Error(
      "Browser WebSocket transport can only be created in a client runtime.",
    );
  }

  let socket: WebSocket | null = null;
  let stopped = false;
  let delay = options.reconnectMs ?? 1_000;
  const maxDelay = options.maxReconnectMs ?? 30_000;

  const connect = () => {
    if (stopped) return;
    options.onStatus?.("connecting");
    socket = new WebSocket(url);
    socket.addEventListener("open", () => {
      delay = options.reconnectMs ?? 1_000;
      options.onStatus?.("open");
    });
    socket.addEventListener("message", (event) => {
      try {
        options.onMessage?.(JSON.parse(event.data));
      } catch {
        options.onMessage?.(event.data);
      }
    });
    socket.addEventListener("error", () => {
      options.onStatus?.("error");
    });
    socket.addEventListener("close", () => {
      options.onStatus?.("closed");
      if (!stopped) {
        window.setTimeout(connect, delay);
        delay = Math.min(maxDelay, delay * 2);
      }
    });
  };

  connect();

  return {
    send(value: unknown) {
      if (socket?.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not open.");
      }
      socket.send(
        typeof value === "string"
          ? value
          : JSON.stringify(value),
      );
    },
    close() {
      stopped = true;
      socket?.close();
    },
  };
}
