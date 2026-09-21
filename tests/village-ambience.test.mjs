import assert from "node:assert/strict";
import { getVillageAmbienceConfig } from "../src/village-ambience.js";

const config=getVillageAmbienceConfig();
assert.ok(config.fog.near < config.fog.far,"la niebla debe tener rango válido");
assert.ok(config.sun.intensity > 0,"debe existir luz solar");
assert.ok(config.ambient.intensity > 0,"debe existir luz ambiental");
assert.ok(config.lamps.count >= 6,"la aldea debe tener iluminación local suficiente");
console.log(JSON.stringify({audit:"lumina-village-ambience",config,verdict:"PASS"},null,2));
