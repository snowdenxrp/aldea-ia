import { world as defaultWorld } from "../src/world.js";
import { createInitialAgents } from "../src/agents.js";
import { createSimulation, tick } from "../src/simulation.js";
import { setMovementTarget, moveAgent } from "../src/movement.js";
import { runDebugger, runTester, analyzeLumina, buildAssistantReport } from "../src/assistants/index.js";

const simulation = createSimulation(structuredClone(defaultWorld), structuredClone(createInitialAgents()));

const debuggerReport = runDebugger({
  files: {},
  simulation
});

const testerReport = runTester({
  simulation,
  tick,
  moveAgent,
  setMovementTarget
});

const analystReport = analyzeLumina({
  simulation,
  debuggerReport,
  testerReport
});

const report = buildAssistantReport({ debuggerReport, testerReport, analystReport });
console.log(JSON.stringify(report, null, 2));

if (report.status === "error") process.exitCode = 1;
