import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { world } from "./world.js";
import { createInitialAgents } from "./agents.js";
import { createSimulation, tick } from "./simulation.js";
import { setMovementTarget, moveAgent } from "./movement.js";
import { getRegionForPosition, getBiomeForRegion, normalizeSpatialWorld } from "./spatial.js";

const app=document.querySelector("#app"), worldTime=document.querySelector("#worldTime");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9ec9df);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.domElement.style.touchAction="none"; renderer.domElement.style.userSelect="none"; app.appendChild(renderer.domElement);
const light=new THREE.DirectionalLight(0xffffff,2.2); light.position.set(12,25,10); light.castShadow=true; light.shadow.mapSize.set(2048,2048); scene.add(light,new THREE.HemisphereLight(0xbfe7ff,0x6f8f58,1.2));
normalizeSpatialWorld(world);
const homeRegion=getRegionForPosition({x:0,z:0},world);
const homeBiome=getBiomeForRegion(homeRegion,world);
const biomeGroundColors={forest:0x587f4a,plains:0x6f9b58,mountain:0x77715f,wetland:0x5f8a70,arid:0x9a8557};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90,12,12),new THREE.MeshStandardMaterial({color:biomeGroundColors[homeBiome.type]??biomeGroundColors.plains,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const environmentMeshes=[];
function addTree(x,z,scale=1){
  const g=new THREE.Group(); const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,1.3,7),material(0x68452f)); trunk.position.y=.65; const crown=new THREE.Mesh(new THREE.SphereGeometry(.85,10,8),material(0x3f7138)); crown.position.y=1.55; crown.scale.set(1,.9,1); g.add(trunk,crown); g.scale.setScalar(scale); g.position.set(x,0,z); g.traverse(o=>{if(o.isMesh)o.castShadow=true;}); scene.add(g); environmentMeshes.push(g);
}
function addRock(x,z,scale=1){
  const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.55,1),material(0x77736b,.95)); m.scale.set(scale,scale*.72,scale*1.15); m.position.set(x,.4*scale,z); m.castShadow=true; scene.add(m); environmentMeshes.push(m);
}
function addPlant(x,z,scale=1){
  const g=new THREE.Group(); for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(.08,.55,5),material(0x5f8d3c)); p.position.set(Math.cos(i*1.256)*.13,.27,Math.sin(i*1.256)*.13); p.rotation.z=(i%2?.2:-.2); g.add(p);} g.scale.setScalar(scale); g.position.set(x,0,z); scene.add(g); environmentMeshes.push(g);
}
const BIOME_VISUALS={forest:{trees:42,rocks:7,plants:24,treeScale:1.05,plantScale:1},plains:{trees:12,rocks:7,plants:34,treeScale:.82,plantScale:.95},mountain:{trees:8,rocks:30,plants:8,treeScale:.78,plantScale:.7},wetland:{trees:18,rocks:10,plants:42,treeScale:.9,plantScale:1.08},arid:{trees:3,rocks:22,plants:7,treeScale:.72,plantScale:.65}};
function buildBiomeEnvironment(biomeType){
  const v=BIOME_VISUALS[biomeType]??BIOME_VISUALS.plains;
  for(let i=0;i<v.trees;i++){const a=i*2.399;const r=9+(i%7)*2;addTree(18+Math.cos(a)*r,8+Math.sin(a)*r,v.treeScale*(.8+(i%4)*.08));}
  for(let i=0;i<v.rocks;i++){const a=i*2.618;const r=7+(i%5)*2;addRock(24+Math.cos(a)*r,15+Math.sin(a)*r,.6+(i%3)*.12);}
  for(let i=0;i<v.plants;i++){const a=i*2.399;const r=6+(i%6)*1.4;addPlant(-2+Math.cos(a)*r,-8+Math.sin(a)*r,v.plantScale*(.8+(i%3)*.1));}
}
buildBiomeEnvironment(homeBiome.type);

const river=new THREE.Mesh(new THREE.PlaneGeometry(10,90),new THREE.MeshStandardMaterial({color:0x4f9ed1})); river.rotation.x=-Math.PI/2; river.position.set(-18,.03,0); scene.add(river);
const structureMeshes=new Map();
function material(color,roughness=.8){return new THREE.MeshStandardMaterial({color,roughness});}
function box(w,h,d,color){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));}
function createHouse(s){
  const g=new THREE.Group(); g.userData.structureId=s.id;
  const wall=box(3.8,2.5,3.4,0xc89b6b); wall.position.y=1.25;
  const roof=new THREE.Mesh(new THREE.ConeGeometry(2.75,1.65,4),material(0x7a4b32)); roof.rotation.y=Math.PI/4; roof.position.y=3.32;
  const door=box(.72,1.35,.12,0x593823); door.position.set(0,.68,1.75);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),material(0xd5b36b)); knob.position.set(.22,.72,1.84);
  const winL=box(.65,.58,.08,0x7db8c9); winL.position.set(-1.12,1.45,1.73);
  const winR=winL.clone(); winR.position.x=1.12;
  const chimney=box(.38,.9,.38,0x6a4435); chimney.position.set(1.15,3.55,0);
  const step=box(1,.18,.5,0x8c735e); step.position.set(0,.09,1.98);
  g.add(wall,roof,door,knob,winL,winR,chimney,step);
  g.position.set(s.position?.x??0,0,s.position?.z??0);
  return g;
}
function createFarm(s){
  const g=new THREE.Group(); g.userData.structureId=s.id;
  const soil=box(4,.12,3.2,0x795332); soil.position.y=.06;
  for(let x=-1.5;x<=1.5;x+=.75) for(let z=-1.1;z<=1.1;z+=.7){
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.28,5),material(0x4c7a36)); stem.position.set(x,.25,z);
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(.1,7,5),material(0x5f913d)); leaf.position.set(x,.39,z); g.add(stem,leaf);
  }
  g.add(soil); g.position.set(s.position?.x??0,.0,s.position?.z??0); return g;
}
function syncSettlementVisualState(){
  const regions=simulation.world.spatial?.regions??{};
  const populationByRegion=new Map();
  for(const agent of simulation.agents??[]){
    if(!agent?.alive)continue;
    const key=agent.position?getRegionKeyForVisual(agent.position):null;
    if(key)populationByRegion.set(key,(populationByRegion.get(key)||0)+1);
  }
  for(const [id,m] of structureMeshes){
    const x=m.position.x,z=m.position.z;
    const key=getRegionKeyForVisual({x,z});
    const state=regions[key];
    const level=Number(state?.settlementLevel??0);
    m.scale.setScalar(1+Math.min(.12,level*.02));
    m.userData.settlementLevel=level;
  }
}
function getRegionKeyForVisual(position){
  const size=Number(simulation.world.spatial?.regionSize??8);
  const minX=Number(simulation.world.bounds?.minX??-34), minZ=Number(simulation.world.bounds?.minZ??-34);
  return Math.floor((Number(position.x)-minX)/size)+":"+Math.floor((Number(position.z)-minZ)/size);
}

function syncStructures(){
  const structures=simulation.world.structures??{};
  const all=[...(structures.shelters??[]).map(s=>({...s,type:"shelter"})),...(structures.farms??[]).map(s=>({...s,type:"farm"}))];
  const live=new Set(all.map(s=>s.id));
  for(const s of all){if(structureMeshes.has(s.id)) continue; const m=s.type==="farm"?createFarm(s):createHouse(s); structureMeshes.set(s.id,m); scene.add(m);}
  for(const [id,m] of structureMeshes) m.visible=live.has(id);
}

const agents=createInitialAgents(),simulation=createSimulation(world,agents),SAVE_KEY="lumina-world-v10";
let selectedAgentId=null;
let cameraTarget=new THREE.Vector3(1,0,1),cameraDistance=34,cameraYaw=.55,cameraPitch=.58,last=performance.now(),lastSave=last,fault=null;
const meshes=new Map();
function validState(s){return s&&s.world?.resources&&Array.isArray(s.agents)&&s.agents.some(a=>a?.id==="alex")&&s.agents.some(a=>a?.id==="bruno");}
function normalize(){for(const fallback of createInitialAgents()){let a=agents.find(x=>x.id===fallback.id);if(!a){a=structuredClone(fallback);agents.push(a);}if (typeof a.alive !== "boolean") a.alive = fallback.alive;a.position??={...fallback.position};a.position.x=Number.isFinite(+a.position.x)?+a.position.x:fallback.position.x;a.position.z=Number.isFinite(+a.position.z)?+a.position.z:fallback.position.z;a.position.x=Math.max(world.bounds.minX,Math.min(world.bounds.maxX,a.position.x));a.position.z=Math.max(world.bounds.minZ,Math.min(world.bounds.maxZ,a.position.z));a.currentActivity??="idle";a.currentIntent??=null;a.worldBounds={minX:world.bounds.minX,maxX:world.bounds.maxX,minZ:world.bounds.minZ,maxZ:world.bounds.maxZ};a.decisionCooldownHours=Number.isFinite(+a.decisionCooldownHours)?Math.max(0,+a.decisionCooldownHours):0;a.lastActionName??=null;a.needs??={hunger:100,thirst:100,energy:100,social:100,safety:100,health:100};a.inventory??=[];a.knowledge??=[];a.relationships??=[];a.experiences??=[];}}
function applyState(s){Object.assign(world,structuredClone(s.world));simulation.day=Number(s.day)||world.day||1;simulation.hour=Number.isFinite(+s.hour)?+s.hour:(world.timeOfDay||8);simulation.events=Array.isArray(s.events)?s.events.slice(-500):[];agents.splice(0,agents.length,...structuredClone(s.agents));normalize();world.day=simulation.day;world.timeOfDay=simulation.hour;}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:8,savedAt:Date.now(),day:simulation.day,hour:simulation.hour,world,agents,events:simulation.events.slice(-500)}));}catch{}}
function loadLocal(){try{const current=JSON.parse(localStorage.getItem(SAVE_KEY)||"null"),legacy=["lumina-world-v8","lumina-world-v7","lumina-world-v6","lumina-world-v5","lumina-world-v4","lumina-world-v3"].map(k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}}).filter(validState);let chosen=validState(current)?current:null;if(legacy.length){const best=legacy.sort((a,b)=>(+b.savedAt||0)-(+a.savedAt||0))[0];if(!chosen||(+best.day>+chosen.day||(+best.day===+chosen.day&&+best.hour>+chosen.hour)))chosen=best;}if(chosen)applyState(chosen);}catch{}}
async function loadRemoteIfNeeded(){try{const local=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");const r=await fetch("./world-state.json?ts="+Date.now(),{cache:"no-store"});if(!r.ok)return;const remote=await r.json();if(!validState(remote))return;
if(Number(remote?.version)<4){
  const plants=remote.world?.resources?.wild_plants, fish=remote.world?.resources?.fish;
  if(plants && Number(plants.amount)<=0) plants.amount=80;
  if(fish && Number(fish.amount)<=0) fish.amount=60;
}
const localStamp=(Number(local?.day)||0)*24+(Number(local?.hour)||0);const remoteStamp=(Number(remote?.day)||0)*24+(Number(remote?.hour)||0);if(!validState(local)||remoteStamp>localStamp){applyState(remote);save();syncMeshes();syncStructures();syncSettlementVisualState();centerOnAgents();}}catch{}}
function createMesh(a){
  const g=new THREE.Group(); g.userData.agentId=a.id; g.scale.setScalar(1.42);
  const blue=a.id==="alex", skin=0xf0bd91, clothes=blue?0x2f7de1:0xe87832, dark=blue?0x1f4f8c:0xb45624;
  const skinMat=material(skin,.9), clothMat=material(clothes,.82), darkMat=material(dark,.88), hairMat=material(0x3b2a22,1), shoeMat=material(0x3b332f,1);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.62,8,12),clothMat); torso.position.y=1.18;
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,6,16),skinMat); collar.rotation.x=Math.PI/2; collar.position.y=1.52;
  const pelvis=new THREE.Mesh(new THREE.CapsuleGeometry(.31,.22,8,12),darkMat); pelvis.position.y=.76;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),skinMat); head.scale.set(1,.98,.96); head.position.y=1.91;
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.355,20,12,0,Math.PI*2,0,Math.PI*.58),hairMat); hair.position.y=2.04;
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),skinMat); nose.position.set(0,1.91,.335);
  const eyeMat=new THREE.MeshBasicMaterial({color:0x18222b,depthTest:false});
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),eyeMat), eyeR=eyeL.clone(); eyeL.position.set(-.115,1.98,.315); eyeR.position.set(.115,1.98,.315);
  const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.48,6,9),clothMat), armR=armL.clone(); armL.position.set(-.39,1.2,0); armR.position.set(.39,1.2,0); armL.rotation.z=-.08; armR.rotation.z=.08;
  const handL=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),skinMat), handR=handL.clone(); handL.position.set(-.39,.89,0); handR.position.set(.39,.89,0);
  const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.58,6,9),darkMat), legR=legL.clone(); legL.position.set(-.16,.47,0); legR.position.set(.16,.47,0);
  const footL=new THREE.Mesh(new THREE.SphereGeometry(.14,12,8),shoeMat), footR=footL.clone(); footL.scale.set(1,.55,1.45); footR.scale.set(1,.55,1.45); footL.position.set(-.16,.13,.08); footR.position.set(.16,.13,.08);
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:blue?0x59b7ff:0xffb15c,depthTest:false})); marker.position.y=2.47;
  const role=a.specialization?.role??a.socialRole;
  const accessoryGroup=new THREE.Group();
  if(role==="farmer"){const hat=new THREE.Mesh(new THREE.ConeGeometry(.34,.22,12),material(0x6b4b2d));hat.position.y=2.28;accessoryGroup.add(hat);}
  if(role==="builder"||role==="craftsperson"){const belt=new THREE.Mesh(new THREE.TorusGeometry(.29,.035,6,16),darkMat);belt.rotation.x=Math.PI/2;belt.position.y=.92;accessoryGroup.add(belt);}
  if(role==="trader"){const bag=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),material(0x6a4d38));bag.scale.set(1,.8,.7);bag.position.set(.43,1.02,.08);accessoryGroup.add(bag);}
  if(role==="gatherer"){const basket=new THREE.Mesh(new THREE.TorusGeometry(.18,.055,6,12),material(0x9a6b35));basket.rotation.x=Math.PI/2;basket.position.set(-.43,.98,.08);accessoryGroup.add(basket);}
  accessoryGroup.position.z=.02;
  g.add(accessoryGroup); g.userData.accessoryRole=role??null;
  const activityToolGroup=new THREE.Group();
  const handle=box(.045,.55,.045,0x6b4b32),toolHead=box(.22,.08,.08,0x8b9298);
  handle.position.y=.28; toolHead.position.set(0,.55,0); activityToolGroup.add(handle,toolHead);
  activityToolGroup.position.set(.48,1.02,.18); activityToolGroup.visible=false;
  g.add(activityToolGroup); g.userData.activityTools={group:activityToolGroup,handle,toolHead};
  g.add(torso,collar,pelvis,head,hair,nose,eyeL,eyeR,armL,armR,handL,handR,legL,legR,footL,footR,marker); g.userData.parts={armL,armR,legL,legR};
  g.traverse(o=>{if(o.isMesh)o.renderOrder=1000;}); return (scene.add(g),g);
}
function animateHumanoid(m,a,t){
  const parts=m.userData.parts; if(!parts)return;
  const activity=a.currentActivity??"idle";
  const phase=t*7+(a.id==="alex"?0:1.7);
  const walk=Math.sin(phase);
  const moving=["moving","gathering","fishing","cooperating"].includes(activity);
  let armL=0,armR=0,legL=0,legR=0,bounce=0;
  if(activity==="moving"||activity==="cooperating"){
    armL=walk*.45; armR=-walk*.45; legL=-walk*.75; legR=walk*.75; bounce=Math.abs(Math.sin(phase*2))*.025;
  } else if(activity==="gathering"){
    const work=Math.sin(t*10);
    armL=-.35+work*.8; armR=.18-work*.35; legL=.08; legR=-.08; bounce=Math.abs(work)*.012;
  } else if(activity==="fishing"){
    const work=Math.sin(t*2.6);
    armL=-.15+work*.22; armR=-.25+work*.18; legL=.04; legR=-.04;
  } else if(activity==="eating"){
    const work=(Math.sin(t*5)+1)*.5;
    armL=-.65*work; armR=-.65*work; legL=.03; legR=-.03;
  } else if(activity==="drinking"){
    const work=(Math.sin(t*3)+1)*.5;
    armL=-.9*work; armR=-.15; legL=.02; legR=-.02;
  } else if(activity==="resting"){
    armL=Math.sin(t*1.5)*.035; armR=-armL;
  } else {
    armL=Math.sin(t*2)*.035; armR=-armL;
  }
  parts.armL.rotation.x=armL; parts.armR.rotation.x=armR;
  parts.legL.rotation.x=legL; parts.legR.rotation.x=legR;
  m.position.y=bounce;
  m.userData.animationActivity=activity;
}
function syncMeshes(){normalize();syncStructures();const t=performance.now()/1000;for(const a of agents){let m=meshes.get(a.id);if(!m){m=createMesh(a);meshes.set(a.id,m);}m.visible=true;m.position.set(a.position.x,m.position.y??0,a.position.z);animateHumanoid(m,a,t);}}
function centerOnAgents(){const c=agents.filter(a=>a.id==="alex"||a.id==="bruno");if(c.length)cameraTarget.set(c.reduce((s,a)=>s+a.position.x,0)/c.length,0,c.reduce((s,a)=>s+a.position.z,0)/c.length);}
function centerOnAgent(a){if(a)cameraTarget.set(+a.position.x||0,0,+a.position.z||0);}
function updateCamera(){const h=cameraDistance*Math.cos(cameraPitch);camera.position.set(cameraTarget.x+Math.sin(cameraYaw)*h,cameraTarget.y+cameraDistance*Math.sin(cameraPitch),cameraTarget.z+Math.cos(cameraYaw)*h);camera.lookAt(cameraTarget);}
function pct(v){return Math.round(Math.max(0,Math.min(100,+v||0)));}
const action=v=>({rest:"Descansar",drink:"Beber agua",eat_plant:"Comer planta",catch_fish:"Pescar",gather_wood:"Recolectar madera",gather_stone:"Recolectar piedra",socialize:"Socializar",share_knowledge:"Compartir conocimiento",cooperate:"Cooperar",build_shelter:"Construir refugio",craft_tool:"Fabricar herramienta",farm:"Preparar cultivo",harvest:"Cosechar",eat_farm_food:"Comer alimento cultivado",trade:"Comerciar",explore_plants:"Investigar plantas",explore_fishing:"Investigar pesca",explore_wood:"Investigar madera",explore_stone:"Investigar piedra",explore_area:"Explorar entorno",eat_fish:"Comer pescado"})[v]??v??"Ninguna";
const activity=v=>({idle:"Sin actividad",resting:"Descansando",drinking:"Bebiendo",eating:"Comiendo",fishing:"Pescando",gathering:"Recolectando",moving:"Desplazándose",cooperating:"Cooperando",dead:"Fallecido"})[v]??v??"Sin actividad";
function renderAgentPanel(a){if(!a)return;document.querySelector("#agentName").textContent=a.name;document.querySelector("#agentAge").textContent=`Edad: ${a.age} años · ${a.alive?"Vivo":"Fallecido"} · Día ${simulation.day}`;document.querySelector("#agentAvatar").style.background=a.id==="alex"?"#345b8c":"#8c4f34";const n=[["Hambre",a.needs?.hunger],["Sed",a.needs?.thirst],["Energía",a.needs?.energy],["Social",a.needs?.social],["Seguridad",a.needs?.safety],["Salud",a.needs?.health]];document.querySelector("#agentStatus").innerHTML=n.map(([k,v])=>`<div class="agentRow"><span>${k}</span><strong>${pct(v)}%</strong></div><div class="agentBar"><span style="width:${pct(v)}%"></span></div>`).join("")+`<div class="agentRow"><span>Actividad</span><strong>${activity(a.currentActivity)}</strong></div><div class="agentRow"><span>Intención</span><strong>${action(a.currentIntent?.name)}</strong></div><div class="agentRow"><span>Última acción</span><strong>${action(a.lastActionName)}</strong></div><div class="agentRow"><span>Objetivo</span><strong>${action(a.plan?.goal)}</strong></div><div class="agentRow"><span>Siguiente paso</span><strong>${action(a.plan?.steps?.[0])}</strong></div><div class="agentRow"><span>Progreso</span><strong>${a.plan ? `${a.plan.progress ?? 0} · replanteos ${a.plan.replans ?? 0}` : "—"}</strong></div>`;const d=a.decisionSnapshot;document.querySelector("#agentDecision").innerHTML=d?.chosen?`<div class="agentRow"><span>Elección</span><strong>${action(d.chosen.name)}</strong></div><div class="agentRow"><span>Puntuación</span><strong>${Number(d.chosen.score).toFixed(2)}</strong></div>`:'<div class="agentEmpty">Todavía no hay una decisión registrada.</div>';const inv=(a.inventory??[]).reduce((o,i)=>(o[i.type]=(o[i.type]||0)+(Number(i.amount)||0),o),{});const tools=(a.inventory??[]).filter(i=>i.type==="tool"&&Number(i.durability)>0);document.querySelector("#agentResources").innerHTML=`<div class="agentRow"><span>Monedas</span><strong>${a.money??0}</strong></div><div class="agentRow"><span>Posición</span><strong>${(+a.position?.x||0).toFixed(1)}, ${(+a.position?.z||0).toFixed(1)}</strong></div><div class="agentRow"><span>Inventario</span><strong>${Object.entries(inv).map(([k,v])=>`${k} × ${v.toFixed(1)}`).join(", ")||"vacío"}</strong></div>${tools.length?`<div class="agentRow"><span>Herramientas</span><strong>${tools.map(t=>`${t.kind??"herramienta"} · ${t.durability}`).join(", ")}</strong></div>`:""}`;document.querySelector("#agentKnowledge").innerHTML=(a.knowledge??[]).length?a.knowledge.slice(-10).reverse().map(k=>`<span class="agentTag">${String(k.topic).replace(/^action:/,"")} · ${pct((k.confidence??0)*100)}%</span>`).join(""):"<div class=\"agentEmpty\">Aún no ha adquirido conocimiento.</div>";document.querySelector("#agentRelationships").innerHTML=(a.relationships??[]).length?a.relationships.map(r=>`<div class="agentRow"><span>${agents.find(x=>x.id===r.agentId)?.name??r.agentId}</span><strong>confianza ${pct((r.trust??0)*100)}%</strong></div>`).join(""):"<div class=\"agentEmpty\">Aún no tiene relaciones registradas.</div>";document.querySelector("#agentExperiences").innerHTML=(a.experiences??[]).length?a.experiences.slice(-8).reverse().map(e=>`<div class="agentExperience"><strong>Día ${e.day??"—"}</strong> · ${e.description??"Experiencia registrada"}</div>`).join(""):"<div class=\"agentEmpty\">Aún no hay experiencias registradas.</div>";const p=document.querySelector("#agentPanel");p.classList.add("open");p.setAttribute("aria-hidden","false");}
function openAgent(id){const a=agents.find(x=>x.id===id);if(a){selectedAgentId=id;centerOnAgent(a);renderAgentPanel(a);}}
document.querySelector("#closeAgentPanel")?.addEventListener("click",()=>{const p=document.querySelector("#agentPanel");p.classList.remove("open");p.setAttribute("aria-hidden","true");});
document.querySelector("#agentDebug")?.addEventListener("click",centerOnAgents);
document.querySelectorAll("[data-agent]")?.forEach(button=>button.addEventListener("click",e=>{e.stopPropagation();openAgent(button.dataset.agent);}));
// Cámara estable: un dedo desplaza, dos dedos hacen zoom/rotación y la rueda hace zoom.
let dragging=false,lastX=0,lastY=0,pinchStart=0,gestureStart=null,gestureMoved=false,lastAngle=0;
const pointers=new Map();
const clampCamera=()=>{cameraTarget.x=Math.max(world.bounds.minX,Math.min(world.bounds.maxX,cameraTarget.x));cameraTarget.z=Math.max(world.bounds.minZ,Math.min(world.bounds.maxZ,cameraTarget.z));};
const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
const angle=(a,b)=>Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function pickAgent(clientX,clientY){
  const r=renderer.domElement.getBoundingClientRect();
  pointer.x=((clientX-r.left)/r.width)*2-1;
  pointer.y=-((clientY-r.top)/r.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects([...meshes.values()],true)[0];
  let o=hit?.object,id=null;
  while(o&&!id){id=o.userData?.agentId;o=o.parent;}
  if(id) openAgent(id);
  return !!id;
}
renderer.domElement.addEventListener("pointerdown",e=>{
  if(e.pointerType==="mouse"&&e.button!==0)return;
  pointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY,startX:e.clientX,startY:e.clientY});
  renderer.domElement.setPointerCapture(e.pointerId);
  if(pointers.size===1){
    dragging=true; lastX=e.clientX; lastY=e.clientY;
    gestureStart={x:e.clientX,y:e.clientY,id:e.pointerId}; gestureMoved=false;
  }else if(pointers.size===2){
    dragging=false; gestureMoved=true;
    const pts=[...pointers.values()];
    pinchStart=distance(pts[0],pts[1]);
    lastAngle=angle(pts[0],pts[1]);
  }
});
renderer.domElement.addEventListener("pointermove",e=>{
  const p=pointers.get(e.pointerId); if(!p)return;
  p.clientX=e.clientX; p.clientY=e.clientY;
  if(pointers.size===2){
    const pts=[...pointers.values()];
    const d=distance(pts[0],pts[1]);
    if(pinchStart>0)cameraDistance=Math.max(10,Math.min(75,cameraDistance+(pinchStart-d)*.07));
    pinchStart=d;
    const a=angle(pts[0],pts[1]);
    let da=a-lastAngle;
    if(da>Math.PI)da-=Math.PI*2;
    if(da<-Math.PI)da+=Math.PI*2;
    cameraYaw-=da*1.35;
    lastAngle=a;
    return;
  }
  if(pointers.size!==1||!dragging)return;
  const dx=e.clientX-p.startX,dy=e.clientY-p.startY;
  if(Math.hypot(dx,dy)>8)gestureMoved=true;
  const mdx=e.clientX-lastX,mdy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
  const s=.14;
  const right=new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw));
  const forward=new THREE.Vector3(Math.sin(cameraYaw),0,Math.cos(cameraYaw));
  cameraTarget.addScaledVector(right,-mdx*s);
  cameraTarget.addScaledVector(forward,-mdy*s);
  clampCamera();
});
function endPointer(e){
  const wasTap=pointers.size===1 && !gestureMoved && gestureStart?.id===e.pointerId;
  const x=e.clientX,y=e.clientY;
  pointers.delete(e.pointerId);
  if(pointers.size<2){pinchStart=0;lastAngle=0;}
  if(pointers.size===1){
    const p=[...pointers.values()][0];
    dragging=true; lastX=p.clientX; lastY=p.clientY;
  }else{dragging=false;}
  if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);
  if(wasTap)pickAgent(x,y);
  if(pointers.size===0){gestureStart=null;gestureMoved=false;}
}
renderer.domElement.addEventListener("pointerup",endPointer);
renderer.domElement.addEventListener("pointercancel",endPointer);
renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();cameraDistance=Math.max(10,Math.min(75,cameraDistance+e.deltaY*.035));},{passive:false});
addEventListener("keydown",e=>{
  const s=1.2;
  if(e.key==="w"||e.key==="ArrowUp")cameraTarget.z-=s;
  if(e.key==="s"||e.key==="ArrowDown")cameraTarget.z+=s;
  if(e.key==="a"||e.key==="ArrowLeft")cameraTarget.x-=s;
  if(e.key==="d"||e.key==="ArrowRight")cameraTarget.x+=s;
  if(e.key==="+"||e.key==="=")cameraDistance=Math.max(10,cameraDistance-2);
  if(e.key==="-")cameraDistance=Math.min(75,cameraDistance+2);
  clampCamera();
});
function update(){const now=performance.now(),dt=Math.min((now-last)/1000,.25);last=now;if(fault)return;try{for(const a of agents){if(a.currentIntent?.target)setMovementTarget(a,a.currentIntent.target,world.bounds);}tick(simulation,dt/37.5);for(const a of agents){if(a.currentIntent?.target)setMovementTarget(a,a.currentIntent.target,world.bounds);moveAgent(a,dt);}syncMeshes();const panel=document.querySelector("#agentPanel");if(selectedAgentId&&panel?.classList.contains("open"))renderAgentPanel(agents.find(a=>a.id===selectedAgentId));if(worldTime){const h=Math.floor(simulation.hour),m=Math.floor((simulation.hour-h)*60),alive=agents.filter(a=>a.alive!==false).length;worldTime.textContent=`Aldea IA · Día ${simulation.day} · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} · Habitantes ${alive} · Velocidad 1x`;const count=document.querySelector("#agentDebug strong");if(count)count.textContent=`Habitantes: ${alive}`;}if(now-lastSave>=2000){save();lastSave=now;}}catch(e){fault=e;console.error("Lúmina",e);}}
loadLocal();normalize();syncMeshes();centerOnAgents();loadRemoteIfNeeded();updateCamera();addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});addEventListener("beforeunload",save);function animate(){requestAnimationFrame(animate);update();updateCamera();renderer.render(scene,camera);}animate();