// Memoria y aprendizaje de Lúmina.
// Este sistema registra lo que ocurrió y permite actualizar creencias
// a partir de evidencia. No decide qué debe hacer un habitante.

const MAX_MEMORIES = 2000;
const MAX_EVIDENCE_PER_KNOWLEDGE = 500;

export function remember(agent, event) {
  const memory = {
    id: event.id,
    day: event.day,
    type: event.type,
    description: event.description,
    participants: event.participants ?? [],
    emotionalWeight: clamp(event.emotionalWeight ?? 0, -1, 1),
    importance: clamp(event.importance ?? 0.5, 0, 1)
  };

  agent.memories.push(memory);
  trimMemories(agent);
  return memory;
}

// Una experiencia aporta evidencia a una creencia existente o crea una nueva.
// La confianza nunca se convierte directamente en certeza absoluta.
export function learnFromEvidence(agent, evidence) {
  const topic = evidence.topic;
  const existing = agent.knowledge.find(item => item.topic === topic);

  const reliability = clamp(evidence.reliability ?? 0.5, 0, 1);
  const outcome = clamp(evidence.outcome ?? 0, -1, 1);
  const amount = 0.15 * reliability;

  if (!existing) {
    const initialConfidence = 0.1 + Math.abs(outcome) * amount;

    agent.knowledge.push({
      topic,
      belief: evidence.belief,
      confidence: clamp(initialConfidence, 0, 0.95),
      evidence: [createEvidenceRecord(evidence)],
      source: evidence.source ?? "experience",
      learnedOnDay: evidence.day ?? null
    });

    return agent.knowledge.at(-1);
  }

  existing.evidence.push(createEvidenceRecord(evidence));
  if (existing.evidence.length > MAX_EVIDENCE_PER_KNOWLEDGE) {
    existing.evidence = existing.evidence.slice(-MAX_EVIDENCE_PER_KNOWLEDGE);
  }

  // Evidencia favorable aumenta confianza; evidencia contraria la reduce.
  // La actualización es gradual para evitar que un único evento cree certeza.
  if (outcome > 0) {
    existing.confidence += amount * (1 - existing.confidence);
  } else if (outcome < 0) {
    existing.confidence -= amount * existing.confidence;
  }

  existing.confidence = clamp(existing.confidence, 0, 0.95);
  existing.learnedOnDay = evidence.day ?? existing.learnedOnDay;

  return existing;
}

export function recallRelevantMemories(agent, topic, limit = 5) {
  return agent.memories
    .filter(memory =>
      memory.description.toLowerCase().includes(topic.toLowerCase())
    )
    .sort((a, b) => {
      const importanceDifference = b.importance - a.importance;
      if (importanceDifference !== 0) return importanceDifference;
      return b.day - a.day;
    })
    .slice(0, limit);
}

function createEvidenceRecord(evidence) {
  return {
    day: evidence.day ?? null,
    description: evidence.description,
    outcome: clamp(evidence.outcome ?? 0, -1, 1),
    reliability: clamp(evidence.reliability ?? 0.5, 0, 1)
  };
}

function trimMemories(agent) {
  if (agent.memories.length <= MAX_MEMORIES) return;
  const ranked = agent.memories
    .map((memory, index) => ({ memory, index }))
    .sort((a, b) => {
      const importance = b.memory.importance - a.memory.importance;
      if (importance !== 0) return importance;
      return b.memory.day - a.memory.day;
    });
  const keep = new Set(ranked.slice(0, MAX_MEMORIES).map(item => item.index));
  agent.memories = agent.memories.filter((_, index) => keep.has(index));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
