import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { world } from "../src/world.js";

const agents = createInitialAgents();
const sim = createSimulation(structuredClone(world), structuredClone(agents));
const [alex, bruno] = sim.agents;

alex.position = { x: 20, z: 8 };
bruno.position = { x: 20, z: 8 };
alex.knowledge = [{ topic: "action:catch_fish", belief: "puedo pescar", confidence: 0.8, evidence: [] }];

const seen = new Set();

alex.currentIntent = { name: "share_knowledge" };
tick(sim, 0.1);
seen.add(alex.currentActivity);
assert.equal(alex.activitySequence?.phase, "teaching", "la rutina social debe avanzar a su fase de enseñanza");

tick(sim, 0.35);
seen.add(alex.currentActivity);
assert.equal(alex.currentIntent, null, "la rutina debe finalizar y ejecutar la acción");

alex.currentIntent = { name: "gather_wood", amount: 1 };
tick(sim, 0.1);
seen.add(alex.currentActivity);
assert.equal(alex.activitySequence?.intentName, "gather_wood", "la segunda actividad debe iniciar su propia rutina");
assert.ok(seen.size >= 2, "debe observarse más de una actividad a lo largo de la muestra");
assert.ok(sim.agents.every(a => Number.isFinite(Number(a.activityRemainingHours))), "el temporizador de actividad debe permanecer válido");

console.log(JSON.stringify({
  audit: "behavioral-activity-routines",
  activities: [...seen],
  agents: sim.agents.map(a => ({ id: a.id, last: a.lastActionName, activity: a.currentActivity })),
  verdict: "PASS"
}, null, 2));
