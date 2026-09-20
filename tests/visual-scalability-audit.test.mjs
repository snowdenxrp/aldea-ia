import assert from "node:assert/strict";
const source=await (await fetch(new URL("../src/main-stable.js",import.meta.url))).text();
assert.ok(source.includes("syncSettlementVisualState"));
assert.ok(source.includes("getRegionKeyForVisual"));
assert.ok(!source.includes("g.frustumCulled=false"));
assert.ok(!source.includes("o.frustumCulled=false"));
console.log(JSON.stringify({audit:"visual-scalability",culling:"default",settlementState:"connected",verdict:"PASS"},null,2));
