import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { world } from "../../src/world.js";
import { createInitialAgents } from "../../src/agents.js";
import { openNexoContinuityOwner } from "../../scripts/nexo-continuity.mjs";
import { runNexoRuntimeRepairSession } from "../../scripts/nexo-runtime-session.mjs";

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
    const report = JSON.parse(child.stdout);
    // The fixture intentionally starts with an invalid agent position, so the
    // diagnostic report can set exitCode=1 even when the repair itself settles.
    assert.equal(child.status, report.status === "error" ? 1 : 0, child.stderr || child.stdout);
    const state = JSON.parse(await fs.readFile(statePath, "utf8"));
    const continuity = JSON.parse(await fs.readFile(continuityPath, "utf8"));
    let replay = null;
    if (repair) {
      // Option A excludes runtime repair effects in M0. Reopen the persisted
      // owner and confirm the same runtime gate still blocks without dispatch,
      // journal creation, or a second environment write.
      const reopened = await openNexoContinuityOwner({
        filePath: continuityPath,
        legacyMemory: null
      });
      replay = await runNexoRuntimeRepairSession({
        continuity: reopened,
        statePath
      });
      const afterReplayState = JSON.parse(await fs.readFile(statePath, "utf8"));
      const afterReplayContinuity = JSON.parse(await fs.readFile(continuityPath, "utf8"));
      assert.equal(afterReplayState.stateRevision, state.stateRevision,
        "excluded runtime repair must not write the environment again");
      assert.equal(afterReplayContinuity.snapshot.effectJournal.length, continuity.snapshot.effectJournal.length,
        "excluded runtime repair must not create an effect obligation");
      assert.equal(afterReplayContinuity.snapshot.effectJournal.length, 0);
      assert.equal(replay.status, "blocked");
      assert.equal(replay.code, "NEXO_M0_OPTION_A_EFFECT_EXCLUDED");
      assert.equal(replay.persisted, false);
      assert.equal(replay.dispatchAttempted, false);
    }
    return { report, state, continuity, replay };
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

const defaultRun = await runIsolated({ repair: false });
assert.equal("nexoRuntimeSession" in defaultRun.report, false);
assert.equal(defaultRun.state.stateRevision, 1);
assert.equal(defaultRun.continuity.snapshot.effectJournal.length, 0);

const optInRun = await runIsolated({ repair: true });
assert.ok(optInRun.report.nexoRuntimeSession, "opt-in run must report the runtime session gate");
assert.equal(optInRun.report.nexoRuntimeSession.status, "blocked",
  JSON.stringify(optInRun.report.nexoRuntimeSession));
assert.equal(optInRun.report.nexoRuntimeSession.code, "NEXO_M0_OPTION_A_EFFECT_EXCLUDED");
assert.equal(optInRun.report.nexoRuntimeSession.persisted, false);
assert.equal(optInRun.report.nexoRuntimeSession.dispatchAttempted, false);
assert.equal(optInRun.report.stateRevision, optInRun.state.stateRevision);
assert.equal(optInRun.state.stateRevision, 1);
assert.equal(optInRun.continuity.snapshot.effectJournal.length, 0);
assert.equal(optInRun.continuity.snapshot.missions.length, 1,
  "mission planning may persist while the protected repair effect remains excluded");
assert.equal("nexoMemory" in optInRun.state, false);
assert.equal(optInRun.replay.status, "blocked", JSON.stringify(optInRun.replay));
assert.equal(optInRun.replay.code, "NEXO_M0_OPTION_A_EFFECT_EXCLUDED");

console.log("Nexo assistants CLI: default mode does not dispatch; Option A opt-in remains blocked, creates no effect obligation, and does not rewrite the environment.");
