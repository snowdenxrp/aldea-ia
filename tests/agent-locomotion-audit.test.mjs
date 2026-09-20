import assert from "node:assert/strict";
const source=(await import("node:fs/promises")).readFile(new URL("../src/main-stable.js",import.meta.url),"utf8");
assert.ok(source.includes('for(const a of agents){if(a.currentIntent?.target)setMovementTarget(a,a.currentIntent.target,world.bounds);}tick(simulation'));
assert.ok(source.includes('a.worldBounds={minX:world.bounds.minX,maxX:world.bounds.maxX,minZ:world.bounds.minZ,maxZ:world.bounds.maxZ};'));
assert.ok(source.includes('moveAgent(a,dt);'));
console.log(JSON.stringify({audit:"agent-locomotion-bridge",preTickTargeting:true,worldBounds:true,perFrameMovement:true,verdict:"PASS"},null,2));
