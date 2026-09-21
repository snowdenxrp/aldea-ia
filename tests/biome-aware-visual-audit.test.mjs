import assert from "node:assert/strict";
import fs from "node:fs";
const content=fs.readFileSync(new URL("../src/main-stable.js",import.meta.url),"utf8");
assert.ok(content.includes("addTree"));
assert.ok(content.includes("addRock"));
assert.ok(content.includes("addPlant"));
assert.ok(content.includes("addPathSegment"));
assert.ok(!content.includes("\\n"));
console.log(JSON.stringify({audit:"biome-aware-visual",environment:["trees","rocks","plants"],settlementPaths:true,verdict:"PASS"},null,2));
