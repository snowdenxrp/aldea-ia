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
const launcher = path.join(repoRoot, "scripts", "assistants.mjs");

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
    }
  ];

  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ncs-assistant-cli-"));
      try {
        const statePath = path.join(directory, "world-state.json");
        const memoryPath = path.join(directory, "lumina-memory.json");
        const historicalNexo = structuredClone(scenario.memory.nexo);
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
        await fs.writeFile(memoryPath, JSON.stringify(scenario.memory));

        const result = await runNode([launcher], {
          cwd: directory,
          env: {
            ...process.env,
            NEXO_STATE_PATH: statePath,
            NEXO_LUMINA_MEMORY_PATH: memoryPath
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
      } finally {
        await fs.rm(directory, { recursive: true, force: true });
      }
    });
  }
});
