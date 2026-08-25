import "./load-dev-env.mjs";
import net from "node:net";

const attempts = Number(
  process.env.POWERCHAIN_DB_WAIT_ATTEMPTS ?? "30",
);
const delayMs = Number(
  process.env.POWERCHAIN_DB_WAIT_MS ?? "1000",
);

const raw =
  process.env.DATABASE_URL ??
  "postgres://powerchain:powerchain@localhost:5432/powerchain_miner";

let url;
try {
  url = new URL(raw);
} catch {
  console.error(
    "[db] DATABASE_URL is not a valid PostgreSQL URL.",
  );
  process.exit(2);
}

const host = url.hostname || "localhost";
const port = Number(url.port || "5432");

function probe() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(1200);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  if (await probe()) {
    console.log(
      `[db] PostgreSQL TCP endpoint reachable at ${host}:${port}`,
    );
    process.exit(0);
  }

  if (attempt < attempts) {
    await new Promise((resolve) =>
      setTimeout(resolve, delayMs),
    );
  }
}

console.error(
  `[db] PostgreSQL is not reachable at ${host}:${port}.`,
);
process.exit(1);
