import assert from "node:assert/strict";
import { getVillageDetailLevel } from "../src/village-lod.js";

assert.equal(getVillageDetailLevel(8),"close");
assert.equal(getVillageDetailLevel(35),"medium");
assert.equal(getVillageDetailLevel(90),"far");
console.log(JSON.stringify({audit:"lumina-village-lod",levels:["close","medium","far"],verdict:"PASS"},null,2));
