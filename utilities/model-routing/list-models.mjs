const base = (
  process.env.POWERCHAIN_COMPUTE_BASE_URL ??
  "https://compute.powerchain.energy/v1"
).replace(/\/+$/, "");

const wanted = process.argv[2] ?? null;

const response = await fetch(`${base}/models`, {
  headers: {
    accept: "application/json",
  },
});

if (!response.ok) {
  throw new Error(
    `PowerChain /models failed with HTTP ${response.status}`,
  );
}

const body = await response.json();
const models = Array.isArray(body?.data)
  ? body.data
  : [];

if (wanted) {
  const model = models.find(
    (candidate) => candidate.id === wanted,
  );
  if (!model) {
    console.error(
      `Model ${wanted} is not returned by ${base}/models.`,
    );
    process.exit(1);
  }
  console.log(JSON.stringify(model, null, 2));
  process.exit(0);
}

const rows = models.map((model) => ({
  id: model.id,
  name: model.name ?? model.id,
  contextLength: model.contextLength ?? null,
  inferenceReady:
    model.inferenceReady === false
      ? "no"
      : "yes",
}));

console.table(rows);
