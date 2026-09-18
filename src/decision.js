// Sistema de decisión de Lúmina.
// Las necesidades crean presión; el conocimiento y la experiencia modifican
// cómo se valoran las oportunidades. No existe una historia prefijada.

export function createDecisionContext(agent, perception) {
  return {
    agentId: agent.id,
    needs: { ...agent.needs },
    perception,
    knowledge: agent.knowledge.map(item => ({ ...item })),
    relationships: agent.relationships.map(item => ({ ...item })),
    memories: agent.memories.map(item => ({ ...item }))
  };
}

export function evaluateOptions(context, options) {
  return options
    .map(option => ({
      ...option,
      score: calculateScore(context, option)
    }))
    .sort((a, b) => b.score - a.score);
}

export function chooseOption(context, options, randomness = 0.15) {
  const evaluated = evaluateOptions(context, options);
  if (evaluated.length === 0) return null;

  const candidates = evaluated.slice(0, Math.min(3, evaluated.length));
  const weighted = candidates.map(option => ({
    option,
    weight: Math.max(0.01, option.score)
  }));

  if (Math.random() < randomness && weighted.length > 1) {
    return weighted[Math.floor(Math.random() * weighted.length)].option;
  }

  return weighted[0].option;
}

function calculateScore(context, option) {
  let score = option.baseValue ?? 0;

  // Una necesidad baja genera presión hacia acciones que puedan aliviarla.
  if (option.effects?.hunger) {
    score += unmetNeed(context.needs.hunger) * option.effects.hunger;
  }

  if (option.effects?.thirst) {
    score += unmetNeed(context.needs.thirst) * option.effects.thirst;
  }

  if (option.effects?.energy) {
    score += energyDeficit(context.needs.energy) * option.effects.energy;
  }

  if (option.effects?.social) {
    score += unmetNeed(context.needs.social) * option.effects.social;
  }

  // La experiencia personal puede favorecer o desfavorecer una acción.
  if (option.knowledgeBonus) {
    score += option.knowledgeBonus(context.knowledge);
  }

  if (option.memoryBonus) {
    score += option.memoryBonus(context.memories);
  }

  return score;
}

function unmetNeed(value) {
  return 100 - value;
}

function energyDeficit(value) {
  return 100 - value;
}
