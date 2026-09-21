import assert from "node:assert/strict";
import fs from "node:fs/promises";
const source=await fs.readFile(new URL("../src/main-stable.js",import.meta.url),"utf8");
for(const token of [
  "CylinderGeometry(.42,.34,.72,12)",
  "const neck=new THREE.Mesh",
  "shoulderL",
  "earL",
  "eyeWhiteMat",
  "eyeWL",
  "const mouth=box",
  "kneeL",
  "cuffL"
]) assert.ok(source.includes(token),"faltó detalle anatómico: "+token);
assert.ok(source.includes("g.add(torso,collar,neck,pelvis,shoulderL,shoulderR"));
console.log(JSON.stringify({audit:"lumina-humanoid-visual-fidelity",details:["torso","neck","shoulders","ears","eyes","mouth","knees","cuffs"],verdict:"PASS"},null,2));
