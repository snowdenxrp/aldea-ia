const RECOGNIZED_TERMINAL_EFFECT_STATUSES = new Set([
  "settled_observed",
  "reconciled_observed"
]);

function retainEffectJournal(entries, limit = 200) {
  // Only recognized terminal states are disposable history. PREPARED and unknown
  // states may represent unresolved external effects, so preserve them even above
  // the soft cap instead of silently dropping uncertainty.
  const journal = Array.isArray(entries) ? structuredClone(entries) : [];
  while (journal.length > limit) {
    const terminalIndex = journal.findIndex(entry =>
      RECOGNIZED_TERMINAL_EFFECT_STATUSES.has(entry?.status)
    );
    if (terminalIndex < 0) break;
    journal.splice(terminalIndex, 1);
  }
  return journal;
}

function unresolvedEffectMissionIds(effectJournal) {
  return new Set(effectJournal
    .filter(entry =>
      !RECOGNIZED_TERMINAL_EFFECT_STATUSES.has(entry?.status) &&
      typeof entry.missionId === "string" && entry.missionId.trim()
    )
    .map(entry => entry.missionId));
}

function retainMissionRecords(entries, unresolvedMissionIds, limit) {
  const records = Array.isArray(entries) ? structuredClone(entries) : [];
  // Preserve all causal records for a mission with an unresolved prepared effect.
  // The soft cap may be exceeded; truncating these records could regress a prior
  // completed dependency to planned after restart and permit an unsafe duplicate.
  while (records.length > limit) {
    const removableIndex = records.findIndex(record => !unresolvedMissionIds.has(record?.missionId));
    if (removableIndex < 0) break;
    records.splice(removableIndex, 1);
  }
  return records;
}

function retainNexoMissions(entries, effectJournal, limit = 50) {
  return retainMissionRecords(entries, unresolvedEffectMissionIds(effectJournal), limit);
}

function missionIdsWithRetainedPlans(missions) {
  return new Set(missions
    .filter(mission => typeof mission?.missionId === "string")
    .map(mission => mission.missionId));
}

export function createLearningMemory(raw = null) {
  const source = raw && typeof raw === "object" ? raw : {};
  const effectJournal = retainEffectJournal(source.nexo?.effectJournal);
  const missions = retainNexoMissions(source.nexo?.missions, effectJournal);
  const retainedMissionIds = missionIdsWithRetainedPlans(missions);
  return {
    version: 4,
    runs: Array.isArray(source.runs) ? source.runs.slice(-100) : [],
    lessons: Array.isArray(source.lessons) ? source.lessons.slice(-100) : [],
    patterns: Array.isArray(source.patterns) ? source.patterns.slice(-100) : [],
    nexo: {
      missions,
      // Attempt/execution history is the only durable projection used to rebuild
      // step outcomes. Preserve it for every retained mission; a hard cap could
      // regress an old completed dependency to planned after restart.
      attempts: retainMissionRecords(source.nexo?.attempts, retainedMissionIds, 100),
      doNotRepeat: Array.isArray(source.nexo?.doNotRepeat) ? source.nexo.doNotRepeat.slice(-100) : [],
      executions: retainMissionRecords(source.nexo?.executions, retainedMissionIds, 200),
      effectJournal
    }
  };
}

function fingerprintFinding(finding) {
  return [finding?.severity, finding?.code, finding?.message].filter(Boolean).join("|");
}

export function learnFromReports(memory, reports, context = {}) {
  const next = createLearningMemory(memory);
  // Learning updates pattern counters; detach records so the new snapshot never
  // mutates the caller's prior snapshot through shared object references.
  next.patterns = next.patterns.map(item => item && typeof item === "object" ? { ...item } : item);
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
  // Persist the mission-step context needed to reconstruct the same plan after restart.
  // This is continuity data, not authorization or proof that an effect was executed.
  const persistedSteps = mission.steps.map(step => ({
    id: step.id,
    action: step.action,
    target: step.target ?? null,
    status: step.status,
    dependsOn: step.dependsOn ?? [],
    ...(step.priority !== undefined ? { priority: step.priority } : {}),
    ...(step.reason !== undefined ? { reason: step.reason } : {}),
    ...(step.source !== undefined ? { source: step.source } : {}),
    ...(step.reversible !== undefined ? { reversible: step.reversible } : {}),
    ...(step.requiresEvidence !== undefined ? { requiresEvidence: step.requiresEvidence } : {}),
    ...(step.requiresVerification !== undefined ? { requiresVerification: step.requiresVerification } : {}),
    ...(step.context !== undefined ? { context: structuredClone(step.context) } : {})
  }));
  next.nexo.missions.push({missionId:mission.missionId,version:mission.version,status:mission.status,objective:mission.objective,parentMissionId:mission.parentMissionId??null,replanReason:mission.replanReason??null,uncertainty:mission.uncertainty??null,evidenceCount:mission.evidenceCount??null,observedAgentCount:mission.observedAgentCount??null,admission:mission.admission?structuredClone(mission.admission):null,steps:persistedSteps,at:mission.generatedAt??new Date().toISOString()});
  next.nexo.missions=retainNexoMissions(next.nexo.missions,next.nexo.effectJournal);
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
    admission:plan.admission?structuredClone(plan.admission):null,
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
    const stepAttempts=attempts.filter(item=>item?.stepId===step.id);
    // A verified completion is an authoritative terminal outcome for this mission step.
    // Late/replayed failed or blocked results must not regress it during reconstruction.
    const latest=stepAttempts.find(item=>item?.status==="completed"&&item?.evidence?.verified===true&&typeof item?.evidence?.kind==="string"&&item.evidence.kind.trim())
      ?? [...stepAttempts].reverse().find(Boolean);
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
  next.nexo.executions=retainMissionRecords(next.nexo.executions,missionIdsWithRetainedPlans(next.nexo.missions),200);
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
  next.nexo.attempts=retainMissionRecords(next.nexo.attempts,missionIdsWithRetainedPlans(next.nexo.missions),100); next.nexo.doNotRepeat=next.nexo.doNotRepeat.slice(-100);
  return next;
}

function lessonFor(finding) {
  const rules={NO_AGENTS:"Verificar primero que el estado contenga habitantes antes de diagnosticar su comportamiento.",AGENT_ID:"Validar identidad estable de cada habitante antes de crear o sincronizar su representación.",AGENT_POSITION:"Validar posiciones finitas y dentro de los límites antes de mover o renderizar habitantes.",AGENT_DEAD:"No interpretar un habitante como ausente sin comprobar si el estado lo marcó como fallecido."};
  return rules[finding?.code] ?? "Registrar evidencia reproducible antes de proponer una corrección.";
}

export function getLearnedRules(memory) { return createLearningMemory(memory).lessons.map(item => item.rule); }
