import assert from "node:assert/strict";
import { createVillageMaterials } from "../src/village-materials.js";

const materials=createVillageMaterials();
for(const key of ["ground","soil","wood","stone","roof","water","foliage"]){
  assert.ok(materials[key],`falta material ${key}`);
  assert.ok(materials[key].color,`material ${key} sin color`);
}
assert.ok(materials.water.roughness < materials.ground.roughness,"el agua debe ser visualmente más reflectiva que el terreno");
console.log(JSON.stringify({audit:"lumina-village-materials",families:Object.keys(materials),verdict:"PASS"},null,2));
