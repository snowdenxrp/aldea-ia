export { runDebugger } from "./debugger.js";
export { runTester } from "./tester.js";
export { analyzeLumina } from "./analyst.js";

export function buildAssistantReport({ debuggerReport, testerReport, analystReport }) {
  const reports = [debuggerReport, testerReport, analystReport].filter(Boolean);
  const errors = reports.filter(r => r.status === "error" || r.status === "fail").length;
  const warnings = reports.filter(r => r.status === "warning").length;
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    status: errors ? "error" : warnings ? "warning" : "ok",
    assistants: reports
  };
}
