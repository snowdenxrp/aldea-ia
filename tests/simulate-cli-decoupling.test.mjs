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

test("simulate CLI persists in an isolated sandbox and preserves Nexo field presence", async t => {
  const cases = [
    {
      name: "preserves historical nexoMemory exactly",
      nexoMemory: {
        sentinel: "__NCS_SIMULATION_NEXO_SENTINEL__",
        unknown: { nested: ["opaque", 0, false, { status: "UNKNOWN" }] }
      },
      expectedNexo: true
    },
    {
      name: "does not seed nexoMemory in a fresh state",
      expectedNexo: false
    }
  ];

  for (const scenario of cases) {
    await t.test(scenario.name, async () => {
      const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ncs-simulate-cli-"));
      try {
        // simulate.mjs resolves world-state.json relative to its own module.
        // Copy the complete source tree and launcher so all writes stay in this sandbox.
        await fs.cp(sourceDirectory, path.join(directory, "src"), { recursive: true });
        await fs.mkdir(path.join(directory, "scripts"), { recursive: true });
        await fs.copyFile(simulateLauncher, path.join(directory, "scripts", "simulate.mjs"));
        await fs.writeFile(path.join(directory, "package.json"), JSON.stringify({ type: "module" }));

        const initialState = {
          version: 5,
          stateRevision: 0,
          savedAt: Date.now(),
          day: 1,
          hour: 8,
          world: structuredClone(world),
          agents: structuredClone(createInitialAgents()),
          events: []
        };
        if (scenario.expectedNexo) initialState.nexoMemory = structuredClone(scenario.nexoMemory);
        await fs.writeFile(path.join(directory, "world-state.json"), JSON.stringify(initialState));

        const result = await runNode(["scripts/simulate.mjs"], {
          cwd: directory,
          env: { ...process.env },
          stdio: ["ignore", "pipe", "pipe"]
        });
        assert.equal(result.code, 0, `simulate.mjs failed (signal=${result.signal}). stderr: ${result.stderr}`);
        const output = JSON.parse(result.stdout);
        assert.ok(Number.isFinite(output.simulatedSeconds));

        const persisted = JSON.parse(await fs.readFile(path.join(directory, "world-state.json"), "utf8"));
        assert.equal(persisted.stateRevision, 1, "The sandbox state revision must advance.");
        assert.equal(Object.hasOwn(persisted, "nexoMemory"), scenario.expectedNexo,
          "The simulation launcher must preserve historical field presence.");
        if (scenario.expectedNexo) {
          assert.deepEqual(persisted.nexoMemory, scenario.nexoMemory,
            "Historical Nexo data must survive the CLI round-trip exactly.");
        }
        await assert.rejects(fs.access(path.join(directory, ".nexo-continuity.json")), { code: "ENOENT" },
          "The simulation launcher must not create a Continuity store in its sandbox.");
      } finally {
        await fs.rm(directory, { recursive: true, force: true });
      }
    });
  }
});
