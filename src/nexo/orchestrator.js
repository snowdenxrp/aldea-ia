// Núcleo de orquestación de Nexo: misión verificable, dependencias explícitas y ejecución conservadora.
// Este módulo NO ejecuta efectos externos. Solo define qué podría ejecutarse y cómo aceptar evidencia.
// La ejecución real debe pasar por un adaptador de efectos y volver con evidencia verificable.
const severityRank=Object.freeze({error:3,warning:2,info:1});
const TERMINAL_STEP=new Set(["completed","failed","blocked"]);
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
let missionSequence=0;

function collectFindings(reports=[]){
  return reports.flatMap(r=>(r?.findings??[]).map(f=>({...f,source:r?.assistant??"unknown"})))
    .sort((a,b)=>(severityRank[b.severity]??0)-(severityRank[a.severity]??0));
}

function actionFor(f){
  const map={
    NO_AGENTS:"restore_core_agents",AGENT_POSITION:"repair_agent_state",INVALID_NEED:"repair_agent_needs",
    MESH_MISSING:"repair_visual_mesh",NOT_IN_SCENE:"repair_scene_link",HIDDEN:"repair_visual_visibility",
    OFFSCREEN:"inspect_camera_framing",EXPLORER_STALLED:"advance_exploration_probe",
    BEHAVIOR_IDLE_SAMPLE:"collect_behavior_window",ROUTINE_PHASE_MISSING:"repair_routine_phase",
    NEGATIVE_RESOURCE:"repair_resource_state",SOCIAL_DEPRIVATION:"collect_social_window"
  };
  return map[f?.code]??"inspect_and_collect_evidence";
}

function evidenceAcceptable(evidence){
  return !!evidence && typeof evidence==="object" &&
    evidence.verified===true && typeof evidence.kind==="string" && evidence.kind.trim().length>0;
}

function dependencyIds(step, steps){
  if(!step.target) return [];
  if(["repair_visual_mesh","repair_scene_link","repair_visual_visibility"].includes(step.action)){
    const stateStep=steps.find(s=>s.target===step.target&&s.action==="repair_agent_state");
    return stateStep ? [stateStep.id] : [];
  }
  return [];
}

function hasCycle(steps){
  const state=new Map(steps.map(s=>[s.id,0]));
  const visit=id=>{
    const mark=state.get(id);
    if(mark===1) return true;
    if(mark===2) return false;
    state.set(id,1);
    const step=steps.find(s=>s.id===id);
    for(const dep of step?.dependsOn??[]) if(state.has(dep)&&visit(dep)) return true;
    state.set(id,2); return false;
  };
  return steps.some(s=>visit(s.id));
}

function repeatBlocked(step,memory){
  return Array.isArray(memory?.nexo?.doNotRepeat) &&
    memory.nexo.doNotRepeat.some(x=>x?.action===step.action && (x?.target==null || x.target===step.target));
}

export function buildNexoMission({simulation=null,reports=[],memory=null}={}){
  const findings=collectFindings(reports);
  const steps=[]; const seen=new Set();
  for(const finding of findings){
    const action=actionFor(finding);
    const target=finding.agent??finding.resource??null;
    const key=action+"|"+(target??"global");
    if(seen.has(key)) continue;
    seen.add(key);
    const meta=ACTION_META[action]??ACTION_META.inspect_and_collect_evidence;
    steps.push({
      id:"step-"+(steps.length+1), action, priority:severityRank[finding.severity]??0,
      reason:finding.message??finding.code??"observación sin descripción", source:finding.source,
      target, reversible:meta.reversible, requiresEvidence:true,
      requiresVerification:meta.requiresVerification, dependsOn:[], status:"planned"
    });
  }
  if(!steps.length){
    steps.push({
      id:"step-1",action:"run_longitudinal_probe",priority:1,
      reason:"No hay fallos activos; obtener evidencia temporal antes de declarar estabilidad.",
      source:"Nexo",target:null,reversible:true,requiresEvidence:true,
      requiresVerification:true,dependsOn:[],status:"planned"
    });
  }

  for(const step of steps) step.dependsOn=dependencyIds(step,steps);
  const dependencyCycle=hasCycle(steps);
  for(const step of steps){
    if(repeatBlocked(step,memory)){step.status="blocked";step.blockReason="DO_NOT_REPEAT";}
  }
  if(dependencyCycle){
    for(const step of steps){step.status="blocked";step.blockReason="DEPENDENCY_CYCLE";}
  }

  const executable=steps.find(s=>s.status==="planned"&&(s.dependsOn??[]).every(id=>steps.find(d=>d.id===id)?.status==="completed"));
  const blockedOnly=steps.every(s=>s.status==="blocked");
  return {
    version:3,
    missionId:`lumina-${Date.now()}-${++missionSequence}`,
    objective:executable?.action??(blockedOnly?"replan_from_constraints":"awaiting_dependencies"),
    status:blockedOnly?"blocked":"planned",
    uncertainty:findings.some(f=>!["error","warning","info"].includes(f.severity)||f.severity==="warning")?"present":"low",
    evidenceCount:reports.length,
    observedAgentCount:Array.isArray(simulation?.agents)?simulation.agents.length:0,
    steps:steps.slice(0,8),
    memorySignals:{
      patterns:Array.isArray(memory?.patterns)?memory.patterns.length:0,
      attempts:Array.isArray(memory?.nexo?.attempts)?memory.nexo.attempts.length:0,
      doNotRepeat:Array.isArray(memory?.nexo?.doNotRepeat)?memory.nexo.doNotRepeat.length:0
    },
    generatedAt:new Date().toISOString()
  };
}

export function beginNexoStep(mission, stepId){
  if(!mission?.steps?.length) return null;
  const next=structuredClone(mission);
  const step=next.steps.find(s=>s.id===stepId);
  if(!step||TERMINAL_STEP.has(step.status)) return next;
  const unmet=(step.dependsOn??[]).some(id=>next.steps.find(s=>s.id===id)?.status!=="completed");
  if(unmet){step.status="blocked";step.blockReason="DEPENDENCY_UNMET";next.status="blocked";next.objective="replan_from_constraints";return next;}
  step.status="executing"; next.status="executing"; next.objective=step.action;
  return next;
}

export function advanceNexoMission(mission,{stepId=null,outcome="completed",evidence=null}={}){
  if(!mission||!Array.isArray(mission.steps)||!["completed","failed","blocked"].includes(outcome)) return null;
  const next=structuredClone(mission);
  const step=next.steps.find(s=>s.id===stepId);
  if(!step||step.status!=="executing") return next;

  if(outcome==="completed"&&!evidenceAcceptable(evidence))
    return {...next,status:"blocked",blockReason:"MISSING_VERIFIED_EVIDENCE"};

  step.status=outcome; step.result=evidence??null;
  if(outcome==="failed") step.failure=evidence??null;
  if(outcome==="blocked") step.blockReason=evidence??"blocked";

  if(outcome==="failed"){
    next.status="needs_replan"; next.objective="replan_after_failure"; next.lastEvidence=evidence??null;
    return next;
  }
  if(outcome==="blocked"){
    next.status="blocked"; next.objective="replan_from_constraints"; next.lastEvidence=evidence??null;
    return next;
  }

  const executable=next.steps.find(s=>s.status==="planned"&&(s.dependsOn??[]).every(id=>next.steps.find(d=>d.id===id)?.status==="completed"));
  const unresolved=next.steps.some(s=>!TERMINAL_STEP.has(s.status));
  next.objective=executable?.action??(unresolved?"awaiting_dependencies":"verify_mission_outcome");
  next.status=executable?"planned":unresolved?"awaiting_verification":"awaiting_verification";
  next.lastEvidence=evidence;
  return next;
}

export function verifyNexoMission(mission,verification){
  if(!mission||!Array.isArray(mission.steps)) return {status:"invalid",verified:false};
  const failed=mission.steps.filter(s=>s.status==="failed");
  const blocked=mission.steps.filter(s=>s.status==="blocked");
  const unresolved=mission.steps.filter(s=>s.status!=="completed");
  if(failed.length) return {status:"needs_replan",verified:false,failed:failed.map(s=>s.id)};
  if(blocked.length) return {status:"blocked",verified:false,blocked:blocked.map(s=>s.id)};
  if(unresolved.length) return {status:"incomplete",verified:false,unresolved:unresolved.map(s=>s.id)};
  if(!evidenceAcceptable(verification)) return {status:"awaiting_verification",verified:false};
  return {status:"completed",verified:true,evidence:verification};
}

export function planNexoExecution(mission){
  if(!mission||!Array.isArray(mission.steps)) return {status:"invalid",actions:[]};
  const actions=mission.steps.filter(s=>s.status==="planned"&&(s.dependsOn??[]).every(id=>mission.steps.find(d=>d.id===id)?.status==="completed"))
    .map(s=>({stepId:s.id,action:s.action,target:s.target,dependsOn:s.dependsOn??[],reversible:s.reversible,requiresVerification:s.requiresVerification}));
  return {status:actions.length?"ready":"waiting",actions};
}
