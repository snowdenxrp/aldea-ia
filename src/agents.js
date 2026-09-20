import { createNeeds } from "./needs.js";
import { remember } from "./memory.js";

// Estructura base de un habitante.
// Aquí almacenamos quién es y qué ha vivido, pero todavía NO decidimos sus acciones.

export function createAgent({ id, name, age = 15, home = null, position = { x: 0, z: 0 } }) {
  return {
    id,
    name,
    age,
    alive: true,

    // Estado físico y necesidades.
    needs: createNeeds(),

    // Estado actual observable.
    position: { ...position },
    currentActivity: "idle",

    // Recursos personales que posea realmente el habitante.
    inventory: [],
    money: 100,
    home,

    // Lo que el habitante ha aprendido individualmente.
    // Cada conocimiento tendrá posteriormente evidencia y confianza.
    knowledge: [],

    // Memoria episódica: acontecimientos que realmente ha vivido.
    memories: [],

    // Relaciones con otros habitantes.
    // Ejemplo futuro: { agentId: "bruno", trust: 0, familiarity: 0, history: [] }
    relationships: [],

    // Capacidades adquiridas mediante experiencia.
    skills: [],

    // Historial de experiencias importantes.
    experiences: [],

    // Objetivo o intención actual.
    currentIntent: null,

    // Última acción realmente ejecutada; sirve para evitar repeticiones ciegas.
    lastActionName: null,
    lastActionResult: null,
    lastAttemptedAction: null,
    actionFailures: {},
    knownResources: {}
  };
}

export function createInitialAgents() {
  return [
    createAgent({
      id: "alex",
      name: "Alex",
      age: 15,
      position: { x: -8, z: -8 }
    }),
    createAgent({
      id: "bruno",
      name: "Bruno",
      age: 15,
      position: { x: 10, z: 10 }
    })
  ];
}

const MAX_EXPERIENCES = 2000;

// Registra una experiencia sin convertirla automáticamente en conocimiento.
export function addExperience(agent, experience) {
  agent.experiences.push({
    id: experience.id,
    day: experience.day,
    type: experience.type,
    description: experience.description,
    participants: experience.participants ?? [],
    consequences: experience.consequences ?? []
  });
  if (agent.experiences.length > MAX_EXPERIENCES) agent.experiences = agent.experiences.slice(-MAX_EXPERIENCES);
}

// Registra un recuerdo de algo que el habitante realmente vivió.
export function addMemory(agent, memory) {
  return remember(agent, memory);
}

// Añade conocimiento individual.
// El campo confidence permite distinguir una hipótesis de algo comprobado.
export function addKnowledge(agent, knowledge) {
  agent.knowledge.push({
    topic: knowledge.topic,
    belief: knowledge.belief,
    confidence: knowledge.confidence ?? 0.1,
    evidence: knowledge.evidence ?? [],
    source: knowledge.source ?? "experience",
    learnedOnDay: knowledge.learnedOnDay ?? null
  });
}
