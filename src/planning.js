// Planificación adaptativa: objetivos compuestos construidos desde estado actual.
// El plan no prescribe una historia; se descarta o replantea cuando cambia el mundo.
export function inferPlan(agent, world) {
  const plans = [];
  const food = (agent.inventory ?? []).reduce((s,i)=>s+(i.type==="fish"||i.type==="farm_food"?Number(i.amount)||0:0),0);
  if (agent.needs.hunger < 45 && food <= 0) plans.push({ goal:"food", steps:["catch_fish","eat_fish"] });
  if (agent.needs.hunger < 45 && Number(agent.inventory?.find(i=>i.type==="farm_food")?.amount||0)>0) plans.push({goal:"food",steps:["eat_farm_food"]});
  if (!agent.home && !agent.farm) {
    const wood=(agent.inventory??[]).find(i=>i.type==="wood")?.amount||0;
    const stone=(agent.inventory??[]).find(i=>i.type==="stone")?.amount||0;
    if (wood>=12&&stone>=6) plans.push({goal:"shelter",steps:["build_shelter"]});
    else if (wood<12) plans.push({goal:"shelter",steps:["gather_wood","build_shelter"]});
    else if (stone<6) plans.push({goal:"shelter",steps:["gather_stone","build_shelter"]});
  }
  if (!agent.farm && (agent.inventory??[]).some(i=>i.type==="wood"&&i.amount>=4)) plans.push({goal:"food_production",steps:["farm","harvest","eat_farm_food"]});
  return plans.sort((a,b)=>goalPressure(agent,b.goal)-goalPressure(agent,a.goal));
}
export function maintainPlan(agent, world) {
  const plans=inferPlan(agent,world);
  const current=agent.plan;
  if (!current || !plans.some(p=>p.goal===current.goal)) {
    agent.plan=plans[0] ? {...plans[0], createdDay:world.day, progress:0} : null;
    return agent.plan;
  }
  current.steps=current.steps.filter(step=>!isSatisfied(agent,world,step));
  if (!current.steps.length) agent.plan=null;
  return agent.plan;
}
function isSatisfied(agent,world,step) {
  if(step==="build_shelter") return Boolean(agent.home);
  if(step==="farm") return Boolean(agent.farm);
  if(step==="eat_fish") return Number(agent.inventory?.find(i=>i.type==="fish")?.amount||0)<=0;
  if(step==="eat_farm_food") return Number(agent.inventory?.find(i=>i.type==="farm_food")?.amount||0)<=0;
  if(step==="gather_wood") return Number(agent.inventory?.find(i=>i.type==="wood")?.amount||0)>=12;
  if(step==="gather_stone") return Number(agent.inventory?.find(i=>i.type==="stone")?.amount||0)>=6;
  return false;
}
function goalPressure(agent,goal) {
  if(goal==="food") return Math.max(0,50-agent.needs.hunger);
  if(goal==="shelter") return Math.max(0,60-agent.needs.safety);
  if(goal==="food_production") return Math.max(0,45-agent.needs.hunger);
  return 0;
}
