import assert from "node:assert/strict";
import { createAgent } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { normalizeSpecializationWorld, normalizeSpecializationAgent, advanceSpecializationDay, getSpecializationSummary } from "../src/specialization.js";

const world = { day: 10, timeOfDay: 8, resources: {} };
const teacher = createAgent({ id: "teacher", name: "Maestra", age: 30, position: { x: 0, z: 0 } });
const child = createAgent({ id: "child", name: "Aprendiz", age: 8, position: { x: 1, z: 1 } });
teacher.skills = [{ name: "farm", level: 0.9 }, { name: "harvest", level: 0.8 }];
teacher.relationships = [{ agentId: "child", trust: 0.8, familiarity: 0.8 }];
child.relationships = [{ agentId: "teacher", trust: 0.8, familiarity: 0.8 }];
const sim = createSimulation(world, [teacher, child], { random: () => 0.5 });
normalizeSpecializationWorld(world); normalizeSpecializationAgent(teacher); normalizeSpecializationAgent(child);
advanceSpecializationDay(sim);
assert.equal(teacher.specialization.role, "farmer");
assert.equal(getSpecializationSummary(teacher).label, "Agricultor");
// La mentoría se ejecuta durante el ciclo social; reproducimos un día completo.
sim.hour = 23.99;
sim.day = 10;
sim.world.day = 10;
const { advanceSocietyDay } = await import("../src/society.js");
advanceSocietyDay(sim);
assert.ok((child.skills.find(s => s.name === "farm")?.level ?? 0) > 0, "el aprendiz debe recibir una habilidad por mentoría");
assert.ok(child.specialization.mentorship.learned > 0, "debe registrarse aprendizaje");
console.log("Specialization audit OK");
