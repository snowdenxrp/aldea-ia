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
    memories: agent.memories.map(item => ({ ...item })),
    recentAction: agent.lastActionName ?? null
  };
}

export function survivalUrgency(needs) {
  return needPressure(needs.hunger) + needPressure(needs.thirst);
}

export function evaluateOptions(context, options) {
  return options
    .map(option => ({
      ...option,
      score: calculateScore(context, option)
    }))
    .sort((a, b) => b.score - a.score);
}

export function chooseOption(context, options, randomness = 0.12) {
  const evaluated = evaluateOptions(context, options);
  if (evaluated.length === 0) return null;

  const candidates = evaluated.slice(0, Math.min(4, evaluated.length));
  const weights = candidates.map(option => {
    const temperature = Math.max(0.05, option.explorationTemperature ?? 0.35);
    return Math.exp(Math.min(8, option.score / temperature));
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) return candidates[0];

  if (Math.random() >= randomness) return candidates[0];

  let pick = Math.random() * totalWeight;
  for (let index = 0; index < candidates.length; index += 1) {
    pick -= weights[index];
    if (pick <= 0) return candidates[index];
  }

  return candidates[candidates.length - 1];
}

function calculateScore(context, option) {
  let score = option.baseValue ?? 0;

  const survival = survivalUrgency(context.needs);
  if (survival > 70 && (option.effects?.hunger || option.effects?.thirst)) {
    score += (survival - 70) * 0.8;
  }

  if (option.effects?.hunger) {
    score += needPressure(context.needs.hunger) * option.effects.hunger;
  }

  if (option.effects?.thirst) {
    score += needPressure(context.needs.thirst) * option.effects.thirst;
  }

  if (option.effects?.energy) {
    score += energyPressure(context.needs.energy) * option.effects.energy;
  }

  if (option.effects?.social) {
    score += needPressure(context.needs.social) * option.effects.social;
  }

  if (option.knowledgeBonus) {
    score += option.knowledgeBonus(context.knowledge);
  }

  if (option.memoryBonus) {
    score += option.memoryBonus(context.memories);
  }

  if (option.explorationValue) {
    score += option.explorationValue * explorationPressure(context, option);
  }

  if (Number.isFinite(option.distance)) {
    // Viajar tiene un coste real. Las necesidades críticas pueden superar este coste.
    score -= Math.min(2.5, Math.max(0, option.distance) * 0.06);
  }

  if (context.recentAction === option.name) {
    const pressure = Math.max(
      needPressure(context.needs.hunger),
      needPressure(context.needs.thirst),
      energyPressure(context.needs.energy),
      needPressure(context.needs.social)
    );
    score -= pressure > 55 ? 0.35 : 2.5;
  }

  if (option.relationshipBonus) {
    score += option.relationshipBonus(context.relationships);
  }

  return score;
}

function needPressure(value) {
  const deficit = 100 - value;
  return deficit <= 0 ? 0 : deficit * (0.35 + deficit / 100);
}

function energyPressure(value) {
  const deficit = 100 - value;
  return deficit <= 0 ? 0 : deficit * (0.4 + deficit / 100);
}

function explorationPressure(context, option) {
  const novelty = option.novelty ?? 0.5;
  const knowledgeCount = context.knowledge.filter(item =>
    item.topic === option.knowledgeTopic
  ).length;
  const memoryPenalty = context.memories.filter(memory =>
    memory.description.toLowerCase().includes(option.memoryKeyword ?? "")
  ).length;
  return Math.max(0.15, novelty - knowledgeCount * 0.25 - Math.min(0.25, memoryPenalty * 0.03));
}
