import fs from "node:fs/promises";
import { world as defaultWorld } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina, buildAssistantReport } from "../src/assistants/index.js";
import { createLearningMemory, learnFromReports } from "../src/assistants/memory.js";

const STATE_PATH = new URL("../world-state.json", import.meta.url);
const MEMORY_PATH = new URL("../.lumina-assistant-memory.json", import.meta.url);

async function readJson(path, fallback) {
  try { return JSON.parse(await fs.readFile(path, "utf8")); } catch { return fallback; }
}

const persisted = await readJson(STATE_PATH, null);
const simulation = createSimulation(
  structuredClone(persisted?.world ?? defaultWorld),
  structuredClone(Array.isArray(persisted?.agents) && persisted.agents.length ? persisted.agents : createInitialAgents())
);
simulation.day = Number(persisted?.day) || simulation.world.day || 1;
simulation.hour = Number(persisted?.hour) || simulation.world.timeOfDay || 8;
simulation.events = Array.isArray(persisted?.events) ? persisted.events.slice(-500) : [];

const codeFiles = {};
for (const path of ["src/main.js", "src/simulation.js", "src/movement.js", "src/agents.js"]) {
  try { codeFiles[path] = await fs.readFile(new URL("../" + path, import.meta.url), "utf8"); } catch {}
}

const memory = createLearningMemory(await readJson(MEMORY_PATH, null));
const debuggerReport = runDebugger({ files: codeFiles, simulation });
const testerReport = runTester({ simulation, tick, moveAgent, setMovementTarget });
const analystReport = analyzeLumina({
  simulation,
  debuggerReport,
  testerReport,
  learnedRules: memory.lessons
});
const report = buildAssistantReport({ debuggerReport, testerReport, analystReport });
const learned = learnFromReports(
  memory,
  [debuggerReport, testerReport, analystReport],
  { day: simulation.day, hour: simulation.hour, agents: simulation.agents.length }
);

await fs.writeFile(MEMORY_PATH, JSON.stringify(learned, null, 2) + "\n", "utf8");
console.log(JSON.stringify({
  ...report,
  learning: { runs: learned.runs.length, lessons: learned.lessons.length, patterns: learned.patterns.length }
}, null, 2));

if (report.status === "error") process.exitCode = 1;
