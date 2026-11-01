import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createInitialAgents } from "../src/agents.js";
import { world } from "../src/world.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = path.join(repoRoot, "src");
const assistantsLauncher = path.join(repoRoot, "scripts", "assistants.mjs");
const simulateLauncher = path.join(repoRoot, "scripts", "simulate.mjs");

function runNode(args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, options);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

test("assistants CLI keeps historical Nexo opaque and never invents it", async t => {
  const cases = [
    {
      name: "preserves an existing Nexo subtree exactly",
      memory: {
        runs: [],
        lessons: [],
        patterns: [],
        nexo: {
          sentinel: "__NCS_OPAQUE_NEXO_SENTINEL__",
          unknown: { nested: [null, 7, { state: "UNKNOWN", bytes: "keep-exactly" }] }
        }
      },
      expectedNexo: true
    },
    {
      name: "does not add Nexo when historical memory has no Nexo field",
      memory: { runs: [], lessons: [], patterns: [] },
      expectedNexo: false
    },
    {
      name: "initializes Lúmina memory only when the file is absent",
      memory: null,
      expectedNexo: false
    }
  ];

  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ncs-assistant-cli-"));
      try {
        // Run the actual launcher from a disposable project copy. This keeps any
        // legacy/default Continuity path inside the sandbox rather than the checkout.
        await fs.cp(sourceDirectory, path.join(directory, "src"), { recursive: true });
        await fs.mkdir(path.join(directory, "scripts"), { recursive: true });
        await fs.copyFile(assistantsLauncher, path.join(directory, "scripts", "assistants.mjs"));
        await fs.copyFile(simulateLauncher, path.join(directory, "scripts", "simulate.mjs"));
        await fs.writeFile(path.join(directory, "package.json"), JSON.stringify({ type: "module" }));

        const statePath = path.join(directory, "world-state.json");
        const memoryPath = path.join(directory, "lumina-memory.json");
        const continuityPath = path.join(directory, ".nexo-continuity.json");
        const historicalNexo = scenario.memory?.nexo === undefined ? undefined : structuredClone(scenario.memory.nexo);
        await fs.writeFile(statePath, JSON.stringify({
          version: 5,
          stateRevision: 0,
          savedAt: Date.now(),
          day: 1,
          hour: 8,
          world: structuredClone(world),
          agents: structuredClone(createInitialAgents()),
          events: []
        }));
        if (scenario.memory !== null) await fs.writeFile(memoryPath, JSON.stringify(scenario.memory));

        const result = await runNode(["scripts/assistants.mjs"], {
          cwd: directory,
          env: {
            ...process.env,
            NEXO_STATE_PATH: statePath,
            NEXO_LUMINA_MEMORY_PATH: memoryPath,
            NEXO_CONTINUITY_PATH: continuityPath
          },
          stdio: ["ignore", "pipe", "pipe"]
        });
        assert.equal(result.code, 0, `assistants.mjs failed (signal=${result.signal}). stderr: ${result.stderr}`);
        const output = JSON.parse(result.stdout);
        assert.equal(output.stateRevision, 1, "The launcher must persist the next state revision.");

        const persistedState = JSON.parse(await fs.readFile(statePath, "utf8"));
        assert.equal(persistedState.stateRevision, 1, "The isolated state file must be updated.");

        const learned = JSON.parse(await fs.readFile(memoryPath, "utf8"));
        assert.equal(learned.runs.length, 1, "The real learning path must append a run.");
        assert.ok(Array.isArray(learned.lessons));
        assert.ok(Array.isArray(learned.patterns));
        assert.equal(Object.hasOwn(learned, "nexo"), scenario.expectedNexo,
          "The launcher must preserve field presence, not manufacture a Nexo projection.");
        if (scenario.expectedNexo) {
          assert.deepEqual(learned.nexo, historicalNexo,
            "Historical Nexo data must survive the CLI round-trip byte-structure-equivalently.");
        }

        const learningProjection = JSON.stringify({
          runs: learned.runs,
          lessons: learned.lessons,
          patterns: learned.patterns
        });
        assert.equal(learningProjection.includes("__NCS_OPAQUE_NEXO_SENTINEL__"), false,
          "The Nexo sentinel must not enter Lúmina learning fields.");
        await assert.rejects(fs.access(continuityPath), { code: "ENOENT" },
          "The assistant launcher must not create a Continuity store in its sandbox.");
      } finally {
        await fs.rm(directory, { recursive: true, force: true });
      }
    });
  }
});


test("assistants CLI fails closed on malformed memory without overwriting either persisted file", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ncs-assistant-invalid-memory-"));
  try {
    await fs.cp(sourceDirectory, path.join(directory, "src"), { recursive: true });
    await fs.mkdir(path.join(directory, "scripts"), { recursive: true });
    await fs.copyFile(assistantsLauncher, path.join(directory, "scripts", "assistants.mjs"));
    await fs.copyFile(simulateLauncher, path.join(directory, "scripts", "simulate.mjs"));
    await fs.writeFile(path.join(directory, "package.json"), JSON.stringify({ type: "module" }));

    const statePath = path.join(directory, "world-state.json");
    const memoryPath = path.join(directory, "lumina-memory.json");
    const continuityPath = path.join(directory, ".nexo-continuity.json");
    const originalState = Buffer.from(JSON.stringify({
      version: 5,
      stateRevision: 7,
      savedAt: Date.now(),
      day: 1,
      hour: 8,
      world: structuredClone(world),
      agents: structuredClone(createInitialAgents()),
      events: []
    }));
    const originalMemory = Buffer.from('{ "runs": [broken JSON and Nexo bytes must remain untouched');
    await fs.writeFile(statePath, originalState);
    await fs.writeFile(memoryPath, originalMemory);

    const result = await runNode(["scripts/assistants.mjs"], {
      cwd: directory,
      env: {
        ...process.env,
        NEXO_STATE_PATH: statePath,
        NEXO_LUMINA_MEMORY_PATH: memoryPath,
        NEXO_CONTINUITY_PATH: continuityPath
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    assert.notEqual(result.code, 0, "Malformed existing memory must stop the launcher.");
    assert.match(result.stderr, /Invalid JSON in .*lumina-memory\.json/,
      "The failure must identify the invalid memory file.");
    assert.deepEqual(await fs.readFile(memoryPath), originalMemory,
      "Malformed memory bytes must remain exactly unchanged.");
    assert.deepEqual(await fs.readFile(statePath), originalState,
      "State persistence must not proceed after memory parsing fails.");
    await assert.rejects(fs.access(continuityPath), { code: "ENOENT" },
      "The failed launcher must not create a Continuity store.");
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
