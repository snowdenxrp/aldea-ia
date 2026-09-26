export function createLearningMemory(raw = null) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    version: 4,
    runs: Array.isArray(source.runs) ? source.runs.slice(-100) : [],
    lessons: Array.isArray(source.lessons) ? source.lessons.slice(-100) : [],
    patterns: Array.isArray(source.patterns) ? source.patterns.slice(-100) : [],
    nexo: {
      missions: Array.isArray(source.nexo?.missions) ? source.nexo.missions.slice(-50) : [],
      attempts: Array.isArray(source.nexo?.attempts) ? source.nexo.attempts.slice(-100) : [],
      doNotRepeat: Array.isArray(source.nexo?.doNotRepeat) ? source.nexo.doNotRepeat.slice(-100) : [],
      executions: Array.isArray(source.nexo?.executions) ? source.nexo.executions.slice(-200) : []
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

export function recordNexoPlan(memory, mission) {
  const next=createLearningMemory(memory);
  if(!mission?.missionId) return next;
  if(next.nexo.missions.some(item=>item?.missionId===mission.missionId)) return next;
  next.nexo.missions.push({missionId:mission.missionId,version:mission.version,status:mission.status,objective:mission.objective,parentMissionId:mission.parentMissionId??null,replanReason:mission.replanReason??null,steps:mission.steps.map(s=>({id:s.id,action:s.action,target:s.target,status:s.status,dependsOn:s.dependsOn??[]})),at:mission.generatedAt??new Date().toISOString()});
  next.nexo.missions=next.nexo.missions.slice(-50);
  return next;
}

export function reconstructNexoMission(memory, missionId) {
  const source=createLearningMemory(memory);
  const plan=source.nexo.missions.find(item=>item?.missionId===missionId);
  if(!plan) return null;
  const mission={
    version:plan.version??4,
    missionId:plan.missionId,
    parentMissionId:plan.parentMissionId??null,
    replanReason:plan.replanReason??null,
    objective:plan.objective??"awaiting_verification",
    status:plan.status??"planned",
    uncertainty:plan.uncertainty??null,
    evidenceCount:plan.evidenceCount??null,
    observedAgentCount:plan.observedAgentCount??null,
    steps:Array.isArray(plan.steps)?structuredClone(plan.steps):[],
    memorySignals:{
      patterns:source.patterns.length,
      attempts:source.nexo.attempts.length,
      doNotRepeat:source.nexo.doNotRepeat.length,
      executions:source.nexo.executions.length
    },
    generatedAt:plan.at
  };
  const attempts=source.nexo.attempts.filter(item=>item?.missionId===missionId);
  for(const step of mission.steps){
    const latest=[...attempts].reverse().find(item=>item?.stepId===step.id);
    if(!latest) continue;
    step.status=latest.status;
    if(latest.evidence!=null) step.result=latest.evidence;
    if(latest.status==="failed") step.failure=latest.evidence??null;
    if(latest.status==="blocked") step.blockReason=latest.evidence??"blocked";
  }
  const failed=mission.steps.some(step=>step.status==="failed");
  const blocked=mission.steps.some(step=>step.status==="blocked");
  const unresolved=mission.steps.some(step=>!["completed","failed","blocked"].includes(step.status));
  if(failed){mission.status="needs_replan";mission.objective="replan_after_failure";}
  else if(blocked){mission.status="blocked";mission.objective="replan_from_constraints";}
  else if(unresolved){
    const executable=mission.steps.find(step=>step.status==="planned"&&(step.dependsOn??[]).every(id=>mission.steps.find(dep=>dep.id===id)?.status==="completed"));
    mission.status=executable?"planned":"awaiting_dependencies";
    mission.objective=executable?.action??"awaiting_dependencies";
  } else {
    mission.status="awaiting_verification";
    mission.objective="verify_mission_outcome";
  }
  return mission;
}

export function recordNexoExecution(memory,{idempotencyKey,missionId,stepId,action,target=null,result}={}) {
  const next=createLearningMemory(memory);
  if(!idempotencyKey||!missionId||!stepId||!action||!result) return next;
  if(!next.nexo.executions.some(x=>x.idempotencyKey===idempotencyKey))
    next.nexo.executions.push({idempotencyKey,missionId,stepId,action,target,result,at:new Date().toISOString()});
  next.nexo.executions=next.nexo.executions.slice(-200);
  return next;
}

export function recordNexoOutcome(memory,{missionId,stepId,action,target=null,status,evidence=null,doNotRepeat=false,parentMissionId=null,replanReason=null}={}){
  const next=createLearningMemory(memory);
  if(!missionId||!stepId||!action||!["completed","failed","blocked"].includes(status)) return next;
  if(status==="completed" && !(evidence?.verified===true && typeof evidence?.kind==="string" && evidence.kind.trim())) return next;
  // A mission step is a single authoritative attempt. Replays and late results for the same
  // mission/step must never overwrite its durable outcome; retries belong to a new missionId.
  if(next.nexo.attempts.some(item=>item?.missionId===missionId&&item?.stepId===stepId)) return next;
  const entry={missionId,stepId,action,target,status,evidence:evidence??null,parentMissionId:parentMissionId??null,replanReason:replanReason??null,at:new Date().toISOString()};
  next.nexo.attempts.push(entry);
  if(doNotRepeat) next.nexo.doNotRepeat.push({action,target,reason:evidence??"previous attempt marked non-repeatable",at:entry.at});
  next.nexo.attempts=next.nexo.attempts.slice(-100); next.nexo.doNotRepeat=next.nexo.doNotRepeat.slice(-100);
  return next;
}

function lessonFor(finding) {
  const rules={NO_AGENTS:"Verificar primero que el estado contenga habitantes antes de diagnosticar su comportamiento.",AGENT_ID:"Validar identidad estable de cada habitante antes de crear o sincronizar su representación.",AGENT_POSITION:"Validar posiciones finitas y dentro de los límites antes de mover o renderizar habitantes.",AGENT_DEAD:"No interpretar un habitante como ausente sin comprobar si el estado lo marcó como fallecido."};
  return rules[finding?.code] ?? "Registrar evidencia reproducible antes de proponer una corrección.";
}

export function getLearnedRules(memory) { return createLearningMemory(memory).lessons.map(item => item.rule); }
