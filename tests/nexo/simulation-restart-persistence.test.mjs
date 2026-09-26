import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { world as defaultWorld } from "../../src/world.js";
import { createInitialAgents } from "../../src/agents.js";
import { createLearningMemory, recordNexoPlan, recordNexoOutcome, reconstructNexoMission } from "../../src/assistants/memory.js";
import { persistState, loadState, applyState } from "../../scripts/simulate.mjs";

const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lumina-nexo-restart-"));
const statePath = pathToFileURL(path.join(dir, "world-state.json"));
const mission = {
  version: 4,
  missionId: "persisted-restart-mission",
  parentMissionId: null,
  replanReason: null,
  objective: "repair_agent_state",
  status: "planned",
  steps: [{ id: "step-1", action: "repair_agent_state", target: "alex", status: "planned", dependsOn: [] }],
  generatedAt: "2026-09-26T00:00:00.000Z"
};

const memory = recordNexoOutcome(
  recordNexoPlan(createLearningMemory(), mission),
  {
    missionId: mission.missionId,
    stepId: "step-1",
    action: "repair_agent_state",
    target: "alex",
    status: "completed",
    evidence: { verified: true, kind: "agent-state", agentId: "alex" }
  }
);

const simulation = applyState({
  version: 5,
  savedAt: Date.now(),
  day: 7,
  hour: 12,
  world: structuredClone(defaultWorld),
  agents: createInitialAgents(),
  events: [{ id: "restart-event", type: "checkpoint", description: "before restart", participants: [] }],
  nexoMemory: memory
});
await persistState(statePath, simulation, 1234567890);

const raw = JSON.parse(await fs.readFile(statePath, "utf8"));
assert.equal(raw.version, 5);
assert.ok(raw.nexoMemory);
assert.equal(raw.nexoMemory.nexo.missions[0].missionId, mission.missionId);
assert.equal(raw.nexoMemory.nexo.attempts[0].status, "completed");

const restartedState = await loadState(statePath);
const restarted = applyState(restartedState);
const reconstructed = reconstructNexoMission(restarted.nexoMemory, mission.missionId);
assert.equal(restarted.day, 7);
assert.equal(restarted.hour, 12);
assert.equal(restarted.events[0].id, "restart-event");
assert.equal(reconstructed.steps[0].status, "completed");
assert.equal(reconstructed.status, "awaiting_verification");

await fs.rm(dir, { recursive: true, force: true });
console.log("Nexo: real file save -> restart -> reconstruct preserves mission memory and simulation state.");
