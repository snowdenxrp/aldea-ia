import { executeAction } from "../actions.js";
import { createEffectAdapter } from "./effect-adapter.js";
function normalizeCoordinate(value){const n=Number(value);return Number.isFinite(n)?n:0;}
function clamp(value,min=0,max=100){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}
function stateVersion(simulation){simulation.nexoEffectRevision=Number(simulation.nexoEffectRevision??0);return simulation.nexoEffectRevision;}
function bump(simulation){simulation.nexoEffectRevision=stateVersion(simulation)+1;return simulation.nexoEffectRevision;}
const LUMINA_ACTIONS=new Set(["rest","drink","eat_plant","catch_fish","eat_fish","gather_wood","gather_stone","build_shelter","craft_tool","farm","harvest","eat_farm_food","contribute_commons","withdraw_commons","trade"]);
function actionEvidenceValid(simulation,target,action,effectResult){
  if(!effectResult?.success)return false;
  const agent=simulation.agents.find(a=>a.id===target); if(!agent||agent.alive===false)return false;
  const numericAmount=effectResult.amount==null||(Number.isFinite(Number(effectResult.amount))&&Number(effectResult.amount)>0); if(!numericAmount)return false;
  switch(action?.name){
    case "rest":return effectResult.effect==="energy_recovered"&&Number(agent.needs?.energy)>=0;
    case "drink":return effectResult.effect==="thirst_recovered"&&agent.currentActivity==="drinking"&&Number(agent.needs?.thirst)>=0;
    case "eat_plant":return effectResult.effect==="plant_experiment"&&agent.currentActivity==="eating";
    case "catch_fish":return effectResult.effect==="fish_caught"&&agent.currentActivity==="fishing"&&agent.inventory.some(i=>i.type==="fish"&&i.amount>0);
    case "eat_fish":return effectResult.effect==="fish_eaten"&&agent.currentActivity==="eating";
    case "gather_wood":return effectResult.effect==="wood_gathered"&&agent.currentActivity==="gathering"&&agent.inventory.some(i=>i.type==="wood"&&i.amount>0);
    case "gather_stone":return effectResult.effect==="stone_gathered"&&agent.currentActivity==="gathering"&&agent.inventory.some(i=>i.type==="stone"&&i.amount>0);
    case "eat_farm_food":return effectResult.effect==="farm_food_eaten"&&agent.currentActivity==="eating";
    case "build_shelter":return effectResult.effect==="shelter_built"||effectResult.success===true;
    case "craft_tool":case "farm":case "harvest":case "contribute_commons":case "withdraw_commons":case "trade":return effectResult.success===true;
    default:return false;
  }
}
export function createLuminaActionPostcondition(simulation,action,target){return ({effectResult})=>actionEvidenceValid(simulation,target,action,effectResult?.actionResult??effectResult);}
export function createLuminaEffectPostcondition(simulation,action,target){
  return ({effectResult})=>{
    if(effectResult?.status!=="completed")return false;
    const agent=target?simulation.agents?.find(a=>a.id===target):null;
    switch(action){
      case "repair_agent_state": return !!agent && Number.isFinite(Number(agent.position?.x)) && Number.isFinite(Number(agent.position?.z)) && agent.alive!==false;
      case "repair_agent_needs": return !!agent && ["hunger","thirst","energy","social","safety","health"].every(k=>Number.isFinite(Number(agent.needs?.[k]))&&Number(agent.needs[k])>=0&&Number(agent.needs[k])<=100);
      case "repair_resource_state": { const resource=simulation.world?.resources?.[target]; return !!resource && Number.isFinite(Number(resource.amount)) && Number(resource.amount)>=0; }
      default: return false;
    }
  };
}
export function createLuminaEffectAdapter(simulation,{executionJournal=null,persistPreparedIntent=null}={}){
  if(!simulation?.agents||!simulation?.world)throw new TypeError("simulación de Lúmina requerida");
  const handlers={
    repair_agent_state:async({target})=>{const agent=simulation.agents.find(a=>a.id===target);if(!agent)return{status:"failed",code:"TARGET_AGENT_NOT_FOUND"};if(!agent.position||typeof agent.position!=="object")agent.position={};agent.position.x=normalizeCoordinate(agent.position.x);agent.position.z=normalizeCoordinate(agent.position.z);agent.alive=agent.alive!==false;bump(simulation);return{status:"completed",details:"agent_state_normalized",agentId:agent.id};},
    repair_agent_needs:async({target})=>{const agent=simulation.agents.find(a=>a.id===target);if(!agent)return{status:"failed",code:"TARGET_AGENT_NOT_FOUND"};if(!agent.needs||typeof agent.needs!=="object")agent.needs={};for(const key of ["hunger","thirst","energy","social","safety","health"])agent.needs[key]=clamp(agent.needs[key]??100);bump(simulation);return{status:"completed",details:"agent_needs_normalized",agentId:agent.id};},
    repair_resource_state:async({target})=>{const resource=simulation.world.resources?.[target];if(!resource||typeof resource!=="object")return{status:"failed",code:"TARGET_RESOURCE_NOT_FOUND"};if("amount"in resource)resource.amount=Math.max(0,Number(resource.amount)||0);bump(simulation);return{status:"completed",details:"resource_state_normalized",resourceId:target};},
    execute_lumina_action:async({target,context})=>{if(!LUMINA_ACTIONS.has(context?.action?.name))return{status:"failed",code:"LUMINA_ACTION_NOT_ALLOWED"};const agent=simulation.agents.find(a=>a.id===target&&a.alive!==false);if(!agent)return{status:"failed",code:"TARGET_AGENT_NOT_FOUND_OR_DEAD"};const action={...context.action};const beforeVersion=stateVersion(simulation);const result=executeAction(simulation,agent,action);if(!result?.success)return{status:"failed",code:"LUMINA_ACTION_FAILED",reason:result?.reason??"unknown_failure",actionResult:result,agentId:agent.id};bump(simulation);return{status:"completed",details:"lumina_action_executed",action:action.name,actionResult:result,agentId:agent.id,stateVersionBefore:beforeVersion};}
  };
  return createEffectAdapter({getStateVersion:()=>stateVersion(simulation),handlers,executionJournal,persistPreparedIntent});
}
