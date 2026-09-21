import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { world } from "../src/world.js";

const sim=createSimulation(structuredClone(world),structuredClone(createInitialAgents()));
for(const a of sim.agents){a.needs={hunger:90,thirst:90,energy:90,social:90,safety:90,health:100};}
let seen=new Set();
for(let i=0;i<160;i++){tick(sim,.15);for(const a of sim.agents){if(a.currentActivity&&a.currentActivity!=="idle")seen.add(a.currentActivity);}}
assert.ok(seen.size>=2,"debe observarse más de una actividad a lo largo de la muestra");
assert.ok(sim.agents.every(a=>Number.isFinite(Number(a.activityRemainingHours))),"el temporizador de actividad debe permanecer válido");
console.log(JSON.stringify({audit:"behavioral-activity-routines",activities:[...seen],agents:sim.agents.map(a=>({id:a.id,last:a.lastActionName,activity:a.currentActivity})),verdict:"PASS"},null,2));
