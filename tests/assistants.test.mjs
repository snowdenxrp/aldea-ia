import assert from "node:assert/strict";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina } from "../src/assistants/index.js";

const simulation = createSimulation(structuredClone(world), structuredClone(createInitialAgents()));

const debug = runDebugger({ simulation });
assert.equal(debug.status, "ok");
assert.equal(simulation.agents.length, 2);

const test = runTester({ simulation, tick, moveAgent, setMovementTarget });
assert.equal(test.status, "pass", JSON.stringify(test, null, 2));

const analysis = analyzeLumina({ simulation, debuggerReport: debug, testerReport: test });
assert.notEqual(analysis.status, "error");

console.log("Lúmina assistants: todas las pruebas pasaron.");
