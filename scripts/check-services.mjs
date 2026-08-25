import {
  access,
  readFile,
} from "node:fs/promises";

const services = [
  {
    name: "device-agent",
    readme:
      "services/device-agent/README.md",
    package:
      "services/device-agent/pyproject.toml",
    required: [
      "Ed25519",
      "SQLite",
      "Proof",
    ],
  },
  {
    name: "evidence-verifier",
    readme:
      "services/evidence-verifier/README.md",
    package:
      "services/evidence-verifier/package.json",
    required: [
      "Ed25519",
      "EVIDENCE_VERIFIER_PRIVATE_KEY",
      "POLL_INTERVAL_MS",
    ],
  },
  {
    name: "verifier-worker",
    readme:
      "services/verifier-worker/README.md",
    package:
      "services/verifier-worker/package.json",
    required: [
      "POWERCHAIN_VERIFIER_KEYPAIR",
      "lease",
      "reconcile",
    ],
  },
];

for (const service of services) {
  await access(service.readme);
  await access(service.package);

  const source = await readFile(
    service.readme,
    "utf8",
  );

  if (!source.includes("`1.0.0`")) {
    throw new Error(
      `${service.readme}: canonical 1.0.0 missing`,
    );
  }

  for (const token of service.required) {
    if (
      !source
        .toLowerCase()
        .includes(
          token.toLowerCase(),
        )
    ) {
      throw new Error(
        `${service.readme}: missing operational contract ${token}`,
      );
    }
  }
}

const root = await readFile(
  "services/README.md",
  "utf8",
);
for (const service of services) {
  if (!root.includes(service.name)) {
    throw new Error(
      `services/README.md missing ${service.name}`,
    );
  }
}

console.log(
  `Services: ${services.length} operational READMEs verified`,
);
