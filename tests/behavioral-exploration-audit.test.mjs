import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { moveAgent, setMovementTarget } from "../src/movement.js";
import { world } from "../src/world.js";

const sim=createSimulation(structuredClone(world),structuredClone(createInitialAgents()));
for(let step=0;step<280;step++){
  tick(sim,.2);
  for(const agent of sim.agents){
    if(agent.currentIntent?.target)setMovementTarget(agent,agent.currentIntent.target,sim.world.bounds);
    moveAgent(agent,.25);
  }
}
for(const agent of sim.agents){
  assert.ok(Number(agent.explorationState?.excursions??0)>=1,agent.id+" debe programar al menos una excursión autónoma");
  assert.ok(Number(agent.movement?.distanceTravelled??0)>10,agent.id+" debe recorrer distancia visible");
  assert.ok(Array.isArray(agent.exploredAreas),agent.id+" debe conservar memoria de exploración");
}
console.log(JSON.stringify({explorationDiagnostic:{knownRegions:sim.world.spatial?.knownRegions??[],positions:sim.agents.map(a=>({id:a.id,position:a.position,intent:a.currentIntent,activity:a.currentActivity,excursions:a.explorationState?.excursions,areas:a.exploredAreas}) )}},null,2));
assert.ok((sim.world.spatial?.knownRegions?.length??0)>=2,"la exploración debe ampliar el territorio conocido");
console.log(JSON.stringify({audit:"behavioral-exploration",agents:sim.agents.map(a=>({id:a.id,excursions:a.explorationState.excursions,distance:Number(a.movement.distanceTravelled.toFixed(1)),areas:a.exploredAreas.length})),knownRegions:sim.world.spatial.knownRegions.length,verdict:"PASS"},null,2));
