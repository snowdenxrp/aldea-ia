// Descubrimiento de posibilidades en Lúmina.
// Los habitantes no nacen con conocimiento de las acciones del mundo.
// Una posibilidad aparece cuando tienen una experiencia que puede revelar una acción.

export function discoverAction(agent, discovery) {
  if (!discovery || !discovery.actionName) return false;

  const alreadyKnown = agent.knowledge.some(
    item => item.topic === "action:" + discovery.actionName
  );

  if (alreadyKnown) return false;

  agent.knowledge.push({
    topic: "action:" + discovery.actionName,
    belief: discovery.belief ?? ("Creo que puedo " + discovery.actionName),
    confidence: Math.max(0.1, Math.min(0.8, discovery.confidence ?? 0.2)),
    evidence: [{
      day: discovery.day ?? null,
      description: discovery.evidence ?? "Experiencia propia",
      outcome: discovery.outcome ?? 0,
      reliability: discovery.reliability ?? 0.5
    }],
    source: "discovery",
    learnedOnDay: discovery.day ?? null
  });

  return true;
}

export function getKnownActions(agent) {
  return agent.knowledge
    .filter(item => item.topic.startsWith("action:"))
    .map(item => ({
      name: item.topic.replace("action:", ""),
      confidence: item.confidence,
      belief: item.belief
    }));
}

export function updateActionBelief(agent, actionName, outcome, day, description) {
  const knowledge = agent.knowledge.find(
    item => item.topic === "action:" + actionName
  );

  if (!knowledge) return null;

  const reliability = 0.5;
  if (outcome > 0) {
    knowledge.confidence += 0.1 * reliability * (1 - knowledge.confidence);
  } else if (outcome < 0) {
    knowledge.confidence -= 0.1 * reliability * knowledge.confidence;
  }

  knowledge.confidence = Math.max(0, Math.min(0.95, knowledge.confidence));
  knowledge.evidence.push({
    day,
    description,
    outcome,
    reliability
  });

  return knowledge;
}
