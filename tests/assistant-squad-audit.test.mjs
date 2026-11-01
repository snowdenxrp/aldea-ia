import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { world } from "../src/world.js";
import { runAssistantSquad } from "../src/assistants/squad.js";
import { applyState, persistState } from "../scripts/simulate.mjs";

const sim=createSimulation(structuredClone(world),structuredClone(createInitialAgents()));
const squad=runAssistantSquad({simulation:sim});
assert.equal(squad.reports.length,7);
assert.deepEqual(squad.reports.map(r=>r.assistant),["VisualAgent","ExplorerAgent","BehaviorAgent","RoutineAgent","EcosystemAgent","SocietyAgent","AuditAgent"]);
assert.ok(["ok","warning","error"].includes(squad.status));
console.log("Lúmina assistant squad audit: 5 especialistas + auditor coordinador verificados.");

// NCS regression: the Lúmina launcher must isolate its learning projection
// and preserve historical Nexo data as an opaque field, without normalizing it.
{
  const source = await fs.readFile(new URL("../scripts/assistants.mjs", import.meta.url), "utf8");
  assert.match(source, /const rawMemory = await readJson\(MEMORY_PATH, null\)/);
  assert.match(source, /runs: rawMemory\?\.runs,\s*lessons: rawMemory\?\.lessons,\s*patterns: rawMemory\?\.patterns/s);
  assert.match(source, /if \(rawMemory && Object\.hasOwn\(rawMemory, "nexo"\)\)\s*\{\s*learned\.nexo = structuredClone\(rawMemory\.nexo\);/s);
  assert.doesNotMatch(source, /createLearningMemory\(await readJson\(MEMORY_PATH, null\)\)/);
}

// NCS regression: simulation state must preserve legacy Nexo data opaquely,
// and must not create a Nexo field when none existed.
{
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ncs-lumina-state-"));
  const statePath = path.join(directory, "world-state.json");
  try {
    const legacyNexoMemory = {
      version: "historical-opaque",
      unknownField: { keep: ["exactly", 7, null] },
      missions: [{ missionId: "legacy-mission", status: "UNKNOWN" }]
    };
    const state = {
      version: 5,
      stateRevision: 0,
      day: 1,
      hour: 8,
      world: structuredClone(world),
      agents: structuredClone(createInitialAgents()),
      events: [],
      nexoMemory: legacyNexoMemory
    };
    const simulation = applyState(state);
    assert.deepEqual(simulation.legacyNexoMemory, legacyNexoMemory);
    const saved = await persistState(statePath, simulation, 123, {
      expectedRevision: 0,
      stateRevision: 1,
      loadCurrentState: async () => ({ stateRevision: 0 })
    });
    assert.deepEqual(saved.nexoMemory, legacyNexoMemory,
      "La persistencia de Lúmina debe conservar el subárbol histórico Nexo sin normalizarlo.");
    assert.deepEqual(JSON.parse(await fs.readFile(statePath, "utf8")).nexoMemory, legacyNexoMemory);

    const freshSimulation = applyState({
      version: 5, stateRevision: 0, day: 1, hour: 8,
      world: structuredClone(world), agents: structuredClone(createInitialAgents()), events: []
    });
    assert.equal(Object.hasOwn(freshSimulation, "legacyNexoMemory"), false,
      "Un estado nuevo no debe sembrar memoria Nexo.");
    const freshSaved = await persistState(path.join(directory, "fresh-state.json"), freshSimulation, 124, {
      expectedRevision: 0,
      stateRevision: 1,
      loadCurrentState: async () => ({ stateRevision: 0 })
    });
    assert.equal(Object.hasOwn(freshSaved, "nexoMemory"), false,
      "La persistencia no debe añadir nexoMemory cuando no existía.");
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

