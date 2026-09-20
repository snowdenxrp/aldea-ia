export function runDebugger({ files = {}, simulation = null } = {}) {
  const findings = [];
  const add = (severity, code, message, evidence = null) => findings.push({ severity, code, message, evidence });

  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== "string") continue;
    if (/\bNaN\b/.test(content)) add("warning", "STATIC_NAN", `Possible NaN reference in ${path}.`);
    if (/TODO|FIXME/.test(content)) add("info", "TODO", `Pending TODO/FIXME markers in ${path}.`);
    if (path.endsWith("main.js")) {
      const checks = [
        ["RENDERER_MISSING", /new THREE\.WebGLRenderer\s*\(/, "No se encontró la creación del renderer."],
        ["SCENE_RENDER_MISSING", /renderer\.render\(scene,\s*camera\)/, "No se encontró renderer.render(scene, camera)."],
        ["ANIMATION_LOOP_MISSING", /requestAnimationFrame\(animate\)/, "No se encontró el bucle requestAnimationFrame."],
        ["MESH_SCENE_ADD_MISSING", /scene\.add\(mesh\)/, "No se encontró la adición de meshes de habitantes a la escena."],
        ["CAMERA_MISSING", /new THREE\.PerspectiveCamera\s*\(/, "No se encontró una cámara PerspectiveCamera."],
        ["CAMERA_LOOKAT_MISSING", /camera\.lookAt\(/, "No se encontró camera.lookAt()."],
        ["RENDER_PROBE_MISSING", /addVisualDiagnostics\s*\(/, "No se encontró el diagnóstico visual de habitantes."]
      ];
      for (const [code, pattern, message] of checks) {
        if (!pattern.test(content)) add("error", code, message, path);
      }
    }
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
      for (const key of ["hunger","thirst","energy","social","safety","health"]) {
        const value = Number(agent?.needs?.[key]);
        if (!Number.isFinite(value) || value < 0 || value > 100) add("error", "INVALID_NEED", `Necesidad inválida ${key} en ${agent?.name ?? agent?.id ?? "habitante"}.`, value);
      }
      if (Array.isArray(agent?.memories) && agent.memories.length > 5000) add("warning", "MEMORY_GROWTH", `${agent.name ?? agent.id} tiene ${agent.memories.length} recuerdos.`);
      if (Array.isArray(agent?.experiences) && agent.experiences.length > 5000) add("warning", "EXPERIENCE_GROWTH", `${agent.name ?? agent.id} tiene ${agent.experiences.length} experiencias.`);
      for (const relationship of agent?.relationships ?? []) {
        if ((relationship.history?.length ?? 0) > 5000) add("warning", "RELATIONSHIP_GROWTH", `${agent.name ?? agent.id} acumula demasiadas interacciones con ${relationship.agentId}.`);
      }
    }
    const ids = new Set(agents.map(a => a?.id));
    for (const id of ["alex", "bruno"]) {
      if (!ids.has(id)) add("error", "CORE_AGENT_MISSING", `Falta el habitante núcleo ${id}.`);
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