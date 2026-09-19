import assert from "node:assert/strict";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina, classifyRenderProbe } from "../src/assistants/index.js";
import { survivalUrgency } from "../src/decision.js";

const simulation = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));

const debug = runDebugger({ simulation });
assert.equal(debug.status, "ok");
assert.equal(simulation.agents.length, 2);

const test = runTester({ simulation, tick, moveAgent, setMovementTarget });
assert.equal(test.status, "pass", JSON.stringify(test, null, 2));

const analysis = analyzeLumina({ simulation, debuggerReport: debug, testerReport: test });
assert.notEqual(analysis.status, "error");

console.log("Lúmina assistants: todas las pruebas pasaron.");

assert.equal(classifyRenderProbe({ exists:false }), "MESH_MISSING");
assert.equal(classifyRenderProbe({ exists:true, inScene:false }), "NOT_IN_SCENE");
assert.equal(classifyRenderProbe({ exists:true, inScene:true, visible:false }), "HIDDEN");
assert.equal(classifyRenderProbe({ exists:true, inScene:true, visible:true, onScreen:false }), "OFFSCREEN");
assert.equal(classifyRenderProbe({ exists:true, inScene:true, visible:true, onScreen:true }), "OK");

assert(survivalUrgency({ hunger: 10, thirst: 80, energy: 80, social: 80 }) > survivalUrgency({ hunger: 80, thirst: 80, energy: 80, social: 80 }));
assert(survivalUrgency({ hunger: 10, thirst: 10, energy: 80, social: 80 }) > survivalUrgency({ hunger: 10, thirst: 80, energy: 80, social: 80 }));
