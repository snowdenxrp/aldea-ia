// Relaciones sociales de Lúmina.
// Una relación nace de interacciones reales y cambia con la experiencia.
// No asignamos amistad, rivalidad o afecto de antemano.

export function createRelationship(agentId) {
  return {
    agentId,
    familiarity: 0,
    trust: 0,
    cooperation: 0,
    tension: 0,
    affection: 0,
    resentment: 0,
    history: []
  };
}

export function getOrCreateRelationship(agent, otherAgentId) {
  agent.relationships ??= [];
  let relationship = agent.relationships.find(
    item => item.agentId === otherAgentId
  );

  if (!relationship) {
    relationship = createRelationship(otherAgentId);
    agent.relationships.push(relationship);
  }

  return relationship;
}

const MAX_RELATIONSHIP_HISTORY = 1000;

// Registra una interacción real entre dos habitantes.
// Los valores recibidos representan el resultado observado de la interacción;
// este módulo no decide por qué ocurrió ni qué deben hacer después.
export function recordInteraction(agent, otherAgent, interaction) {
  const relationship = getOrCreateRelationship(agent, otherAgent.id);

  const change = {
    day: interaction.day ?? null,
    type: interaction.type,
    description: interaction.description,
    trust: interaction.trust ?? 0,
    cooperation: interaction.cooperation ?? 0,
    tension: interaction.tension ?? 0,
    affection: interaction.affection ?? 0,
    resentment: interaction.resentment ?? 0
  };

  relationship.history.push(change);
  if (relationship.history.length > MAX_RELATIONSHIP_HISTORY) relationship.history = relationship.history.slice(-MAX_RELATIONSHIP_HISTORY);
  relationship.familiarity = clamp(relationship.familiarity + 0.08, 0, 1);
  relationship.trust = clamp(relationship.trust + change.trust, -1, 1);
  relationship.cooperation = clamp(relationship.cooperation + change.cooperation, -1, 1);
  relationship.tension = clamp(relationship.tension + change.tension, 0, 1);
  relationship.affection = clamp(relationship.affection + change.affection, -1, 1);
  relationship.resentment = clamp(relationship.resentment + change.resentment, 0, 1);

  return relationship;
}

export function relationshipSummary(agent, otherAgentId) {
  const relationship = agent.relationships.find(
    item => item.agentId === otherAgentId
  );

  if (!relationship) {
    return null;
  }

  return {
    familiarity: relationship.familiarity,
    trust: relationship.trust,
    cooperation: relationship.cooperation,
    tension: relationship.tension,
    affection: relationship.affection,
    resentment: relationship.resentment,
    interactions: relationship.history.length
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
