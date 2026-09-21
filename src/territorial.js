// Contexto territorial: traduce bioma, recursos y desarrollo local en señales de decisión.
import { getBiomeForRegion, getRegionForPosition, normalizeSpatialWorld } from "./spatial.js";

const ACTION_BY_RESOURCE = Object.freeze({
  gather_wood:"wood", gather_stone:"stone", eat_plant:"wild_plants", catch_fish:"fish",
  farm:"fertile_land", harvest:"fertile_land", explore_wood:"wood", explore_stone:"stone",
  explore_plants:"wild_plants", explore_fishing:"fish", explore_farming:"fertile_land"
});

export function getTerritorialContext(agent, world) {
  normalizeSpatialWorld(world);
  const region=getRegionForPosition(agent.position,world);
  const biome=getBiomeForRegion(region,world);
  const modifiers=biome.modifiers ?? biome;
  const nearby=Object.entries(world.resources??{}).map(([type,r])=>{
    const dx=Number(r.position?.x??0)-Number(agent.position?.x??0), dz=Number(r.position?.z??0)-Number(agent.position?.z??0);
    return {type,distance:Math.hypot(dx,dz),quality:Math.max(0,Number(r.quality??1)),amount:Math.max(0,Number(r.amount??0))};
  }).filter(r=>r.distance<=30);
  const opportunities={};
  for(const [action,type] of Object.entries(ACTION_BY_RESOURCE)){
    const r=nearby.find(x=>x.type===type);
    let value=r ? Math.max(0,Math.min(2,(r.quality+.25)*(1-r.distance/30))) : 0;
    if(type==="wood") value*=modifiers.wood;
    if(type==="stone") value*=modifiers.stone;
    if(type==="fish"||type==="water") value*=modifiers.water;
    if(type==="fertile_land"||type==="wild_plants") value*=modifiers.food;
    opportunities[action]=Math.min(2,value);
  }
  const state=world.spatial.regions?.[region.key]??{};
  return {regionKey:region.key,biome:biome.type,movement:modifiers.movement,opportunities,
    settlementLevel:Math.max(0,Number(state.settlementLevel??0)),visits:Math.max(0,Number(state.visits??0))};
}
export function territorialActionBonus(context,actionName) {
  const t=context?.territory;if(!t)return 0;
  let bonus=Math.min(1.25,Number(t.opportunities?.[actionName]??0)*.65);
  if(actionName==="explore_area"&&t.visits<3) bonus+=.18;
  if(actionName==="rest"&&t.settlementLevel>1) bonus+=.08;
  return bonus;
}
