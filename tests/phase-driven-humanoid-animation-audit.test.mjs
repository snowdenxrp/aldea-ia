import assert from "node:assert/strict";
import fs from "node:fs/promises";

const source=await fs.readFile(new URL("../src/main-stable.js",import.meta.url),"utf8");

for(const phase of ["approach","inspect","collect","cast","wait","discover","prepare","construct","craft","plant","harvest","talk","teach","work","exchange"]) {
  assert.ok(source.includes('phase==="'+phase+'"'), "faltó animación específica para fase: "+phase);
}

for(const token of [
  "m.userData.animationActivity=activity",
  "m.userData.animationPhase=phase",
  "p.axe.visible",
  "p.hammer.visible",
  "p.hoe.visible",
  "p.rod.visible",
  "p.crop.visible",
  "p.basketLoad.visible"
]) assert.ok(source.includes(token), "faltó integración visual: "+token);

console.log(JSON.stringify({
  audit:"lumina-phase-driven-humanoid-animation",
  phases:["approach","inspect","collect","cast","wait","discover","prepare","construct","craft","plant","harvest","talk","teach","work","exchange"],
  verdict:"PASS"
},null,2));
