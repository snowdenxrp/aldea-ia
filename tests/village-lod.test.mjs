import assert from "node:assert/strict";
import { getVillageDetailLevel, applyVillageDetailLevel } from "../src/village-lod.js";
import { readFileSync } from "node:fs";

assert.equal(getVillageDetailLevel(8),"close");
assert.equal(getVillageDetailLevel(35),"medium");
assert.equal(getVillageDetailLevel(90),"far");

const nodes=[
  {userData:{detailLevel:"far"},visible:true},
  {userData:{detailLevel:"medium"},visible:true},
  {userData:{detailLevel:"close"},visible:true}
];
const root={userData:{},traverse(fn){for(const n of nodes)fn(n);}};
applyVillageDetailLevel(root,"medium");
assert.deepEqual(nodes.map(n=>n.visible),[true,true,false],"medium debe conservar capas medium/far y ocultar close");
assert.equal(root.userData.lodLevel,"medium");

const source=readFileSync(new URL("../src/main-stable.js",import.meta.url),"utf8");
for(const token of [
  'import { getVillageDetailLevel, applyVillageDetailLevel } from "./village-lod.js";',
  'const villageRoot=buildVillage(scene);',
  'applyVillageDetailLevel(villageRoot,level)',
  'getVillageDetailLevel(cameraDistance)'
]) assert.ok(source.includes(token),"renderer LOD integration missing: "+token);

console.log(JSON.stringify({audit:"lumina-village-lod",levels:["close","medium","far"],integration:"live-renderer",verdict:"PASS"},null,2));
