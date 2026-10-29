import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { world } from "../src/world.js";
import { runAssistantSquad } from "../src/assistants/squad.js";

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

