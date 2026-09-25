// Núcleo de orquestación de Nexo para Lúmina.
// Convierte observaciones de especialistas en una misión acotada y verificable.
// No ejecuta efectos externos: propone pasos y conserva incertidumbre.
const severityRank={error:3,warning:2,info:1};

function collectFindings(reports=[]){
  return reports.flatMap(r=>(r?.findings??[]).map(f=>({...f,source:r?.assistant??"unknown"})))
    .sort((a,b)=>(severityRank[b.severity]??0)-(severityRank[a.severity]??0));
}

function actionFor(f){
  const map={
    NO_AGENTS:"restore_core_agents",
    AGENT_POSITION:"repair_agent_state",
    INVALID_NEED:"repair_agent_needs",
    MESH_MISSING:"repair_visual_mesh",
    NOT_IN_SCENE:"repair_scene_link",
    HIDDEN:"repair_visual_visibility",
    OFFSCREEN:"inspect_camera_framing",
    EXPLORER_STALLED:"advance_exploration_probe",
    BEHAVIOR_IDLE_SAMPLE:"collect_behavior_window",
    ROUTINE_PHASE_MISSING:"repair_routine_phase",
    NEGATIVE_RESOURCE:"repair_resource_state",
    SOCIAL_DEPRIVATION:"collect_social_window"
  };
  return map[f?.code]??"inspect_and_collect_evidence";
}

export function buildNexoMission({simulation=null,reports=[],memory=null}={}){
  const findings=collectFindings(reports);
  const steps=[];
  const seen=new Set();
  for(const finding of findings){
    const action=actionFor(finding);
    const key=action+"|"+(finding.agent??finding.resource??"global");
    if(seen.has(key)) continue;
    seen.add(key);
    steps.push({
      id:"step-"+(steps.length+1),
      action,
      priority:severityRank[finding.severity]??0,
      reason:finding.message??finding.code??"observación sin descripción",
      source:finding.source,
      reversible:true,
      requiresEvidence:action==="inspect_and_collect_evidence"
    });
  }
  if(!steps.length){
    steps.push({
      id:"step-1",
      action:"run_longitudinal_probe",
      priority:1,
      reason:"No hay fallos activos; obtener evidencia temporal antes de declarar estabilidad.",
      source:"Nexo",
      reversible:true,
      requiresEvidence:true
    });
  }
  return {
    version:1,
    missionId:"lumina-"+Date.now(),
    objective:steps[0].action,
    status:"planned",
    uncertainty:findings.some(f=>f.severity==="warning")?"present":"low",
    evidenceCount:reports.length,
    steps:steps.slice(0,8),
    memorySignals:Array.isArray(memory?.patterns)?memory.patterns.length:0,
    generatedAt:new Date().toISOString()
  };
}

export function advanceNexoMission(mission,{completedStepId=null,evidence=null}={}){
  if(!mission||!Array.isArray(mission.steps)) return null;
  const next=structuredClone(mission);
  if(completedStepId){
    const step=next.steps.find(s=>s.id===completedStepId);
    if(step) step.status="completed";
  }
  const pending=next.steps.find(s=>s.status!=="completed");
  next.objective=pending?.action??"verify_mission_outcome";
  next.status=pending?"planned":"awaiting_verification";
  next.lastEvidence=evidence??null;
  return next;
}
