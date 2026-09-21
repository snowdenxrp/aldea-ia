import assert from "node:assert/strict";
import { createMovementState, setMovementTarget, moveAgent } from "../src/movement.js";

const agent={alive:true,position:{x:1,z:2},movement:createMovementState()};
assert.equal(setMovementTarget(agent,{x:3,z:4}),true);
moveAgent(agent,0.1);
assert(Number.isFinite(agent.position.x)&&Number.isFinite(agent.position.z));

setMovementTarget(agent,{x:NaN,z:4});
assert.equal(agent.movement.moving,false,"un objetivo inválido no debe activar locomoción");

agent.position={x:NaN,z:Infinity};
setMovementTarget(agent,{x:4,z:4});
assert.deepEqual(agent.position,{x:0,z:0},"la locomoción debe recuperar una posición no finita");
moveAgent(agent,0.1);
assert(Number.isFinite(agent.position.x)&&Number.isFinite(agent.position.z));

console.log(JSON.stringify({audit:"movement-nonfinite-state",verdict:"PASS"},null,2));
