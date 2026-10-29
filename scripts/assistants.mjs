import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { world as defaultWorld } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation } from "../src/simulation.js";
import { tick } from "../src/simulation.js";
import { loadState, loadStateStrict, applyState, persistState } from "./simulate.mjs";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina, buildAssistantReport } from "../src/assistants/index.js";
import { createLearningMemory, learnFromReports } from "../src/assistants/memory.js";
import { runAssistantSquad } from "../src/assistants/squad.js";

const STATE_PATH = process.env.NEXO_STATE_PATH
  ? pathToFileURL(resolve(process.env.NEXO_STATE_PATH))
  : new URL("../world-state.json", import.meta.url);
const MEMORY_PATH = process.env.NEXO_LUMINA_MEMORY_PATH
  ? pathToFileURL(resolve(process.env.NEXO_LUMINA_MEMORY_PATH))
  : new URL("../.lumina-assistant-memory.json", import.meta.url);

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

let stateExists = true;
try { await fs.access(STATE_PATH); } catch (error) { if (error?.code === "ENOENT") stateExists = false; else throw error; }
const persisted = stateExists ? await loadStateStrict(STATE_PATH) : await loadState(STATE_PATH);
const simulation = applyState(persisted);
normalizeCoreAgents(simulation.agents);

const codeFiles = {};
for (const path of ["src/main.js", "src/main-stable.js", "src/simulation.js", "src/movement.js", "src/agents.js", "src/needs.js", "src/actions.js", "src/world.js", "src/decision.js", "src/perception.js", "src/discovery.js", "src/memory.js", "src/relationships.js", "src/random.js"]) {
  try { codeFiles[path] = await fs.readFile(new URL("../" + path, import.meta.url), "utf8"); } catch {}
}

// Treat any historical Nexo payload as opaque data. Lúmina learning only receives
// its own fields; it must not normalize, prune, interpret, or rewrite Nexo records.
const rawMemory = await readJson(MEMORY_PATH, null);
const memory = createLearningMemory({
  runs: rawMemory?.runs,
  lessons: rawMemory?.lessons,
  patterns: rawMemory?.patterns
});
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
const learned = learnFromReports(
  memory,
  [debuggerReport, testerReport, analystReport],
  { day: simulation.day, hour: simulation.hour, agents: simulation.agents.length }
);

if (rawMemory && Object.hasOwn(rawMemory, "nexo")) {
  learned.nexo = structuredClone(rawMemory.nexo);
}
await fs.writeFile(MEMORY_PATH, JSON.stringify(learned, null, 2) + "\n", "utf8");
const nextRevision = Number(persisted.stateRevision ?? 0) + 1;
await persistState(STATE_PATH, simulation, Date.now(), { expectedRevision: Number(persisted.stateRevision ?? 0), stateRevision: nextRevision });

console.log(JSON.stringify({ ...report, learning: { runs: learned.runs.length, lessons: learned.lessons.length, patterns: learned.patterns.length }, stateRevision: nextRevision }, null, 2));

if (report.status === "error") process.exitCode = 1;
