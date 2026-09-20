import assert from "node:assert/strict";
import { createSimulation, tick } from "../src/simulation.js";
import { createInitialAgents } from "../src/agents.js";
import { world as baseWorld } from "../src/world.js";
import { createSeededRandom } from "../src/random.js";
import { getResearchTopics, researchSummary } from "../src/research.js";

const clone = value => structuredClone(value);

function run(days = 120) {
  const simulation = createSimulation(
    clone(baseWorld),
    clone(createInitialAgents()),
    { random: createSeededRandom("lumina-research-audit:" + days) }
  );
  for (let hour = 0; hour < days * 24; hour += 1) tick(simulation, 1);
  return simulation;
}

const simulation = run();
const research = simulation.world.research;
const summary = researchSummary(simulation.world);

assert.ok(research && Array.isArray(research.topics), "falta contenedor de investigación");
assert.ok(Array.isArray(research.experiments), "faltan experimentos");
assert.ok(Array.isArray(research.evidence), "falta evidencia");
assert.ok(summary.topics > 0, "no surgieron problemas de investigación");
assert.ok(summary.experiments > 0, "no se realizaron experimentos");
assert.ok(summary.evidence > 0, "no se acumuló evidencia");

for (const topic of research.topics) {
  assert.ok(topic.id && topic.question && topic.hypothesis, "tema de investigación incompleto");
  assert.ok(topic.confidence >= 0 && topic.confidence <= 0.95, "confianza fuera de rango");
  assert.ok(topic.experimentCount >= 0, "conteo de experimentos inválido");
  assert.ok(Array.isArray(topic.contributors), "contribuyentes inválidos");
}

for (const experiment of research.experiments) {
  assert.ok(experiment.agentId && experiment.topicId, "experimento sin autor o tema");
  assert.ok(Number.isFinite(experiment.baseline), "línea base inválida");
  assert.ok(Number.isFinite(experiment.result), "resultado inválido");
  assert.ok(typeof experiment.supported === "boolean", "resultado experimental inválido");
}

for (const evidence of research.evidence) {
  assert.ok(evidence.reliability >= 0 && evidence.reliability <= 0.9, "fiabilidad fuera de rango");
  assert.ok(typeof evidence.supported === "boolean", "evidencia inválida");
}

const researchAgents = simulation.agents.filter(agent => agent.researchKnowledge?.length);
assert.ok(researchAgents.length > 0, "ningún habitante conservó conocimiento de investigación");

const topicIds = new Set(research.topics.map(topic => topic.id));
for (const agent of simulation.agents) {
  for (const item of agent.researchKnowledge ?? []) {
    assert.ok(topicIds.has(item.topicId), "conocimiento de investigación huérfano");
    assert.ok(item.confidence >= 0 && item.confidence <= 0.95, "confianza individual inválida");
  }
}

const longSimulation = run(600);
const longSummary = researchSummary(longSimulation.world);
assert.ok(longSummary.experiments >= summary.experiments, "la investigación no se conserva a largo plazo");
assert.ok(longSummary.reproducedTopics >= 0, "reproducción inválida");

const probe = longSimulation.agents.find(agent => agent.alive && agent.specialization?.role);
if (probe) {
  const topics = getResearchTopics(probe, longSimulation.world);
  assert.ok(Array.isArray(topics), "getResearchTopics no devuelve una colección");
  if (topics.length) assert.ok(topics[0].domain, "tema sin dominio");
}

console.log(JSON.stringify({
  audit: "lumina-research-experimentation",
  summary,
  longRun: longSummary,
  agentsWithResearchKnowledge: researchAgents.length,
  verdict: "PASS"
}, null, 2));
