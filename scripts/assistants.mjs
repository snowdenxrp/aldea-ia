import fs from "node:fs/promises";
import { world as defaultWorld } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { tick } from "../src/simulation.js";
import { persistState } from "./simulate.mjs";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina, buildAssistantReport } from "../src/assistants/index.js";
import { createLearningMemory, learnFromReports, recordNexoPlan } from "../src/assistants/memory.js";
import { runAssistantSquad } from "../src/assistants/squad.js";
import { buildNexoMission } from "../src/nexo/orchestrator.js";

const STATE_PATH = new URL("../world-state.json", import.meta.url);
const MEMORY_PATH = new URL("../.lumina-assistant-memory.json", import.meta.url);

async function readJson(path, fallback) {
  try { return JSON.parse(await fs.readFile(path, "utf8")); } catch { return fallback; }
}

function normalizeCoreAgents(agents) {
  const initial = createInitialAgents();
  for (const fallback of initial) {
    let agent = agents.find(item => item?.id === fallback.id);
    if (!agent) { agents.push(structuredClone(fallback)); agent = agents[agents.length - 1]; }
    agent.currentActivity = agent.alive === false ? "dead" : (agent.currentActivity ?? "idle");
    agent.needs ??= structuredClone(fallback.needs);
    if (!Number.isFinite(Number(agent.needs.health))) agent.needs.health = 100;
    for (const key of ["hunger", "thirst", "energy", "social", "safety"]) {
      if (!Number.isFinite(Number(agent.needs[key]))) agent.needs[key] = 80;
      agent.needs[key] = Math.max(0, Math.min(100, Number(agent.needs[key])));
    }
    agent.needs.health = Math.max(0, Math.min(100, Number(agent.needs.health)));
  }
}

const persisted = await readJson(STATE_PATH, null);
const simulation = createSimulation(
  structuredClone(persisted?.world ?? defaultWorld),
  structuredClone(Array.isArray(persisted?.agents) && persisted.agents.length ? persisted.agents : createInitialAgents())
);
simulation.day = Number(persisted?.day) || simulation.world.day || 1;
simulation.hour = Number.isFinite(Number(persisted?.hour)) ? Number(persisted.hour) : (simulation.world.timeOfDay || 8);
simulation.events = Array.isArray(persisted?.events) ? persisted.events.slice(-500) : [];
normalizeCoreAgents(simulation.agents);

const codeFiles = {};
for (const path of ["src/main.js", "src/main-stable.js", "src/simulation.js", "src/movement.js", "src/agents.js", "src/needs.js", "src/actions.js", "src/world.js", "src/decision.js", "src/perception.js", "src/discovery.js", "src/memory.js", "src/relationships.js", "src/random.js"]) {
  try { codeFiles[path] = await fs.readFile(new URL("../" + path, import.meta.url), "utf8"); } catch {}
}

const memory = createLearningMemory(await readJson(MEMORY_PATH, null));
const nexoMemory = simulation.nexoMemory;
const debuggerReport = runDebugger({ files: codeFiles, simulation });
const testerReport = runTester({ simulation, tick, moveAgent, setMovementTarget });
const analystReport = analyzeLumina({
  simulation,
  debuggerReport,
  testerReport,
  learnedRules: memory.lessons
});
const structuralFindings = [];
for (const agent of simulation.agents) {
  if (agent.alive === false && agent.needs?.health > 0) structuralFindings.push({ severity: "warning", code: "DEAD_WITH_HEALTH", message: agent.name + " está muerto pero conserva salud > 0." });
  if (agent.alive === false && agent.currentActivity !== "dead") structuralFindings.push({ severity: "error", code: "DEAD_STATE_MISMATCH", message: agent.name + " está muerto pero su actividad no es dead." });
}
const structuralReport = {
  assistant: "StateAuditor",
  status: structuralFindings.some(f => f.severity === "error") ? "error" : structuralFindings.length ? "warning" : "ok",
  summary: structuralFindings.length ? `${structuralFindings.length} hallazgo(s) de consistencia de estado` : "Estado estructural consistente.",
  findings: structuralFindings
};
const squadReport = runAssistantSquad({ simulation });
const report = buildAssistantReport({ debuggerReport, testerReport, analystReport, structuralReport });
report.assistantSquad = squadReport;
const nexoMission = buildNexoMission({ simulation, reports: [...squadReport.reports, debuggerReport, testerReport, analystReport], memory: nexoMemory });
report.nexoMission = nexoMission;
simulation.nexoMemory = recordNexoPlan(nexoMemory, nexoMission);
const learned = learnFromReports(
  memory,
  [debuggerReport, testerReport, analystReport],
  { day: simulation.day, hour: simulation.hour, agents: simulation.agents.length }
);

await fs.writeFile(MEMORY_PATH, JSON.stringify(learned, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ ...report, learning: { runs: learned.runs.length, lessons: learned.lessons.length, patterns: learned.patterns.length } }, null, 2));

if (report.status === "error") process.exitCode = 1;
