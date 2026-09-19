export function runDebugger({ files = {}, simulation = null } = {}) {
  const findings = [];
  const add = (severity, code, message, evidence = null) =>
    findings.push({ severity, code, message, evidence });

  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== "string") continue;
    if (/\\bNaN\\b/.test(content)) add("warning", "STATIC_NAN", `Possible NaN reference in ${path}.`);
    if (/TODO|FIXME/.test(content)) add("info", "TODO", `Pending TODO/FIXME markers in ${path}.`);
  }

  if (simulation) {
    const agents = Array.isArray(simulation.agents) ? simulation.agents : [];
    if (!agents.length) add("error", "NO_AGENTS", "La simulación no contiene habitantes.");
    for (const agent of agents) {
      if (!agent?.id) add("error", "AGENT_ID", "Se encontró un habitante sin id.");
      if (!agent?.position || !Number.isFinite(Number(agent.position.x)) || !Number.isFinite(Number(agent.position.z))) {
        add("error", "AGENT_POSITION", `Posición inválida para ${agent?.name ?? agent?.id ?? "habitante"}.`);
      }
      if (agent?.alive !== true) add("warning", "AGENT_DEAD", `${agent?.name ?? agent?.id ?? "Habitante"} no está marcado como vivo.`);
    }
  }

  const errors = findings.filter(f => f.severity === "error").length;
  const warnings = findings.filter(f => f.severity === "warning").length;
  return {
    assistant: "Debugger",
    status: errors ? "error" : warnings ? "warning" : "ok",
    summary: errors ? `${errors} error(es), ${warnings} advertencia(s)` : warnings ? `${warnings} advertencia(s)` : "Sin problemas detectados por el diagnóstico.",
    findings
  };
}
