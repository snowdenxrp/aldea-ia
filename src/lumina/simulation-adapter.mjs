import { isDeepStrictEqual } from "node:util";
import { executeAction } from "../actions.js";
import { createEffectAdapter } from "../shared/effect-adapter.mjs";
function normalizeCoordinate(value){const n=Number(value);return Number.isFinite(n)?n:0;}
function clamp(value,min=0,max=100){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}
function stateVersion(simulation){simulation.luminaSimulationRevision=Number(simulation.luminaSimulationRevision??0);return simulation.luminaSimulationRevision;}
function bump(simulation){simulation.luminaSimulationRevision=stateVersion(simulation)+1;return simulation.luminaSimulationRevision;}
const LUMINA_ACTIONS=new Set(["rest","drink","eat_plant","catch_fish","eat_fish","gather_wood","gather_stone","build_shelter","craft_tool","farm","harvest","eat_farm_food","contribute_commons","withdraw_commons","trade"]);
function assertSimulationRoot(simulation) {
  if (!simulation || typeof simulation !== "object" || Array.isArray(simulation)) {
    throw new TypeError("simulación de Lúmina requerida");
  }
  let prototype;
  try { prototype = Object.getPrototypeOf(simulation); }
  catch { throw new TypeError("simulación de Lúmina debe ser un registro de datos"); }
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("simulación de Lúmina debe ser un registro de datos");
  }
  for (const key of ["agents", "world", "luminaSimulationRevision", "luminaEffectJournal"]) {
    let descriptor;
    try { descriptor = Object.getOwnPropertyDescriptor(simulation, key); }
    catch { throw new TypeError("simulación de Lúmina debe contener campos de datos"); }
    if (descriptor && (!descriptor.enumerable || !("value" in descriptor))) {
      throw new TypeError("simulación de Lúmina debe contener campos de datos");
    }
    if (key === "luminaSimulationRevision" && descriptor && descriptor.writable !== true) {
      throw new TypeError("luminaSimulationRevision debe ser mutable");
    }
  }
  const revisionDescriptor = Object.getOwnPropertyDescriptor(simulation, "luminaSimulationRevision");
  const journalDescriptor = Object.getOwnPropertyDescriptor(simulation, "luminaEffectJournal");
  if (journalDescriptor && (!Array.isArray(journalDescriptor.value) || journalDescriptor.writable !== true || Object.isFrozen(journalDescriptor.value))) {
    throw new TypeError("luminaEffectJournal debe ser un array mutable propiedad de la simulación");
  }
  if (!revisionDescriptor || !journalDescriptor) {
    let extensible;
    try { extensible = Object.isExtensible(simulation); }
    catch { throw new TypeError("simulación de Lúmina debe permitir estado operacional propio"); }
    if (!extensible) throw new TypeError("simulación de Lúmina debe permitir estado operacional propio");
  }
  if (!journalDescriptor) simulation.luminaEffectJournal = [];
  const agents = Object.getOwnPropertyDescriptor(simulation, "agents")?.value;
  const world = Object.getOwnPropertyDescriptor(simulation, "world")?.value;
  if (!Array.isArray(agents) || !world || typeof world !== "object" || Array.isArray(world)) {
    throw new TypeError("simulación de Lúmina requerida");
  }
  return simulation;
}

export function createLuminaEffectAdapter(simulation) {
  if (arguments.length !== 1) {
    throw new TypeError("createLuminaEffectAdapter accepts only the simulation root");
  }
  assertSimulationRoot(simulation);
  const executionJournal = simulation.luminaEffectJournal;
  const handlers={
    repair_agent_state:async({target})=>{
      const agent=simulation.agents.find(a=>a.id===target);
      if(!agent)return{status:"failed",code:"TARGET_AGENT_NOT_FOUND"};
      // Missing/non-boolean life state is UNKNOWN, not permission to infer alive=true.
      if(typeof agent.alive!=="boolean")return{status:"failed",code:"AGENT_ALIVE_STATE_UNKNOWN",agentId:agent.id};
      const before=structuredClone({position:agent.position,alive:agent.alive});
      if(!agent.position||typeof agent.position!=="object")agent.position={};
      agent.position.x=normalizeCoordinate(agent.position.x);
      agent.position.z=normalizeCoordinate(agent.position.z);
      // Keep an explicit true/false value unchanged; normalization must not resurrect an agent.
      const changed=!isDeepStrictEqual(before,{position:agent.position,alive:agent.alive});
      if(changed)bump(simulation);
      return{status:"completed",details:"agent_state_normalized",agentId:agent.id,stateChanged:changed};
    },
    repair_agent_needs:async({target})=>{
      const agent=simulation.agents.find(a=>a.id===target);
      if(!agent)return{status:"failed",code:"TARGET_AGENT_NOT_FOUND"};
      const before=structuredClone(agent.needs);
      if(!agent.needs||typeof agent.needs!=="object")agent.needs={};
      for(const key of ["hunger","thirst","energy","social","safety","health"])agent.needs[key]=clamp(agent.needs[key]??100);
      const changed=!isDeepStrictEqual(before,agent.needs);
      if(changed)bump(simulation);
      return{status:"completed",details:"agent_needs_normalized",agentId:agent.id,stateChanged:changed};
    },
    repair_resource_state:async({target})=>{
      const resource=simulation.world.resources?.[target];
      if(!resource||typeof resource!=="object")return{status:"failed",code:"TARGET_RESOURCE_NOT_FOUND"};
      const before=structuredClone(resource.amount);
      resource.amount=Math.max(0,Number(resource.amount)||0);
      const changed=!isDeepStrictEqual(before,resource.amount);
      if(changed)bump(simulation);
      return{status:"completed",details:"resource_state_normalized",resourceId:target,stateChanged:changed};
    },
    execute_lumina_action:async({target,context})=>{if(!LUMINA_ACTIONS.has(context?.action?.name))return{status:"failed",code:"LUMINA_ACTION_NOT_ALLOWED"};const agent=simulation.agents.find(a=>a.id===target&&a.alive!==false);if(!agent)return{status:"failed",code:"TARGET_AGENT_NOT_FOUND_OR_DEAD"};const action={...context.action};const beforeVersion=stateVersion(simulation);const beforeState=structuredClone({agents:simulation.agents,world:simulation.world});const result=executeAction(simulation,agent,action);const stateChanged=!isDeepStrictEqual(beforeState,{agents:simulation.agents,world:simulation.world});if(stateChanged)bump(simulation);if(!result?.success)return{status:"failed",code:"LUMINA_ACTION_FAILED",reason:result?.reason??"unknown_failure",actionResult:result,agentId:agent.id,stateChanged,stateVersionBefore:beforeVersion,stateVersionAfter:stateVersion(simulation)};return{status:"completed",details:"lumina_action_executed",action:action.name,actionResult:result,agentId:agent.id,stateVersionBefore:beforeVersion,stateVersionAfter:stateVersion(simulation)};}
  };
  return createEffectAdapter({getStateVersion:()=>stateVersion(simulation),handlers,executionJournal});
}
