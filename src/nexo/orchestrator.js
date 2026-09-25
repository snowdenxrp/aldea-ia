// Núcleo de orquestación de Nexo: planificación cerrada, verificable y conservadora.
// No ejecuta efectos externos; define el contrato que una futura capa de efectos deberá cumplir.
const severityRank=Object.freeze({error:3,warning:2,info:1});
const TERMINAL=new Set(["completed","failed","blocked"]);
const ACTION_META=Object.freeze({
  restore_core_agents:{reversible:false,requiresVerification:true},
  repair_agent_state:{reversible:true,requiresVerification:true},
  repair_agent_needs:{reversible:true,requiresVerification:true},
  repair_visual_mesh:{reversible:true,requiresVerification:true},
  repair_scene_link:{reversible:true,requiresVerification:true},
  repair_visual_visibility:{reversible:true,requiresVerification:true},
  inspect_camera_framing:{reversible:true,requiresVerification:true},
  advance_exploration_probe:{reversible:true,requiresVerification:true},
  collect_behavior_window:{reversible:true,requiresVerification:true},
  repair_routine_phase:{reversible:true,requiresVerification:true},
  repair_resource_state:{reversible:true,requiresVerification:true},
  collect_social_window:{reversible:true,requiresVerification:true},
  inspect_and_collect_evidence:{reversible:true,requiresVerification:true},
  run_longitudinal_probe:{reversible:true,requiresVerification:true}
});

function collectFindings(reports=[]){
  return reports.flatMap(r=>(r?.findings??[]).map(f=>({...f,source:r?.assistant??"unknown"})))
    .sort((a,b)=>(severityRank[b.severity]??0)-(severityRank[a.severity]??0));
}

function actionFor(f){
  const map={NO_AGENTS:"restore_core_agents",AGENT_POSITION:"repair_agent_state",INVALID_NEED:"repair_agent_needs",MESH_MISSING:"repair_visual_mesh",NOT_IN_SCENE:"repair_scene_link",HIDDEN:"repair_visual_visibility",OFFSCREEN:"inspect_camera_framing",EXPLORER_STALLED:"advance_exploration_probe",BEHAVIOR_IDLE_SAMPLE:"collect_behavior_window",ROUTINE_PHASE_MISSING:"repair_routine_phase",NEGATIVE_RESOURCE:"repair_resource_state",SOCIAL_DEPRIVATION:"collect_social_window"};
  return map[f?.code]??"inspect_and_collect_evidence";
}

function dependencyKey(action, finding) {
  if(finding?.agent && action==="repair_visual_mesh") return "agent-state:"+finding.agent;
  return null;
}

function evidenceAcceptable(evidence) {
  return !!evidence && typeof evidence==="object" && evidence.verified===true && typeof evidence.kind==="string" && evidence.kind.length>0;
}

export function buildNexoMission({simulation=null,reports=[],memory=null}={}){
  const findings=collectFindings(reports);
  const steps=[]; const seen=new Set();
  for(const finding of findings){
    const action=actionFor(finding); const key=action+"|"+(finding.agent??finding.resource??"global");
    if(seen.has(key)) continue;
    seen.add(key);
    const meta=ACTION_META[action]??ACTION_META.inspect_and_collect_evidence;
    const dependency=dependencyKey(action,finding);
    steps.push({id:"step-"+(steps.length+1),action,priority:severityRank[finding.severity]??0,reason:finding.message??finding.code??"observación sin descripción",source:finding.source,target:finding.agent??finding.resource??null,reversible:meta.reversible,requiresEvidence:true,requiresVerification:meta.requiresVerification,dependsOn:dependency?[]:[]});
  }
  if(!steps.length) steps.push({id:"step-1",action:"run_longitudinal_probe",priority:1,reason:"No hay fallos activos; obtener evidencia temporal antes de declarar estabilidad.",source:"Nexo",target:null,reversible:true,requiresEvidence:true,requiresVerification:true,dependsOn:[]});
  // Dependencias se resuelven después de crear IDs para no depender del orden de entrada.
  for(let i=0;i<steps.length;i++){
    const step=steps[i];
    if(step.action==="repair_visual_mesh"||step.action==="repair_scene_link"||step.action==="repair_visual_visibility"){
      const stateStep=steps.find(s=>s.target===step.target&&s.action==="repair_agent_state");
      if(stateStep&&stateStep.id!==step.id) step.dependsOn=[stateStep.id];
    }
  }
  const blockedByRepeat=steps.filter(s=>Array.isArray(memory?.nexo?.doNotRepeat)&&memory.nexo.doNotRepeat.some(x=>x.action===s.action&&(!s.target||x.target===s.target)));
  for(const step of blockedByRepeat){step.status="blocked";step.blockReason="DO_NOT_REPEAT";}

  const pending=steps.find(s=>s.status!=="blocked");
  return {version:2,missionId:"lumina-"+Date.now(),objective:pending?.action??"replan_from_constraints",status:pending?"planned":"blocked",uncertainty:findings.some(f=>f.severity==="warning")?"present":"low",evidenceCount:reports.length,steps:steps.slice(0,8),memorySignals:{patterns:Array.isArray(memory?.patterns)?memory.patterns.length:0,attempts:Array.isArray(memory?.nexo?.attempts)?memory.nexo.attempts.length:0,doNotRepeat:Array.isArray(memory?.nexo?.doNotRepeat)?memory.nexo.doNotRepeat.length:0},generatedAt:new Date().toISOString()};
}

export function beginNexoStep(mission, stepId) {
  if(!mission?.steps?.length) return null;
  const next=structuredClone(mission); const step=next.steps.find(s=>s.id===stepId);
  if(!step||step.status==="blocked"||step.status==="completed") return next;
  const unmet=(step.dependsOn??[]).some(id=>next.steps.find(s=>s.id===id)?.status!=="completed");
  if(unmet){step.status="blocked";step.blockReason="DEPENDENCY_UNMET";next.status="blocked";return next;}
  step.status="executing"; next.status="executing"; next.objective=step.action; return next;
}

export function advanceNexoMission(mission,{stepId=null,outcome="completed",evidence=null}={}) {
  if(!mission||!Array.isArray(mission.steps)||!["completed","failed","blocked"].includes(outcome)) return null;
  const next=structuredClone(mission); const step=next.steps.find(s=>s.id===stepId);
  if(!step||step.status==="blocked") return next;
  if(outcome==="completed"&&!evidenceAcceptable(evidence)) return {...next,status:"blocked",blockReason:"MISSING_VERIFIED_EVIDENCE"};
  step.status=outcome; step.result=evidence;
  if(outcome==="failed") {step.failure=evidence??null;}
  if(outcome==="blocked") step.blockReason=evidence??"blocked";
  const pending=next.steps.find(s=>!TERMINAL.has(s.status));
  next.objective=pending?.action??"verify_mission_outcome";
  next.status=pending?"planned":"awaiting_verification";
  next.lastEvidence=evidence;
  return next;
}

export function verifyNexoMission(mission, verification) {
  if(!mission||!Array.isArray(mission.steps)) return {status:"invalid",verified:false};
  const unresolved=mission.steps.filter(s=>s.status!=="completed");
  if(unresolved.length) return {status:"incomplete",verified:false,unresolved:unresolved.map(s=>s.id)};
  if(!evidenceAcceptable(verification)) return {status:"awaiting_verification",verified:false};
  return {status:"completed",verified:true,evidence:verification};
}

export function planNexoExecution(mission) {
  if(!mission||!Array.isArray(mission.steps)) return {status:"invalid",actions:[]};
  return {status:"ready",actions:mission.steps.filter(s=>!s.status||s.status==="planned").map(s=>({stepId:s.id,action:s.action,target:s.target,dependsOn:s.dependsOn??[],reversible:s.reversible,requiresVerification:s.requiresVerification}))};
}
