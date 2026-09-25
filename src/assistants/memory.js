export function createLearningMemory(raw = null) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    version: 2,
    runs: Array.isArray(source.runs) ? source.runs.slice(-100) : [],
    lessons: Array.isArray(source.lessons) ? source.lessons.slice(-100) : [],
    patterns: Array.isArray(source.patterns) ? source.patterns.slice(-100) : [],
    nexo: {
      attempts: Array.isArray(source.nexo?.attempts) ? source.nexo.attempts.slice(-100) : [],
      doNotRepeat: Array.isArray(source.nexo?.doNotRepeat) ? source.nexo.doNotRepeat.slice(-100) : []
    }
  };
}

function fingerprintFinding(finding) {
  return [finding?.severity, finding?.code, finding?.message].filter(Boolean).join("|");
}

export function learnFromReports(memory, reports, context = {}) {
  const next = createLearningMemory(memory);
  const findings = reports.flatMap(report => report?.findings ?? []);
  const conclusions = reports.flatMap(report => report?.conclusions ?? []);
  const failures = reports.flatMap(report => (report?.results ?? []).filter(item => item.status === "fail"));
  const signatures = [...findings.map(fingerprintFinding), ...failures.map(item => "TEST|" + item.name)].filter(Boolean);

  for (const signature of signatures) {
    const existing = next.patterns.find(item => item.signature === signature);
    if (existing) { existing.seen += 1; existing.lastSeen = new Date().toISOString(); }
    else next.patterns.push({signature,seen:1,firstSeen:new Date().toISOString(),lastSeen:new Date().toISOString()});
  }

  for (const finding of findings) if (finding.severity === "error" || finding.severity === "warning") {
    const lesson={trigger:fingerprintFinding(finding),rule:lessonFor(finding),source:"Debugger",learnedAt:new Date().toISOString()};
    if (!next.lessons.some(item=>item.trigger===lesson.trigger&&item.rule===lesson.rule)) next.lessons.push(lesson);
  }
  for (const conclusion of conclusions) if (conclusion.severity === "error" || conclusion.severity === "warning") {
    const lesson={trigger:conclusion.message,rule:"No dar por resuelto un problema hasta que las pruebas correspondientes pasen.",source:"Analista de Lúmina",causeCode:conclusion.code??null,learnedAt:new Date().toISOString()};
    if (!next.lessons.some(item=>item.trigger===lesson.trigger&&item.rule===lesson.rule)) next.lessons.push(lesson);
  }

  next.runs.push({at:new Date().toISOString(),status:reports.some(r=>r.status==="error"||r.status==="fail")?"error":reports.some(r=>r.status==="warning")?"warning":"ok",day:context.day??null,hour:context.hour??null,agents:context.agents??null,findings:findings.length,testFailures:failures.length});
  next.runs=next.runs.slice(-100); next.lessons=next.lessons.slice(-100); next.patterns=next.patterns.slice(-100);
  return next;
}

export function recordNexoOutcome(memory, {missionId,stepId,action,status,evidence=null,doNotRepeat=false}={}) {
  const next=createLearningMemory(memory);
  if(!missionId||!stepId||!action||!["completed","failed","blocked"].includes(status)) return next;
  const entry={missionId,stepId,action,status,evidence:evidence??null,at:new Date().toISOString()};
  next.nexo.attempts.push(entry);
  if(doNotRepeat) next.nexo.doNotRepeat.push({action,reason:evidence??"previous attempt marked non-repeatable",at:entry.at});
  next.nexo.attempts=next.nexo.attempts.slice(-100); next.nexo.doNotRepeat=next.nexo.doNotRepeat.slice(-100);
  return next;
}

function lessonFor(finding) {
  const rules={NO_AGENTS:"Verificar primero que el estado contenga habitantes antes de diagnosticar su comportamiento.",AGENT_ID:"Validar identidad estable de cada habitante antes de crear o sincronizar su representación.",AGENT_POSITION:"Validar posiciones finitas y dentro de los límites antes de mover o renderizar habitantes.",AGENT_DEAD:"No interpretar un habitante como ausente sin comprobar si el estado lo marcó como fallecido."};
  return rules[finding?.code] ?? "Registrar evidencia reproducible antes de proponer una corrección.";
}

export function getLearnedRules(memory) { return createLearningMemory(memory).lessons.map(item=>item.rule); }
