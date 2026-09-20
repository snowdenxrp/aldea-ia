import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";
import { getTerritorialContext, territorialActionBonus } from "../src/territorial.js";

const world=structuredClone(baseWorld);
const agents=createInitialAgents();
const context=getTerritorialContext(agents[0],world);
assert.ok(context.biome);
assert.ok(context.regionKey);
assert.ok(Number.isFinite(context.movement));
assert.ok(context.opportunities && typeof context.opportunities==="object");
assert.ok(Number.isFinite(territorialActionBonus({territory:context},"gather_wood")));
assert.ok(territorialActionBonus({territory:context},"gather_wood")>=0);
console.log(JSON.stringify({audit:"territorial-agency",biome:context.biome,region:context.regionKey,verdict:"PASS"},null,2));
