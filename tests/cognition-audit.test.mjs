import assert from "node:assert/strict";
import { createInitialAgents } from "../src/agents.js";
import { executeAction } from "../src/actions.js";
import { createSimulation, tick } from "../src/simulation.js";
import { world } from "../src/world.js";
import { evaluateOptions } from "../src/decision.js";
import { updateActionBelief } from "../src/discovery.js";
import { remember } from "../src/memory.js";
import { recordInteraction } from "../src/relationships.js";

function agent() {
  return createInitialAgents()[0];
}

{
  const a = agent();
  a.knowledge = [{ topic: "action:catch_fish", belief: "puedo pescar", confidence: 0.2, evidence: [] }];
  updateActionBelief(a, "catch_fish", 1, 1, "capturé un pez");
  assert(a.knowledge[0].confidence > 0.2);
  const before = a.knowledge[0].confidence;
  updateActionBelief(a, "catch_fish", -1, 2, "el pez escapó");
  assert(a.knowledge[0].confidence < before);
}

{
  const a = agent();
  a.knowledge = [{ topic: "action:catch_fish", belief: "puedo pescar", confidence: 0.5, evidence: [] }];
  const context = { agentId: a.id, needs: { ...a.needs }, perception: { visibleAgents: [], nearbyResources: [] }, knowledge: a.knowledge, relationships: [], memories: [], recentAction: null, recentActionResult: null };
  const withoutMemory = evaluateOptions(context, [{ name: "catch_fish", baseValue: 0, effects: { hunger: 1 }, distance: 0 }])[0].score;
  remember(a, { id: "m1", day: 1, type: "experience", topic: "action:catch_fish", description: "capturé un pez", importance: 1, emotionalWeight: 0.1 });
  const withMemory = evaluateOptions({ ...context, memories: a.memories }, [{ name: "catch_fish", baseValue: 0, effects: { hunger: 1 }, distance: 0 }])[0].score;
  assert(withMemory > withoutMemory, "Un recuerdo positivo de la acción debe aumentar su valoración.");
  const failed = structuredClone(context);
  failed.memories = [{ id: "m2", day: 2, type: "experience", topic: "action:catch_fish", description: "el pez escapó", importance: 1, emotionalWeight: -0.2 }];
  const withFailureMemory = evaluateOptions(failed, [{ name: "catch_fish", baseValue: 0, effects: { hunger: 1 }, distance: 0 }])[0].score;
  assert(withFailureMemory < withoutMemory, "Un recuerdo negativo de la acción debe reducir su valoración.");
}

{
  const sim = createSimulation(structuredClone(world), [agent()], { random: () => 0.8 });
  const a = sim.agents[0];
  const first = executeAction(sim, a, { name: "catch_fish", amount: 1 });
  assert.equal(first.success, false, "Con habilidad 0, 0.8 debe superar la probabilidad inicial.");
  a.skills.push({ name: "catch_fish", level: 1, learnedOnDay: 1 });
  const second = executeAction(sim, a, { name: "catch_fish", amount: 1 });
  assert.equal(second.success, true, "La habilidad adquirida debe aumentar causalmente la probabilidad de éxito.");
}

{
  const source = agent();
  const recipient = createInitialAgents()[1];
  source.position = { x: 0, z: 0 };
  recipient.position = { x: 0, z: 0 };
  source.knowledge = [{ topic: "action:catch_fish", belief: "puedo pescar", confidence: 0.8, evidence: [] }];
  const sim = createSimulation(structuredClone(world), [source, recipient], { random: () => 0 });
  source.currentIntent = { name: "share_knowledge" };
  tick(sim, 0.01);
  const learned = recipient.knowledge.find(item => item.topic === "action:catch_fish");
  assert(learned, "El conocimiento compartido debe llegar al receptor.");
  assert(learned.confidence > 0.1, "La evidencia social debe modificar la confianza del receptor.");
}

{
  const a = agent();
  for (let i = 0; i < 700; i += 1) {
    a.knowledge.push({ topic: "action:test-" + i, belief: "x", confidence: 0.5, evidence: [] });
    updateActionBelief(a, "test-" + i, 1, i, "evidencia");
  }
  assert(a.knowledge.every(item => item.evidence.length <= 500));
}

{
  const a = agent();
  const b = createInitialAgents()[1];
  for (let i = 0; i < 1100; i += 1) {
    recordInteraction(a, b, { day: i + 1, type: "test", description: "interacción", trust: 0.01 });
  }
  assert.equal(a.relationships[0].history.length, 1000);
  assert(a.relationships[0].trust <= 1);
  assert(a.relationships[0].familiarity <= 1);
}

console.log("Lúmina cognition audit: aprendizaje, memoria y habilidades verificadas.");
