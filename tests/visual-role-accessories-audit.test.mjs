import assert from "node:assert/strict";
import fs from "node:fs/promises";
const s=await fs.readFile(new URL("../src/main-stable.js",import.meta.url),"utf8");
for(const x of ["specialization?.role","accessoryGroup","role===\"farmer\"","role===\"builder\"||role===\"craftsperson\"","role===\"trader\"","role===\"gatherer\""]) assert.ok(s.includes(x),"falta accesorio visual: "+x);
assert.ok(!s.includes("\\n"),"saltos literales detectados");
console.log(JSON.stringify({audit:"visual-role-accessories",roles:["farmer","builder","craftsperson","trader","gatherer"],verdict:"PASS"},null,2));
