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
    events: []
  };
}

async function runIsolated({ repair }) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nexo-assistants-cli-"));
  try {
    const statePath = path.join(root, "world-state.json");
    const memoryPath = path.join(root, "lumina-memory.json");
    const continuityPath = path.join(root, "nexo-continuity.json");
    await fs.writeFile(statePath, JSON.stringify(fixtureState()), "utf8");
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
    assert.equal(child.status, 0, child.stderr || child.stdout);
    const report = JSON.parse(child.stdout);
    const state = JSON.parse(await fs.readFile(statePath, "utf8"));
    const continuity = JSON.parse(await fs.readFile(continuityPath, "utf8"));
    return { report, state, continuity };
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

const defaultRun = await runIsolated({ repair: false });
assert.equal("nexoRuntimeSession" in defaultRun.report, false);
assert.equal(defaultRun.state.stateRevision, 1);
assert.equal(defaultRun.continuity.snapshot.effectJournal.length, 0);

const optInRun = await runIsolated({ repair: true });
assert.ok(optInRun.report.nexoRuntimeSession, "opt-in run must report the runtime session");
assert.equal(optInRun.report.nexoRuntimeSession.status, "settled_observed",
  JSON.stringify(optInRun.report.nexoRuntimeSession));
assert.equal(optInRun.report.stateRevision, optInRun.state.stateRevision);
assert.equal(optInRun.state.stateRevision, 2);
assert.equal(optInRun.continuity.snapshot.effectJournal.length, 1);
assert.equal(optInRun.continuity.snapshot.effectJournal[0].status, "settled_observed");
assert.equal("nexoMemory" in optInRun.state, false);

console.log("Nexo assistants CLI: default mode does not dispatch; opt-in repair session persists, settles, and reports final revision using isolated files.");
