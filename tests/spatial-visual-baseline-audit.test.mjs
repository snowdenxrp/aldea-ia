import assert from "node:assert/strict";
import { createSimulation } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";

const simulation=createSimulation(structuredClone(baseWorld),structuredClone(createInitialAgents()));
assert.ok(simulation.world.bounds.maxX-simulation.world.bounds.minX >= 60,"el mundo perdió escala mínima");
assert.ok(simulation.world.bounds.maxZ-simulation.world.bounds.minZ >= 60,"el mundo perdió escala mínima");
assert.ok(simulation.agents.every(a=>Number.isFinite(a.position?.x)&&Number.isFinite(a.position?.z)),"hay posiciones inválidas");
assert.ok(simulation.agents.every(a=>a.position.x>=simulation.world.bounds.minX&&a.position.x<=simulation.world.bounds.maxX&&a.position.z>=simulation.world.bounds.minZ&&a.position.z<=simulation.world.bounds.maxZ),"habitante fuera del territorio");
console.log(JSON.stringify({audit:"lumina-spatial-visual-baseline",bounds:simulation.world.bounds,agents:simulation.agents.map(a=>({id:a.id,x:a.position.x,z:a.position.z})),verdict:"PASS"},null,2));
