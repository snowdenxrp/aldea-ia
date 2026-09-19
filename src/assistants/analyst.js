export function analyzeLumina({ simulation, debuggerReport = null, testerReport = null, learnedRules = [], renderProbe = null } = {}) {
  const agents = Array.isArray(simulation?.agents) ? simulation.agents : [];
  const observations = [];
  const conclusions = [];
  const alive = agents.filter(a => a?.alive !== false);
  const withIntent = agents.filter(a => a?.currentIntent);
  const moving = agents.filter(a => a?.movement?.moving);

  observations.push(`Habitantes: ${agents.length}; vivos: ${alive.length}; con intención: ${withIntent.length}; moviéndose: ${moving.length}.`);
  if (simulation) observations.push(`Tiempo: día ${simulation.day}, hora ${Number(simulation.hour).toFixed(2)}.`);
  if (learnedRules.length) observations.push(`Memoria de aprendizaje: ${learnedRules.length} regla(s) acumulada(s).`);
  if (renderProbe) observations.push(`Render: ${renderProbe.renderer ? "renderer OK" : "renderer ausente"}; escena ${renderProbe.sceneChildren ?? "?"} objetos; Alex ${renderProbe.alex ?? "?"}; Bruno ${renderProbe.bruno ?? "?"}.`);

  const visual = renderProbe?.agents ?? {};
  for (const [id, probe] of Object.entries(visual)) {
    if (probe?.exists === false) conclusions.push({ severity: "error", message: `${id}: el mesh no existe; revisar creación/sincronización visual.` });
    else if (probe?.inScene === false) conclusions.push({ severity: "error", message: `${id}: el mesh existe pero no pertenece a la escena; revisar scene.add().` });
    else if (probe?.visible === false) conclusions.push({ severity: "error", message: `${id}: el mesh existe y está en la escena, pero está oculto.` });
    else if (probe?.onScreen === false) conclusions.push({ severity: "warning", message: `${id}: el mesh es renderizable pero está fuera del campo visual; revisar cámara/encuadre.` });
  }

  if (!agents.length) conclusions.push({ severity: "error", message: "No hay habitantes: la simulación no puede comportarse como aldea." });
  if (debuggerReport?.status === "error") conclusions.push({ severity: "error", message: "Debugger encontró errores estructurales; corregirlos antes de interpretar el comportamiento." });
  if (testerReport?.status === "fail") conclusions.push({ severity: "error", message: "Hay pruebas fallidas; una corrección no debe considerarse validada." });
  if (agents.length && withIntent.length === 0) conclusions.push({ severity: "warning", message: "Ningún habitante tiene intención actual; conviene revisar decisión/percepción." });
  if (agents.length && moving.length === 0) conclusions.push({ severity: "info", message: "No hay habitantes en movimiento en esta muestra; puede ser normal según sus intenciones." });

  return {
    assistant: "Analista de Lúmina",
    status: conclusions.some(c => c.severity === "error") ? "error" : conclusions.some(c => c.severity === "warning") ? "warning" : "ok",
    observations,
    conclusions
  };
}