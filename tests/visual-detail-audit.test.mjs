import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";

const source = await fs.readFile(new URL("../src/main-stable.js", import.meta.url), "utf8");
for (const token of ["createHouse", "createFarm", "createMesh", "CapsuleGeometry", "eyeL", "eyeR", "structureMeshes", "syncStructures"]) {
  assert.ok(source.includes(token), "faltó componente visual: " + token);
}
assert.ok(source.includes("new THREE.ConeGeometry"), "las estructuras necesitan techos");
assert.ok(source.includes("new THREE.BoxGeometry"), "las estructuras necesitan geometría constructiva");
assert.equal(createInitialAgents().length, 2);
assert.ok(world.bounds.maxX - world.bounds.minX >= 60);

console.log(JSON.stringify({
  audit: "lumina-visual-detail",
  characters: "humanoid-modular",
  structures: ["shelter", "farm"],
  verdict: "PASS"
}, null, 2));
