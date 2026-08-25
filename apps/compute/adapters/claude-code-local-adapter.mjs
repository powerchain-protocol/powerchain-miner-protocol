import http from "node:http";
import { randomUUID } from "node:crypto";

const listenPort = Number(
  process.env.POWERCHAIN_CLAUDE_ADAPTER_PORT ?? "3211",
);
const target = (
  process.env.POWERCHAIN_COMPUTE_BASE_URL ??
  "https://compute.powerchain.energy/v1"
).replace(/\/+$/, "");
const apiKey =
  process.env.POWERCHAIN_COMPUTE_API_KEY;
const defaultModel =
  process.env.POWERCHAIN_COMPUTE_MODEL;

if (!apiKey || !defaultModel) {
  throw new Error(
    "POWERCHAIN_COMPUTE_API_KEY and POWERCHAIN_COMPUTE_MODEL are required.",
  );
}

function textContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.type === "text",
    )
    .map((item) => item.text ?? "")
    .join("\n");
}

http
  .createServer(async (request, response) => {
    if (
      request.method !== "POST" ||
      !request.url?.endsWith("/v1/messages")
    ) {
      response.writeHead(404, {
        "content-type": "application/json",
      });
      response.end(
        JSON.stringify({
          error: {
            type: "not_found_error",
            message: "Use POST /v1/messages.",
          },
        }),
      );
      return;
    }

    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const body = JSON.parse(
      Buffer.concat(chunks).toString("utf8"),
    );

    if (body.stream === true) {
      response.writeHead(422, {
        "content-type": "application/json",
      });
      response.end(
        JSON.stringify({
          error: {
            type: "invalid_request_error",
            message:
              "Streaming is not enabled in the v1.3 local adapter.",
          },
        }),
      );
      return;
    }

    const messages = [];
    if (body.system) {
      messages.push({
        role: "system",
        content: textContent(body.system),
      });
    }
    for (const message of body.messages ?? []) {
      messages.push({
        role:
          message.role === "assistant"
            ? "assistant"
            : "user",
        content: textContent(message.content),
      });
    }

    const compute = await fetch(
      `${target}/chat/completions`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: body.model || defaultModel,
          messages,
          max_tokens:
            body.max_tokens ?? 4096,
          temperature: body.temperature,
          stream: false,
        }),
      },
    );

    const result = await compute.json();

    if (!compute.ok) {
      response.writeHead(compute.status, {
        "content-type": "application/json",
      });
      response.end(JSON.stringify(result));
      return;
    }

    const text =
      result?.choices?.[0]?.message?.content ?? "";

    response.writeHead(200, {
      "content-type": "application/json",
    });
    response.end(
      JSON.stringify({
        id: `msg_${randomUUID()}`,
        type: "message",
        role: "assistant",
        model: body.model || defaultModel,
        content: [
          {
            type: "text",
            text:
              typeof text === "string"
                ? text
                : JSON.stringify(text),
          },
        ],
        stop_reason:
          result?.choices?.[0]?.finish_reason ??
          "end_turn",
        stop_sequence: null,
        usage: {
          input_tokens:
            result?.usage?.prompt_tokens ?? 0,
          output_tokens:
            result?.usage?.completion_tokens ?? 0,
        },
      }),
    );
  })
  .listen(listenPort, "127.0.0.1", () => {
    console.log(
      `PowerChain Claude Code adapter: http://127.0.0.1:${listenPort}`,
    );
  });
