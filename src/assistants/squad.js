// Escuadrón de asistentes especializados de Lúmina.
// Cada especialista observa un frente distinto y devuelve evidencia; ninguno decide por sí solo.

function safeAgents(simulation){return Array.isArray(simulation?.agents)?simulation.agents:[];}
function bounded(v,min=0,max=1){return Math.max(min,Math.min(max,Number(v)||0));}

export function runVisualAssistant({simulation,renderProbe=null}={}){
  const agents=safeAgents(simulation); const moving=agents.filter(a=>a?.movement?.moving).length;
  const findings=[];
  if(renderProbe){for(const [id,p] of Object.entries(renderProbe.agents??{})){if(!p?.mesh) findings.push({severity:"error",code:"VISUAL_MESH_MISSING",agent:id});}}
  if(agents.length&&moving===0) findings.push({severity:"info",code:"VISUAL_NO_LOCOMOTION_SAMPLE",message:"La muestra no contiene locomoción; puede requerir una ventana mayor."});
  return {assistant:"VisualAgent",status:findings.some(f=>f.severity==="error")?"error":"ok",observations:{agents:agents.length,moving},findings};
}

export function runExplorerAssistant({simulation}={}){
  const agents=safeAgents(simulation); const explored=agents.map(a=>({id:a.id,areas:Array.isArray(a.exploredAreas)?a.exploredAreas.length:0,regions:Number(a.explorationState?.regionsVisited??0)}));
  const known=Array.isArray(simulation?.world?.spatial?.knownRegions)?simulation.world.spatial.knownRegions.length:0;
  const findings=[];
  for(const a of explored) if(a.areas===0&&a.regions===0) findings.push({severity:"warning",code:"EXPLORER_STALLED",agent:a.id,message:"No registra exploración todavía."});
  return {assistant:"ExplorerAgent",status:findings.some(f=>f.severity==="warning")?"warning":"ok",observations:{knownRegions:known,agents:explored},findings};
}

export function runBehaviorAssistant({simulation}={}){
  const agents=safeAgents(simulation); const activities=Object.fromEntries(agents.map(a=>[a.id,a.currentActivity??"idle"]));
  const active=agents.filter(a=>a.currentActivity&&a.currentActivity!=="idle"&&a.currentActivity!=="resting").length;
  const findings=[];
  if(agents.length&&active===0) findings.push({severity:"warning",code:"BEHAVIOR_IDLE_SAMPLE",message:"Todos los habitantes están en actividad pasiva en esta muestra."});
  return {assistant:"BehaviorAgent",status:findings.some(f=>f.severity==="warning")?"warning":"ok",observations:{active,activities},findings};
}

export function runEcosystemAssistant({simulation}={}){
  const resources=simulation?.world?.resources??{}; const measured=Object.entries(resources).filter(([,r])=>r&&Number.isFinite(Number(r.amount))).map(([type,r])=>({type,amount:Number(r.amount)}));
  const findings=measured.filter(r=>r.amount<0).map(r=>({severity:"error",code:"NEGATIVE_RESOURCE",resource:r.type,amount:r.amount}));
  return {assistant:"EcosystemAgent",status:findings.length?"error":"ok",observations:{resources:measured.length},findings};
}

export function runSocietyAssistant({simulation}={}){
  const agents=safeAgents(simulation); const social=agents.map(a=>Number(a.needs?.social??0));
  const avg=social.length?social.reduce((a,b)=>a+b,0)/social.length:0;
  const findings=avg<15&&social.length?[{severity:"warning",code:"SOCIAL_DEPRIVATION",message:"Promedio social bajo."}]:[];
  return {assistant:"SocietyAgent",status:findings.length?"warning":"ok",observations:{averageSocial:bounded(avg/100)*100},findings};
}

export function runRoutineAssistant({simulation}={}){ const agents=safeAgents(simulation); const routines=agents.map(a=>({id:a.id,phase:a.activityPhase??null,sequence:a.activitySequence?.intentName??null,remaining:Number(a.activitySequence?.remainingHours??0)})); const active=routines.filter(r=>r.sequence); const findings=[]; for(const r of active) if(!r.phase) findings.push({severity:"error",code:"ROUTINE_PHASE_MISSING",agent:r.id,message:"Existe una rutina activa sin fase observable."}); return {assistant:"RoutineAgent",status:findings.length?"error":"ok",observations:{activeRoutines:active.length,routines},findings}; }\n\nexport function runAuditAgent({simulation,reports=[]}={}){
  const errors=reports.flatMap(r=>r?.findings??[]).filter(f=>f.severity==="error").length;
  const warnings=reports.flatMap(r=>r?.findings??[]).filter(f=>f.severity==="warning").length;
  return {assistant:"AuditAgent",status:errors?"error":warnings?"warning":"ok",observations:{specialists:reports.length,errors,warnings},findings:errors?[{severity:"error",code:"SPECIALIST_ERRORS",message:"Hay hallazgos críticos que requieren integración."}]:[]};
}

export function runAssistantSquad({simulation,renderProbe=null}={}){
  const reports=[runVisualAssistant({simulation,renderProbe}),runExplorerAssistant({simulation}),runBehaviorAssistant({simulation}),runRoutineAssistant({simulation}),runEcosystemAssistant({simulation}),runSocietyAssistant({simulation})];
  const audit=runAuditAgent({simulation,reports});
  return {version:1,reports:[...reports,audit],status:audit.status};
}
