import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { world } from "../../src/world.js";
import { createInitialAgents } from "../../src/agents.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const scriptPath = path.join(repoRoot, "scripts/assistants.mjs");

function fixtureState() {
  const agents = createInitialAgents();
  const alex = agents.find(agent => agent.id === "alex");
  assert.ok(alex, "fixture must contain alex");
  alex.position = { x: "invalid", z: 2 };
  return {
    version: 5,
    stateRevision: 0,
    savedAt: Date.now(),
    day: 1,
    hour: 8,
    world: structuredClone(world),
    agents,
    events: [],
    nexoMemory: {
      version: 4, runs: [], lessons: [], patterns: [],
      nexo: { missions: [], attempts: [], doNotRepeat: [], executions: [], effectJournal: [] }
    }
  };
}

async function runIsolated({ repair }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-assistants-cli-"));
  try {
    const statePath = path.join(root, "world-state.json");
    const memoryPath = path.join(root, "lumina-memory.json");
    const continuityPath = path.join(root, "nexo-continuity.json");
    const initialState = fixtureState();
    await fs.writeFile(statePath, JSON.stringify(initialState), "utf8");
    const args = [scriptPath];
    if (repair) args.push("--nexo-repair-once");
    const child = spawnSync(process.execPath, args, {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 30_000,
      env: {
        ...process.env,
        NEXO_STATE_PATH: statePath,
        NEXO_LUMINA_MEMORY_PATH: memoryPath,
        NEXO_CONTINUITY_PATH: continuityPath
      }
    });
    assert.equal(child.error, undefined, child.error?.message);
    const report = JSON.parse(child.stdout);
    assert.equal(child.status, report.status === "error" ? 1 : 0, child.stderr || child.stdout);
    const state = JSON.parse(await fs.readFile(statePath, "utf8"));
    assert.deepEqual(state.nexoMemory, initialState.nexoMemory,
      "Lúmina must preserve legacy Nexo memory as opaque data without rewriting it");
    let continuityExists = true;
    try {
      await fs.access(continuityPath);
    } catch (error) {
      if (error?.code === "ENOENT") continuityExists = false;
      else throw error;
    }
    assert.equal(continuityExists, false,
      "Lúmina assistant launcher must not create Nexo Continuity");
    assert.equal("nexoRuntimeSession" in report, false,
      "Lúmina assistant launcher must not invoke Nexo runtime");
    return { report, state, continuityExists };
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

const defaultRun = await runIsolated({ repair: false });
assert.equal(defaultRun.state.stateRevision, 1);
assert.equal(defaultRun.continuityExists, false);

const optInRun = await runIsolated({ repair: true });
assert.equal(optInRun.state.stateRevision, 1);
assert.equal(optInRun.continuityExists, false);
assert.ok(optInRun.state.nexoMemory, "opaque legacy Nexo payload remains present");

console.log("Lúmina assistants CLI: no Nexo runtime invocation or Continuity creation, including the legacy repair flag.");
