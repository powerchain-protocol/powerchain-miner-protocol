import http from "node:http";
import { randomUUID } from "node:crypto";

const port = Number(
  process.env.POWERCHAIN_CODEX_PROXY_PORT ?? "3210",
);
const computeBase = (
  process.env.POWERCHAIN_COMPUTE_BASE_URL ??
  "https://compute.powerchain.energy/v1"
).replace(/\/+$/, "");

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function apiKey(request) {
  const header = request.headers.authorization ?? "";
  if (!/^Bearer\s+pc_compute_/i.test(header)) {
    throw Object.assign(
      new Error("PowerChain compute API key is required."),
      { status: 401 },
    );
  }
  return header.replace(/^Bearer\s+/i, "");
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return JSON.parse(
    Buffer.concat(chunks).toString("utf8") || "{}",
  );
}

function contentText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      if (
        part.type === "input_text" ||
        part.type === "output_text"
      ) {
        return part.text ?? "";
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function responsesInputToMessages(input) {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }

  const messages = [];
  for (const item of Array.isArray(input) ? input : []) {
    if (!item || typeof item !== "object") continue;

    if (item.type === "function_call_output") {
      messages.push({
        role: "tool",
        tool_call_id: item.call_id,
        content:
          typeof item.output === "string"
            ? item.output
            : JSON.stringify(item.output ?? ""),
      });
      continue;
    }

    if (
      item.type === "message" ||
      typeof item.role === "string"
    ) {
      messages.push({
        role:
          item.role === "developer"
            ? "developer"
            : item.role === "assistant"
              ? "assistant"
              : item.role === "system"
                ? "system"
                : "user",
        content: contentText(item.content),
      });
    }
  }

  return messages;
}

function responsesToolsToChat(tools) {
  return (Array.isArray(tools) ? tools : [])
    .filter(
      (tool) =>
        tool &&
        typeof tool === "object" &&
        tool.type === "function" &&
        typeof tool.name === "string",
    )
    .map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters:
          tool.parameters ??
          tool.input_schema ??
          { type: "object", properties: {} },
      },
    }));
}

function responsesRequestToChat(body) {
  const messages = responsesInputToMessages(
    body.input,
  );

  if (body.instructions) {
    messages.unshift({
      role: "developer",
      content:
        typeof body.instructions === "string"
          ? body.instructions
          : contentText(body.instructions),
    });
  }

  return {
    model: body.model,
    messages,
    stream: false,
    max_completion_tokens:
      body.max_output_tokens,
    temperature: body.temperature,
    top_p: body.top_p,
    tools: responsesToolsToChat(body.tools),
    tool_choice: body.tool_choice,
  };
}

function chatToResponse(body, requestedModel) {
  const choice = body?.choices?.[0] ?? {};
  const message = choice.message ?? {};
  const output = [];

  if (
    typeof message.content === "string" &&
    message.content.length
  ) {
    output.push({
      id: `msg_${randomUUID()}`,
      type: "message",
      status: "completed",
      role: "assistant",
      content: [
        {
          type: "output_text",
          text: message.content,
          annotations: [],
        },
      ],
    });
  }

  for (const call of message.tool_calls ?? []) {
    if (
      call?.type !== "function" ||
      !call.function
    ) {
      continue;
    }
    output.push({
      id: `fc_${randomUUID()}`,
      type: "function_call",
      status: "completed",
      call_id:
        call.id ?? `call_${randomUUID()}`,
      name: call.function.name,
      arguments:
        call.function.arguments ?? "{}",
    });
  }

  const inputTokens =
    body?.usage?.prompt_tokens ?? 0;
  const outputTokens =
    body?.usage?.completion_tokens ?? 0;

  return {
    id: `resp_${randomUUID()}`,
    object: "response",
    created_at: Math.floor(Date.now() / 1000),
    status: "completed",
    error: null,
    incomplete_details: null,
    instructions: null,
    model: requestedModel,
    output,
    parallel_tool_calls: true,
    usage: {
      input_tokens: inputTokens,
      input_tokens_details: {
        cached_tokens:
          body?.usage?.prompt_tokens_details
            ?.cached_tokens ?? 0,
      },
      output_tokens: outputTokens,
      output_tokens_details: {
        reasoning_tokens:
          body?.usage?.completion_tokens_details
            ?.reasoning_tokens ?? 0,
      },
      total_tokens:
        body?.usage?.total_tokens ??
        inputTokens + outputTokens,
    },
  };
}

function sendSse(response, result) {
  response.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-store",
    connection: "keep-alive",
  });

  let sequence = 0;
  const emit = (type, data) => {
    response.write(`event: ${type}\n`);
    response.write(
      `data: ${JSON.stringify({
        type,
        sequence_number: sequence++,
        ...data,
      })}\n\n`,
    );
  };

  emit("response.created", {
    response: {
      ...result,
      status: "in_progress",
      output: [],
    },
  });

  result.output.forEach((item, outputIndex) => {
    emit("response.output_item.added", {
      output_index: outputIndex,
      item: {
        ...item,
        status: "in_progress",
      },
    });

    if (item.type === "message") {
      const text =
        item.content?.[0]?.text ?? "";

      emit("response.content_part.added", {
        item_id: item.id,
        output_index: outputIndex,
        content_index: 0,
        part: {
          type: "output_text",
          text: "",
          annotations: [],
        },
      });

      if (text) {
        emit("response.output_text.delta", {
          item_id: item.id,
          output_index: outputIndex,
          content_index: 0,
          delta: text,
        });
      }

      emit("response.output_text.done", {
        item_id: item.id,
        output_index: outputIndex,
        content_index: 0,
        text,
      });

      emit("response.content_part.done", {
        item_id: item.id,
        output_index: outputIndex,
        content_index: 0,
        part: item.content[0],
      });
    }

    if (item.type === "function_call") {
      if (item.arguments) {
        emit(
          "response.function_call_arguments.delta",
          {
            item_id: item.id,
            output_index: outputIndex,
            delta: item.arguments,
          },
        );
      }
      emit(
        "response.function_call_arguments.done",
        {
          item_id: item.id,
          output_index: outputIndex,
          arguments: item.arguments,
        },
      );
    }

    emit("response.output_item.done", {
      output_index: outputIndex,
      item,
    });
  });

  emit("response.completed", {
    response: result,
  });
  response.end();
}

async function computeRequest(apiKey, body, requestId) {
  const response = await fetch(
    `${computeBase}/chat/completions`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
        ...(requestId
          ? { "x-request-id": requestId }
          : {}),
      },
      body: JSON.stringify(body),
    },
  );

  const result = await response
    .json()
    .catch(() => ({}));

  return {
    response,
    result,
  };
}

const server = http.createServer(
  async (request, response) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );

    if (
      request.method === "GET" &&
      url.pathname === "/health"
    ) {
      return json(response, 200, {
        ok: true,
        service: "powerchain-codex-proxy",
        computeBase,
      });
    }

    if (
      request.method === "GET" &&
      (
        url.pathname === "/v1/models" ||
        url.pathname === "/models"
      )
    ) {
      try {
        const upstream = await fetch(
          `${computeBase}/models`,
          { headers: { accept: "application/json" } },
        );
        response.writeHead(upstream.status, {
          "content-type":
            upstream.headers.get("content-type") ??
            "application/json",
        });
        return response.end(
          Buffer.from(await upstream.arrayBuffer()),
        );
      } catch (error) {
        return json(response, 502, {
          error: {
            message: error.message,
            type: "proxy_error",
          },
        });
      }
    }

    if (
      request.method !== "POST" ||
      !(
        url.pathname === "/v1/responses" ||
        url.pathname === "/responses"
      )
    ) {
      return json(response, 404, {
        error: {
          message:
            "PowerChain Codex proxy supports POST /v1/responses and GET /v1/models.",
          type: "not_found",
        },
      });
    }

    try {
      const key = apiKey(request);
      const body = await readJson(request);

      if (!body.model) {
        return json(response, 400, {
          error: {
            message: "Responses request model is required.",
            type: "invalid_request_error",
          },
        });
      }

      const chatBody =
        responsesRequestToChat(body);

      const { response: upstream, result } =
        await computeRequest(
          key,
          chatBody,
          request.headers["x-request-id"],
        );

      if (!upstream.ok) {
        return json(
          response,
          upstream.status,
          result,
        );
      }

      const translated = chatToResponse(
        result,
        body.model,
      );

      if (body.stream === true) {
        return sendSse(
          response,
          translated,
        );
      }

      return json(response, 200, translated);
    } catch (error) {
      return json(
        response,
        error.status ?? 500,
        {
          error: {
            message: error.message,
            type: "powerchain_proxy_error",
          },
        },
      );
    }
  },
);

server.listen(port, "127.0.0.1", () => {
  console.log(
    `PowerChain Codex Responses proxy listening on http://127.0.0.1:${port}/v1`,
  );
});
