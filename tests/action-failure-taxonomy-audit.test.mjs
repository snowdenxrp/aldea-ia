import assert from "node:assert/strict";
import { createSimulation, tick } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world } from "../src/world.js";
const sim=createSimulation(structuredClone(world),structuredClone(createInitialAgents()));
const alex=sim.agents.find(a=>a.id==="alex");
alex.position={x:20,z:8}; alex.needs={hunger:70,thirst:80,energy:100,social:100,safety:100,health:100};
alex.knowledge=[{topic:"action:gather_wood",belief:"Puedo recolectar madera aquí.",confidence:.8,evidence:[],updatedOnDay:1}];
alex.currentIntent={name:"gather_wood",amount:1,baseValue:0,target:{...sim.world.resources.wood.position}};
sim.world.resources.wood.amount=0;
for(let i=0;i<50;i+=1){tick(sim,.01);if(alex.lastActionResult?.success===false)break;}
const belief=alex.knowledge.find(k=>k.topic==="action:gather_wood");
assert.equal(alex.lastActionResult?.reason,"no_wood");
assert.ok(belief);
assert.equal(belief.confidence,.8,"La ausencia del recurso no debe penalizar la creencia en la acción.");
console.log(JSON.stringify({audit:"lumina-action-failure-taxonomy",verdict:"PASS"},null,2));
