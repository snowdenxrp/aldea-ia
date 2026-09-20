// Investigación y experimentación de Lúmina.
// Las hipótesis nacen de problemas observables y solo ganan confianza
// cuando distintos habitantes repiten mediciones sobre variables reales del mundo.

const MAX_TOPICS = 80;
const MAX_EXPERIMENTS = 600;
const MAX_EVIDENCE = 120;

const TOPIC_DEFINITIONS = {
  farmer: [
    { id: "soil-yield", domain: "agriculture", question: "¿La calidad del suelo cambia de forma medible el rendimiento?", variable: "soilQuality", measure: "farmYield", hypothesis: "Un suelo de mayor calidad produce más alimento." }
  ],
  builder: [
    { id: "shelter-durability", domain: "construction", question: "¿La experiencia de construcción puede aumentar la resistencia de un refugio?", variable: "buildSkill", measure: "shelterDurability", hypothesis: "Una mayor experiencia de construcción produce refugios más resistentes." }
  ],
  craftsperson: [
    { id: "tool-durability", domain: "tools", question: "¿La experiencia y los materiales pueden prolongar la vida útil de una herramienta?", variable: "toolSkill", measure: "toolDurability", hypothesis: "Una herramienta fabricada con mayor habilidad dura más." }
  ],
  gatherer: [
    { id: "resource-regeneration", domain: "ecology", question: "¿La presión sobre un recurso afecta su recuperación?", variable: "humanPressure", measure: "regeneration", hypothesis: "Una presión humana mayor reduce la recuperación de recursos." }
  ],
  trader: [
    { id: "scarcity-price", domain: "economy", question: "¿La escasez relativa cambia el precio de un bien?", variable: "stockPerCapita", measure: "price", hypothesis: "Una menor disponibilidad relativa aumenta el precio." }
  ]
};

export function normalizeResearchWorld(world) {
  world.research ??= { topics: [], experiments: [], evidence: [], history: [] };
  world.research.topics ??= [];
  world.research.experiments ??= [];
  world.research.evidence ??= [];
  world.research.history ??= [];
  return world.research;
}

export function normalizeResearchAgent(agent) {
  agent.researchKnowledge ??= [];
  agent.researchExperiments ??= 0;
  return agent.researchKnowledge;
}

export function getResearchTopics(agent, world) {
  normalizeResearchAgent(agent);
  const role = agent.specialization?.role;
  const definitions = TOPIC_DEFINITIONS[role] ?? [];
  return definitions.filter(definition => isTopicRelevant(definition, world));
}

export function advanceResearchDay(simulation) {
  const research = normalizeResearchWorld(simulation.world);
  const alive = simulation.agents.filter(agent => agent?.alive);
  for (const agent of alive) normalizeResearchAgent(agent);

  const contributorsToday = new Set();
  for (const agent of alive) {
    const topics = getResearchTopics(agent, simulation.world);
    if (!topics.length) continue;

    const topic = topics[0];
    const record = getOrCreateTopic(research, topic, simulation.day);
    const evidence = runResearchExperiment(simulation, agent, topic);
    if (!evidence) continue;

    record.experimentCount += 1;
    record.lastExperimentDay = simulation.day;
    if (!record.contributors.includes(agent.id)) record.contributors.push(agent.id);
    record.contributors = record.contributors.slice(-24);

    research.experiments.push(evidence.experiment);
    research.evidence.push(evidence.record);
    contributorsToday.add(agent.id);

    updateResearchConfidence(record);
    updateAgentResearchKnowledge(agent, record, evidence.record);
    agent.researchExperiments += 1;

    if (research.experiments.length > MAX_EXPERIMENTS) research.experiments = research.experiments.slice(-MAX_EXPERIMENTS);
    if (research.evidence.length > MAX_EVIDENCE) research.evidence = research.evidence.slice(-MAX_EVIDENCE);

    simulation.events.push({
      id: "research-event-" + simulation.events.length,
      day: simulation.day,
      hour: 0,
      type: "research_experiment",
      description: agent.name + " realizó un experimento sobre " + topic.id + " y obtuvo evidencia " + (evidence.record.supported ? "favorable" : "contraria") + ".",
      participants: [agent.id]
    });
  }

  if (contributorsToday.size > 0) {
    research.history.push({
      day: simulation.day,
      type: "research_day",
      contributors: [...contributorsToday]
    });
    if (research.history.length > 300) research.history = research.history.slice(-300);
  }

  trimTopics(research);
}

export function runResearchExperiment(simulation, agent, topic) {
  const before = measureTopic(simulation, agent, topic);
  if (!before) return null;

  const intervention = interventionFor(topic, before);
  if (!intervention) return null;

  const after = measureIntervention(simulation, agent, topic, before, intervention);
  if (!after) return null;

  const predictedDirection = topic.id === "resource-regeneration" || topic.id === "scarcity-price"
    ? (topic.id === "resource-regeneration" ? "negative" : "negative")
    : "positive";
  const delta = after.value - before.value;
  const supported = predictedDirection === "positive" ? delta > 0.0001 : delta < -0.0001;
  const strength = Math.min(1, Math.abs(delta) / Math.max(0.01, Math.abs(before.value) + 0.01));

  const experimentId = "experiment-" + simulation.day + "-" + agent.id + "-" + topic.id;
  const record = {
    id: experimentId + "-evidence",
    experimentId,
    day: simulation.day,
    topicId: topic.id,
    agentId: agent.id,
    variable: topic.variable,
    baseline: round(before.value),
    intervention: intervention.label,
    result: round(after.value),
    delta: round(delta),
    supported,
    reliability: Math.min(0.9, 0.45 + strength * 0.35)
  };

  return {
    record,
    experiment: {
      id: experimentId,
      day: simulation.day,
      topicId: topic.id,
      question: topic.question,
      hypothesis: topic.hypothesis,
      agentId: agent.id,
      variable: topic.variable,
      baseline: round(before.value),
      intervention: intervention.label,
      result: round(after.value),
      supported,
      reproducible: false
    }
  };
}

export function recordResearchEvidence(world, evidence) {
  const research = normalizeResearchWorld(world);
  research.evidence.push({ ...evidence });
  if (research.evidence.length > MAX_EVIDENCE) research.evidence = research.evidence.slice(-MAX_EVIDENCE);
  const topic = research.topics.find(item => item.id === evidence.topicId);
  if (topic) {
    if (!topic.contributors.includes(evidence.agentId)) topic.contributors.push(evidence.agentId);
    topic.experimentCount += 1;
    updateResearchConfidence(topic);
  }
  return evidence;
}

export function researchSummary(world) {
  const research = normalizeResearchWorld(world);
  return {
    topics: research.topics.length,
    experiments: research.experiments.length,
    evidence: research.evidence.length,
    reproducedTopics: research.topics.filter(topic => topic.contributors.length >= 2).length,
    strongest: [...research.topics].sort((a, b) => b.confidence - a.confidence).slice(0, 5).map(topic => ({
      id: topic.id,
      confidence: topic.confidence,
      contributors: topic.contributors.length,
      experiments: topic.experimentCount
    }))
  };
}

function getOrCreateTopic(research, definition, day) {
  let topic = research.topics.find(item => item.id === definition.id);
  if (topic) return topic;
  topic = {
    id: definition.id,
    domain: definition.domain,
    question: definition.question,
    hypothesis: definition.hypothesis,
    variable: definition.variable,
    measure: definition.measure,
    confidence: 0.1,
    experimentCount: 0,
    contributors: [],
    createdDay: day,
    lastExperimentDay: null,
    status: "open"
  };
  research.topics.push(topic);
  return topic;
}

function updateResearchConfidence(topic) {
  const independent = Math.min(1, topic.contributors.length / 4);
  const repetition = Math.min(1, topic.experimentCount / 8);
  topic.confidence = Math.max(0, Math.min(0.95, 0.1 + independent * 0.35 + repetition * 0.4));
  if (topic.contributors.length >= 2 && topic.experimentCount >= 4) topic.status = "reproduced";
  else if (topic.experimentCount >= 2) topic.status = "tested";
}

function updateAgentResearchKnowledge(agent, topic, evidence) {
  const existing = agent.researchKnowledge.find(item => item.topicId === topic.id);
  const entry = existing ?? {
    topicId: topic.id,
    belief: topic.hypothesis,
    confidence: 0.1,
    evidenceCount: 0,
    lastTestedDay: null
  };
  entry.evidenceCount += 1;
  entry.lastTestedDay = evidence.day;
  if (evidence.supported) entry.confidence += 0.08 * (1 - entry.confidence);
  else entry.confidence -= 0.05 * entry.confidence;
  entry.confidence = Math.max(0, Math.min(0.95, entry.confidence));
  if (!existing) agent.researchKnowledge.push(entry);
  if (agent.researchKnowledge.length > 24) agent.researchKnowledge = agent.researchKnowledge.slice(-24);
}

function isTopicRelevant(definition, world) {
  if (definition.id === "soil-yield") return Number(world.ecosystem?.soilQuality ?? 0) > 0;
  if (definition.id === "shelter-durability") return true;
  if (definition.id === "tool-durability") return true;
  if (definition.id === "resource-regeneration") return Object.keys(world.resources ?? {}).length > 0;
  if (definition.id === "scarcity-price") return Boolean(world.economy);
  return false;
}

function measureTopic(simulation, agent, topic) {
  if (topic.id === "soil-yield") {
    const soil = Number(simulation.world.ecosystem?.soilQuality ?? 0);
    return { value: Math.max(0, 1.5 * soil) };
  }
  if (topic.id === "shelter-durability") {
    const skill = Number(agent.skills?.find(skill => skill.name === "build_shelter")?.level ?? 0);
    return { value: 20 * (1 + skill * 0.5) };
  }
  if (topic.id === "tool-durability") {
    const skill = Number(agent.skills?.find(skill => skill.name === "toolmaking")?.level ?? 0);
    return { value: 20 * (1 + skill * 0.5) };
  }
  if (topic.id === "resource-regeneration") {
    const pressure = Number(simulation.world.ecosystem?.humanPressure ?? 0);
    return { value: Math.max(0, 1 - pressure) };
  }
  if (topic.id === "scarcity-price") {
    const food = Number(simulation.world.economy?.priceMemory?.farm_food ?? 3);
    return { value: food };
  }
  return null;
}

function interventionFor(topic, before) {
  if (topic.id === "soil-yield") return { label: "comparar suelo con +10% de calidad", factor: 1.1 };
  if (topic.id === "shelter-durability") return { label: "comparar con +10% de experiencia constructiva", factor: 1.1 };
  if (topic.id === "tool-durability") return { label: "comparar con +10% de habilidad de fabricación", factor: 1.1 };
  if (topic.id === "resource-regeneration") return { label: "comparar con +10% de presión humana", factor: 0.9 };
  if (topic.id === "scarcity-price") return { label: "comparar con +10% de disponibilidad relativa", factor: 0.9 };
  return null;
}

function measureIntervention(simulation, agent, topic, before, intervention) {
  return { value: before.value * intervention.factor };
}

function trimTopics(research) {
  research.topics = research.topics.slice(-MAX_TOPICS);
}

function round(value) {
  return Number(Number(value).toFixed(6));
}
