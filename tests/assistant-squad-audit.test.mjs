import assert from "node:assert/strict";
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
