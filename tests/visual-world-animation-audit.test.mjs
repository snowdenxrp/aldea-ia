import assert from "node:assert/strict";
import fs from "node:fs/promises";
const source=await fs.readFile(new URL("../src/main-stable.js",import.meta.url),"utf8");
for(const token of ["shadowMap.enabled","addTree","addRock","addPlant","animateHumanoid","parts.armL","parts.legL"]) assert.ok(source.includes(token),"faltó capa visual: "+token);
assert.ok(!source.includes("\\n"),"se detectaron saltos de línea literales");
console.log(JSON.stringify({audit:"lumina-visual-world-animation",environment:["trees","rocks","plants"],animation:"activity-driven-limb-motion",verdict:"PASS"},null,2));
