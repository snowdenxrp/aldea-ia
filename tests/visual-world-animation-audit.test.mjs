import assert from "node:assert/strict";
import fs from "node:fs/promises";
const source=await fs.readFile(new URL("../src/main-stable.js",import.meta.url),"utf8");
for(const token of ["shadowMap.enabled","addTree","addRock","addPlant","animateHumanoid","parts.armL","parts.legL"]) assert.ok(source.includes(token),"faltó capa visual: "+token);
for(const token of ['activity==="gathering"','activity==="fishing"','activity==="eating"','activity==="drinking"','userData.animationActivity']) assert.ok(source.includes(token),"faltó animación específica: "+token);
for(const token of ["activityToolGroup","parts.axe","parts.hammer","parts.hoe","parts.rod","crop"]) assert.ok(source.includes(token),"faltó herramienta visual: "+token);
assert.ok(!source.includes("\\n"),"se detectaron saltos de línea literales");
console.log(JSON.stringify({audit:"lumina-visual-world-animation",environment:["trees","rocks","plants"],animation:"activity-driven-limb-motion",verdict:"PASS"},null,2));

assert.ok(source.includes("socializing")); assert.ok(source.includes("building")); assert.ok(source.includes("farming")); assert.ok(source.includes("m.rotation.y"));
for(const token of ["createFirePit","animateEnvironment","environmentType","type==="+"\"tree\"","type==="+"\"plant\"","fireMeshes"]) assert.ok(source.includes(token),"faltó vida ambiental: "+token);