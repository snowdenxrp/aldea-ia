import { executeAction } from "../actions.js";
import { createEffectAdapter } from "./effect-adapter.js";

function normalizeCoordinate(value){
  const n=Number(value);
  return Number.isFinite(n)?n:0;
}
function clamp(value,min=0,max=100){
  const n=Number(value);
  return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;
}
function stateVersion(simulation){
  simulation.nexoEffectRevision=Number(simulation.nexoEffectRevision??0);
  return simulation.nexoEffectRevision;
}
function bump(simulation){
  simulation.nexoEffectRevision=stateVersion(simulation)+1;
  return simulation.nexoEffectRevision;
}

const LUMINA_ACTIONS=new Set([
  "rest","drink","eat_plant","catch_fish","eat_fish","gather_wood","gather_stone",
  "build_shelter","craft_tool","farm","harvest","eat_farm_food",
  "contribute_commons","withdraw_commons","trade"
]);

export function createLuminaEffectAdapter(simulation){
  if(!simulation?.agents || !simulation?.world)
    throw new TypeError("simulation de Lúmina requerida");

  const handlers={
    repair_agent_state: async ({target})=>{
      const agent=simulation.agents.find(a=>a.id===target);
      if(!agent) return {status:"failed",code:"TARGET_AGENT_NOT_FOUND"};
      if(!agent.position || typeof agent.position!=="object") agent.position={};
      agent.position.x=normalizeCoordinate(agent.position.x);
      agent.position.z=normalizeCoordinate(agent.position.z);
      agent.alive=agent.alive!==false;
      bump(simulation);
      return {status:"completed",details:"agent_state_normalized",agentId:agent.id};
    },

    repair_agent_needs: async ({target})=>{
      const agent=simulation.agents.find(a=>a.id===target);
      if(!agent) return {status:"failed",code:"TARGET_AGENT_NOT_FOUND"};
      if(!agent.needs || typeof agent.needs!=="object") agent.needs={};
      for(const key of ["hunger","thirst","energy","social","safety","health"])
        agent.needs[key]=clamp(agent.needs[key]??100);
      bump(simulation);
      return {status:"completed",details:"agent_needs_normalized",agentId:agent.id};
    },

    repair_resource_state: async ({target})=>{
      const resource=simulation.world.resources?.[target];
      if(!resource || typeof resource!=="object")
        return {status:"failed",code:"TARGET_RESOURCE_NOT_FOUND"};
      if("amount" in resource) resource.amount=Math.max(0,Number(resource.amount)||0);
      bump(simulation);
      return {status:"completed",details:"resource_state_normalized",resourceId:target};
    },

    execute_lumina_action: async ({target,context})=>{
      if(!LUMINA_ACTIONS.has(context?.action?.name))
        return {status:"failed",code:"LUMINA_ACTION_NOT_ALLOWED"};
      const agent=simulation.agents.find(a=>a.id===target && a.alive!==false);
      if(!agent) return {status:"failed",code:"TARGET_AGENT_NOT_FOUND_OR_DEAD"};
      const action={...context.action};
      const beforeVersion=stateVersion(simulation);
      const result=executeAction(simulation,agent,action);
      if(!result?.success){
        // The underlying action remains the source of truth. A failed action is
        // still an observed physical outcome and is never promoted to success.
        return {
          status:"failed",
          code:"LUMINA_ACTION_FAILED",
          reason:result?.reason??"unknown_failure",
          actionResult:result,
          agentId:agent.id
        };
      }
      bump(simulation);
      return {
        status:"completed",
        details:"lumina_action_executed",
        action:action.name,
        actionResult:result,
        agentId:agent.id,
        stateVersionBefore:beforeVersion
      };
    }
  };

  return createEffectAdapter({
    getStateVersion:()=>stateVersion(simulation),
    handlers
  });
}
