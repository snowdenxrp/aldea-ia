import assert from "node:assert/strict";
import { world } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";

const source = await (await fetch("https://raw.githubusercontent.com/snowdenxrp/aldea-ia/feature/visual-structures-humanoids-detail/src/main-stable.js")).text();
const required = ["createHouse", "createFarm", "createMesh", "Torso", "CapsuleGeometry", "eyeL", "eyeR", "structureMeshes", "syncStructures"];
for (const token of required) assert.ok(source.includes(token), "faltó componente visual: " + token);
assert.ok(source.includes("new THREE.ConeGeometry"), "las estructuras necesitan techos visibles");
assert.ok(source.includes("new THREE.BoxGeometry"), "las estructuras necesitan geometría constructiva");
assert.ok(Array.isArray(createInitialAgents()), "los habitantes iniciales deben existir");
assert.ok(world.bounds.maxX - world.bounds.minX >= 60, "el territorio visual perdió escala");
console.log(JSON.stringify({ audit: "lumina-visual-detail", characters: "humanoid-modular", structures: ["shelter","farm"], verdict: "PASS" }, null, 2));
