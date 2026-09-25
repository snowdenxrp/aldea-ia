import * as THREE from "./three.module.js";
import { world } from "./world.js";
import { createInitialAgents } from "./agents.js";
import { createSimulation, tick } from "./simulation.js";
import { setMovementTarget, moveAgent } from "./movement.js";
import { getRegionForPosition, getBiomeForRegion, normalizeSpatialWorld } from "./spatial.js";
import { buildVillage } from "./village.js";
import { getVillageDetailLevel, applyVillageDetailLevel } from "./village-lod.js";

const app=document.querySelector("#app"), worldTime=document.querySelector("#worldTime");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9ec9df); scene.fog=new THREE.Fog(0x9ec9df,55,150);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.domElement.style.touchAction="none"; renderer.domElement.style.userSelect="none"; app.appendChild(renderer.domElement);

// Auditoría visual: captura el canvas 3D y la envía automáticamente al buzón visual de GitHub.
// El endpoint corre fuera del navegador para mantener el token de GitHub completamente fuera del cliente.
const captureBar=document.createElement("div");
captureBar.style.cssText="position:fixed;right:12px;bottom:12px;z-index:50;display:flex;gap:6px;font:600 12px system-ui";
const captureBtn=document.createElement("button");
captureBtn.textContent="📸 Capturar + guardar";
captureBtn.style.cssText="padding:9px 12px;border:0;border-radius:10px;background:#1f2937;color:#fff;box-shadow:0 3px 12px #0005";
const CAPTURE_ENDPOINT=window.__LUMINA_CAPTURE_ENDPOINT||"/api/capture";
function captureAuditMetadata(){
  return {
    capturedAt:new Date().toISOString(),
    day:Number(simulation.day??0),
    hour:Number(simulation.hour??0),
    camera:{x:Number(camera.position.x.toFixed(3)),y:Number(camera.position.y.toFixed(3)),z:Number(camera.position.z.toFixed(3)),targetX:Number(cameraTarget.x.toFixed(3)),targetZ:Number(cameraTarget.z.toFixed(3)),distance:Number(cameraDistance.toFixed(3)),yaw:Number(cameraYaw.toFixed(3)),pitch:Number(cameraPitch.toFixed(3))},
    inhabitants:(agents??[]).filter(a=>a?.alive!==false).map(a=>({id:a.id,name:a.name,x:Number(a.position?.x?.toFixed?.(3)??0),z:Number(a.position?.z?.toFixed?.(3)??0),activity:a.currentActivity??"idle",intent:a.currentIntent?.name??null,phase:a.activityPhase??null})),
    viewport:{width:innerWidth,height:innerHeight,pixelRatio:renderer.getPixelRatio()},
    userAgent:navigator.userAgent,
    captureVersion:"github-visual-audit-v1"
  };
}
captureBtn.onclick=async()=>{
  const original=captureBtn.textContent;
  captureBtn.disabled=true;
  captureBtn.textContent="⏳ Guardando…";
  try{
    renderer.render(scene,camera);
    const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,"image/png"));
    if(!blob)throw new Error("No se pudo generar PNG");
    const form=new FormData();
    form.append("image",blob,"lumina-screenshot.png");
    form.append("metadata",JSON.stringify(captureAuditMetadata()));
    const response=await fetch(CAPTURE_ENDPOINT,{method:"POST",body:form,headers:{"Accept":"application/json"}});
    if(!response.ok)throw new Error("Servidor de captura respondió HTTP "+response.status);
    const result=await response.json();
    captureBtn.textContent="✅ Guardada en GitHub";
    setTimeout(()=>{captureBtn.textContent=original;captureBtn.disabled=false;},1800);
    console.info("Lúmina visual audit saved",result);
  }catch(error){
    console.warn("Captura automática no disponible; se conserva el fallback local.",error);
    captureBtn.textContent="📤 Guardar manualmente";
    try{
      const dataUrl=renderer.domElement.toDataURL("image/png");
      const a=document.createElement("a");a.download="lumina-screenshot.png";a.href=dataUrl;a.click();
    }catch{}
    setTimeout(()=>{captureBtn.textContent=original;captureBtn.disabled=false;},1800);
  }
};
captureBar.appendChild(captureBtn);
app.appendChild(captureBar);
const light=new THREE.DirectionalLight(0xffffff,2.2); light.position.set(12,25,10); light.castShadow=true; light.shadow.mapSize.set(2048,2048); scene.add(light,new THREE.HemisphereLight(0xbfe7ff,0x6f8f58,1.2));
normalizeSpatialWorld(world);
const homeRegion=getRegionForPosition({x:0,z:0},world);
const homeBiome=getBiomeForRegion(homeRegion,world);
const biomeGroundColors={forest:0x587f4a,plains:0x6f9b58,mountain:0x77715f,wetland:0x5f8a70,arid:0x9a8557};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(150,150,24,24),new THREE.MeshStandardMaterial({color:biomeGroundColors[homeBiome.type]??biomeGroundColors.plains,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const environmentMeshes=[];
const fireMeshes=[];
const waterMeshes=[];
function addTree(x,z,scale=1){
  const g=new THREE.Group(); g.userData.environmentType="tree";
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.24,.34,2.7,8),material(0x68452f)); trunk.position.y=1.35;
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.65,14,10),material(0x3f7138)); crown.position.y=3.2; crown.scale.set(1.08,.98,1.08);
  g.add(trunk,crown); g.scale.setScalar(scale); g.position.set(x,0,z); g.traverse(o=>{if(o.isMesh)o.castShadow=true;}); scene.add(g); environmentMeshes.push(g);
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
  for(let i=0;i<v.trees;i++){const a=i*2.399;const r=10+(i%9)*4;addTree(Math.cos(a)*r+(i%3-1)*14,Math.sin(a)*r+(i%4-1.5)*12,v.treeScale*(.8+(i%4)*.08));}
  for(let i=0;i<v.rocks;i++){const a=i*2.618;const r=10+(i%6)*4;addRock(Math.cos(a)*r+(i%2?20:-20),Math.sin(a)*r+(i%3-1)*18,.6+(i%3)*.12);}
  for(let i=0;i<v.plants;i++){const a=i*2.399;const r=8+(i%7)*3;addPlant(Math.cos(a)*r+(i%3-1)*16,Math.sin(a)*r+(i%4-1.5)*14,v.plantScale*(.8+(i%3)*.1));}
}
buildBiomeEnvironment(homeBiome.type);

function createFirePit(x,z){
  const g=new THREE.Group(); g.userData.environmentType="fire";
  const stoneMat=material(0x77716a,.95);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.18,1),stoneMat);stone.position.set(Math.cos(a)*.52,.14,Math.sin(a)*.52);stone.scale.set(1,.7,1);g.add(stone);}
  const flameMat=new THREE.MeshBasicMaterial({color:0xffb23e,transparent:true,opacity:.9});
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.23,.7,7),flameMat);flame.position.y=.48;g.add(flame);
  const emberMat=new THREE.MeshBasicMaterial({color:0xff6a2a,transparent:true,opacity:.85});
  const ember=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),emberMat);ember.position.y=.22;g.add(ember);
  const smokeMat=new THREE.MeshBasicMaterial({color:0xd7d2c8,transparent:true,opacity:.16,depthWrite:false});
  for(let i=0;i<3;i++){const smoke=new THREE.Mesh(new THREE.SphereGeometry(.16+i*.035,8,6),smokeMat);smoke.position.set((i-1)*.07,.95+i*.34,0);g.add(smoke);}
  g.position.set(x,0,z); scene.add(g); fireMeshes.push(g);
}
createFirePit(-5,-3.9);
createFirePit(8,5.2);

function animateLighting(hour){
  const h=((Number(hour)||0)%24+24)%24;
  const daylight=Math.max(0,Math.sin((h-6)/24*Math.PI*2));
  const warm=Math.max(0,1-Math.abs(h-12)/7);
  const night=new THREE.Color(0x18243c), dawn=new THREE.Color(0x9ec9df), sky=new THREE.Color(0x9ec9df), fog=new THREE.Color(0x9ec9df);
  sky.lerpColors(night,dawn,Math.min(1,daylight*.95+.16));
  scene.background.copy(sky);
  fog.copy(sky); scene.fog.color.copy(fog);
  light.intensity=0.55+daylight*1.65+warm*.15;
  light.position.set(Math.cos((h-12)/24*Math.PI*2)*24,8+daylight*24,Math.sin((h-12)/24*Math.PI*2)*18);
}
function animateEnvironment(t){
  for(let i=0;i<waterMeshes.length;i++){
    const ripple=waterMeshes[i],wave=t*.65+i*.9;
    ripple.position.z=-55+((wave*5.5+i*8)%110);
    ripple.position.x=-18+Math.sin(wave*.7+i)*3.4;
    ripple.scale.setScalar(.72+((Math.sin(wave)+1)*.5)*.42);
    ripple.material.opacity=.1+((Math.sin(wave*.8)+1)*.5)*.14;
  }
  for(let i=0;i<environmentMeshes.length;i++){
    const g=environmentMeshes[i],type=g.userData.environmentType;
    if(type==="tree"){
      const sway=Math.sin(t*.9+i*.73)*.018;
      g.rotation.z=sway;
      const crown=g.children[1];
      if(crown)crown.scale.y=.9+Math.sin(t*1.4+i)*.018;
    } else if(type==="plant"){
      g.rotation.z=Math.sin(t*1.8+i)*.035;
    }
  }
  for(let i=0;i<fireMeshes.length;i++){
    const g=fireMeshes[i],w=Math.sin(t*7+i*1.7);
    const flame=g.children[7],ember=g.children[8];
    if(flame){flame.scale.set(1+w*.12,1+Math.abs(w)*.2,1-w*.08);flame.rotation.y=t*1.5;}
    if(ember)ember.scale.setScalar(.9+Math.abs(w)*.25);
    for(let j=9;j<g.children.length;j++){
      const smoke=g.children[j]; smoke.position.x=Math.sin(t*.55+j)*.05; smoke.position.y=.95+((t*.22+j*.31)%1.15); smoke.material.opacity=.08+Math.abs(Math.sin(t*.7+j))*.08;
    }
  }
}

const river=new THREE.Mesh(new THREE.PlaneGeometry(10,150),new THREE.MeshStandardMaterial({color:0x4f9ed1,roughness:.22,metalness:.05})); river.rotation.x=-Math.PI/2; river.position.set(-18,.03,0); scene.add(river);
function createWaterRipples(){
  for(let i=0;i<14;i++){
    const ripple=new THREE.Mesh(new THREE.RingGeometry(.18,.28,20),new THREE.MeshBasicMaterial({color:0xa9dcf2,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));
    ripple.rotation.x=-Math.PI/2;
    ripple.position.set(-18+(i%4-1.5)*1.7,-.001,-55+i*8);
    ripple.scale.setScalar(.7+(i%3)*.18);
    scene.add(ripple); waterMeshes.push(ripple);
  }
}
createWaterRipples();
const villageRoot=buildVillage(scene);
let villageLodLevel=null;
function updateVillageLOD(){
  const level=getVillageDetailLevel(cameraDistance);
  if(level!==villageLodLevel){applyVillageDetailLevel(villageRoot,level);villageLodLevel=level;}
}
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
  const beam=box(3.45,.12,.12,0x5b3b28); beam.position.set(0,2.05,1.73);
  const cross=box(.06,.58,.09,0x5b3b28); cross.position.set(-1.12,1.45,1.78); const crossR=cross.clone(); crossR.position.x=1.12;
  g.add(wall,roof,door,knob,winL,winR,chimney,step,beam,cross,crossR);
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
const settlementDecorationMeshes=new Map();
function createSettlementDecoration(id,type,position,biomeType="plains"){
  const g=new THREE.Group(); g.userData.decorationId=id; g.userData.decorationType=type; g.userData.biomeType=biomeType;
  const palette={forest:0x5f422d,plains:0x795332,mountain:0x777777,wetland:0x526b4b,arid:0x9a7448};
  const accent=palette[biomeType]??palette.plains;
  if(type==="storage"){
    const body=box(1.15,.7,.8,accent); body.position.y=.35;
    const lid=box(1.25,.12,.86,0x5f422d); lid.position.y=.76; g.add(body,lid);
  } else if(type==="workbench"){
    const top=box(1.35,.12,.65,accent); top.position.y=.78;
    for(const x of [-.52,.52]){const leg=box(.1,.75,.1,0x5f422d);leg.position.set(x,.38,0);g.add(leg);}
    const tool=box(.8,.06,.08,0x8b9298); tool.position.set(0,.88,.08); g.add(top,tool);
  } else {
    for(const x of [-.9,0,.9]){const post=box(.09,.55,.09,accent);post.position.set(x,.275,0);g.add(post);}
    const rail=box(2.0,.09,.09,accent);rail.position.set(0,.38,0);g.add(rail);
  }
  g.position.set(position.x??0,.0,position.z??0); return g;
}
function syncSettlementDecorations(){
  const regions=simulation.world.spatial?.regions??{};
  const structures=simulation.world.structures??{};
  const all=[...(structures.shelters??[]).map(s=>({...s,type:"shelter"})),...(structures.farms??[]).map(s=>({...s,type:"farm"}))];
  const live=new Set();
  for(const s of all){
    const key=getRegionKeyForVisual({x:s.position?.x??0,z:s.position?.z??0});
    const state=regions[key]; const level=Math.max(0,Math.min(5,Number(state?.settlementLevel??0)));
    const base={x:(s.position?.x??0),z:(s.position?.z??0)};
    const wanted=[];
    if(level>=2) wanted.push(["fence",{x:base.x+2.5,z:base.z}]);
    if(level>=3) wanted.push(["storage",{x:base.x-2.4,z:base.z+.3}]);
    if(level>=4) wanted.push(["workbench",{x:base.x,z:base.z-2.4}]);
    for(const [type,pos] of wanted){
      const id=s.id+":"+type; live.add(id);
      let m=settlementDecorationMeshes.get(id);
      if(!m){m=createSettlementDecoration(id,type,pos,state?.biome??"plains");settlementDecorationMeshes.set(id,m);scene.add(m);}
      m.position.set(pos.x,0,pos.z); m.visible=true; m.userData.settlementLevel=level; m.userData.biomeType=state?.biome??"plains";
    }
  }
  for(const [id,m] of settlementDecorationMeshes) if(!live.has(id)) m.visible=false;
}
function syncSettlementVisualState(){
  const regions=simulation.world.spatial?.regions??{};
  const populationByRegion=new Map();
  for(const agent of simulation.agents??[]){
    if(!agent?.alive)continue;
    const key=agent.position?getRegionKeyForVisual(agent.position):null;
    if(key)populationByRegion.set(key,(populationByRegion.get(key)||0)+1);
  }
  syncSettlementDecorations();
  for(const [id,m] of structureMeshes){
    const x=m.position.x,z=m.position.z;
    const key=getRegionKeyForVisual({x,z});
    const state=regions[key];
    const level=Number(state?.settlementLevel??0);
    const population=populationByRegion.get(key)??Number(state?.population??0);
    const activity=Math.max(0,Math.min(1,Number(state?.activity??0)));
    m.scale.setScalar(1+Math.min(.12,level*.02)+Math.min(.03,population*.004));
    m.userData.settlementLevel=level;
    m.userData.settlementPopulation=population;
    m.userData.settlementActivity=activity;
    m.userData.activityPulse=0.96+activity*.04;
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
let cameraTarget=new THREE.Vector3(1,0,1),cameraDistance=56,cameraYaw=.55,cameraPitch=.58,last=performance.now(),lastSave=last,fault=null;
const meshes=new Map();
function validState(s){return s&&s.world?.resources&&Array.isArray(s.agents)&&s.agents.some(a=>a?.id==="alex")&&s.agents.some(a=>a?.id==="bruno");}
function normalize(){for(const fallback of createInitialAgents()){let a=agents.find(x=>x.id===fallback.id);if(!a){a=structuredClone(fallback);agents.push(a);}if (typeof a.alive !== "boolean") a.alive = fallback.alive;a.position??={...fallback.position};a.position.x=Number.isFinite(+a.position.x)?+a.position.x:fallback.position.x;a.position.z=Number.isFinite(+a.position.z)?+a.position.z:fallback.position.z;a.position.x=Math.max(world.bounds.minX,Math.min(world.bounds.maxX,a.position.x));a.position.z=Math.max(world.bounds.minZ,Math.min(world.bounds.maxZ,a.position.z));a.currentActivity??="idle";a.currentIntent??=null;a.worldBounds={minX:world.bounds.minX,maxX:world.bounds.maxX,minZ:world.bounds.minZ,maxZ:world.bounds.maxZ};a.decisionCooldownHours=Number.isFinite(+a.decisionCooldownHours)?Math.max(0,+a.decisionCooldownHours):0;a.lastActionName??=null;a.needs??={hunger:100,thirst:100,energy:100,social:100,safety:100,health:100};a.inventory??=[];a.knowledge??=[];a.relationships??=[];a.experiences??=[];}}
function applyState(s){Object.assign(world,structuredClone(s.world));simulation.day=Number(s.day)||world.day||1;simulation.hour=Number.isFinite(+s.hour)?+s.hour:(world.timeOfDay||8);simulation.events=Array.isArray(s.events)?s.events.slice(-500):[];agents.splice(0,agents.length,...structuredClone(s.agents));normalize();world.day=simulation.day;world.timeOfDay=simulation.hour;}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:8,savedAt:Date.now(),day:simulation.day,hour:simulation.hour,world,agents,events:simulation.events.slice(-500)}));}catch{}}
function loadLocal(){try{const current=JSON.parse(localStorage.getItem(SAVE_KEY)||"null"),legacy=["lumina-world-v8","lumina-world-v7","lumina-world-v6","lumina-world-v5","lumina-world-v4","lumina-world-v3"].map(k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}}).filter(validState);let chosen=validState(current)?current:null;if(legacy.length){const best=legacy.sort((a,b)=>(+b.savedAt||0)-(+a.savedAt||0))[0];if(!chosen||(+best.day>+chosen.day||(+best.day===+chosen.day&&+best.hour>+chosen.hour)))chosen=best;}if(chosen)applyState(chosen);}catch{}}
async function loadRemoteIfNeeded(){
  try{
    const local=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
    const remoteUrl=new URL("../world-state.json",import.meta.url);
    remoteUrl.searchParams.set("ts",Date.now().toString());
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    const r=await fetch(remoteUrl.href,{cache:"no-store",headers:{"Cache-Control":"no-cache"},signal:controller.signal});
    clearTimeout(timeout);
    if(!r.ok)throw new Error("world-state HTTP "+r.status);
    const remote=await r.json();
    if(!validState(remote))throw new Error("world-state inválido");
    if(Number(remote?.version)<4){
      const plants=remote.world?.resources?.wild_plants, fish=remote.world?.resources?.fish;
      if(plants && Number(plants.amount)<=0) plants.amount=80;
      if(fish && Number(fish.amount)<=0) fish.amount=60;
    }
    const localStamp=(Number(local?.day)||0)*24+(Number(local?.hour)||0);
    const remoteStamp=(Number(remote?.day)||0)*24+(Number(remote?.hour)||0);
    if(!validState(local)||remoteStamp>=localStamp){
      applyState(remote); save(); syncMeshes(); syncStructures(); syncSettlementVisualState(); centerOnAgents();
    }
  }catch(e){
    console.warn("Lúmina: no se pudo cargar world-state remoto",e);
  }
}
function createMesh(a){
  const g=new THREE.Group(); g.userData.agentId=a.id; g.scale.setScalar(1.42);
  const blue=a.id==="alex", skin=0xf0bd91, clothes=blue?0x2f7de1:0xe87832, dark=blue?0x1f4f8c:0xb45624;
  const skinMat=material(skin,.9), clothMat=material(clothes,.82), darkMat=material(dark,.88), hairMat=material(0x3b2a22,1), shoeMat=material(0x3b332f,1);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.42,.34,.72,12),clothMat); torso.scale.set(1.08,1,.92); torso.position.y=1.18;
  const chest=new THREE.Mesh(new THREE.BoxGeometry(.7,.26,.42),clothMat); chest.scale.set(1.04,1.02,1); chest.position.y=1.42;
  const waist=new THREE.Mesh(new THREE.CylinderGeometry(.29,.31,.18,10),darkMat); waist.scale.set(1.05,1,1.02); waist.position.y=.83;
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,6,16),skinMat); collar.scale.set(1.05,1,1.02); collar.rotation.x=Math.PI/2; collar.position.y=1.52;
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.18,10),skinMat); neck.scale.set(1.02,1.08,1.02); neck.position.y=1.66;
  const pelvis=new THREE.Mesh(new THREE.BoxGeometry(.52,.28,.34),darkMat); pelvis.scale.set(1.08,1,1.05); pelvis.position.y=.78;
  const shoulderL=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),clothMat), shoulderR=shoulderL.clone(); shoulderL.scale.set(1.08,1,1.02); shoulderR.scale.copy(shoulderL.scale); shoulderL.position.set(-.38,1.43,0); shoulderR.position.set(.38,1.43,0);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.32,24,18),skinMat); head.scale.set(1.02,1,.98); head.position.y=1.91;
  const earL=new THREE.Mesh(new THREE.SphereGeometry(.075,10,8),skinMat), earR=earL.clone(); earL.scale.set(.85,1,.72); earR.scale.copy(earL.scale); earL.scale.set(.72,1,1.08); earR.scale.copy(earL.scale); earL.position.set(-.305,1.91,0); earR.position.set(.305,1.91,0);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.335,24,14,0,Math.PI*2,0,Math.PI*.58),hairMat); hair.scale.set(1.04,1.05,1.02); hair.position.y=2.04;
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),skinMat); nose.scale.set(.8,.8,1.2); nose.position.set(0,1.91,.335);
  const eyeWhiteMat=new THREE.MeshBasicMaterial({color:0xf5f2e8,depthTest:false});
  const eyeMat=new THREE.MeshBasicMaterial({color:0x18222b,depthTest:false});
  const eyeWL=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),eyeWhiteMat), eyeWR=eyeWL.clone(); eyeWL.position.set(-.115,1.98,.315); eyeWR.position.set(.115,1.98,.315);
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),eyeMat), eyeR=eyeL.clone(); eyeL.position.set(-.115,1.98,.365); eyeR.position.set(.115,1.98,.365);
  const mouth=box(.12,.018,.018,0x713f3a); mouth.scale.set(1.05,1,1); mouth.position.set(0,1.81,.315);
  const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.44,7,10),clothMat), armR=armL.clone(); armL.scale.set(1.02,1.02,1); armR.scale.copy(armL.scale); armL.position.set(-.39,1.2,0); armR.position.set(.39,1.2,0); armL.rotation.z=-.08; armR.rotation.z=.08;
  const handL=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),skinMat), handR=handL.clone(); handL.scale.set(.92,1.05,.92); handR.scale.copy(handL.scale); handL.position.set(-.39,.89,0); handR.position.set(.39,.89,0);
  const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.56,7,10),darkMat), legR=legL.clone(); legL.scale.set(1.02,1,1.04); legR.scale.copy(legL.scale); legL.position.set(-.16,.47,0); legR.position.set(.16,.47,0);
  const kneeMat=material(blue?0x255fae:0xc75f2d,.86);
  const kneeL=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),kneeMat), kneeR=kneeL.clone(); kneeL.scale.set(1,.72,.8); kneeR.scale.set(1,.72,.8); kneeL.position.set(-.16,.49,.105); kneeR.position.set(.16,.49,.105);
  const cuffL=new THREE.Mesh(new THREE.TorusGeometry(.105,.02,6,12),darkMat), cuffR=cuffL.clone(); cuffL.rotation.x=Math.PI/2; cuffR.rotation.x=Math.PI/2; cuffL.position.set(-.39,.91,.02); cuffR.position.set(.39,.91,.02);
  const footL=new THREE.Mesh(new THREE.SphereGeometry(.14,12,8),shoeMat), footR=footL.clone(); footL.scale.set(1.02,.58,1.5); footR.scale.copy(footL.scale); footL.position.set(-.16,.13,.08); footR.position.set(.16,.13,.08);
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:blue?0x59b7ff:0xffb15c,depthTest:false})); marker.position.y=2.47;
  const role=a.specialization?.role??a.socialRole;
  const accessoryGroup=new THREE.Group();
  if(role==="farmer"){const hat=new THREE.Mesh(new THREE.ConeGeometry(.34,.22,12),material(0x6b4b2d));hat.position.y=2.28;accessoryGroup.add(hat);}
  if(role==="builder"||role==="craftsperson"){const belt=new THREE.Mesh(new THREE.TorusGeometry(.29,.035,6,16),darkMat);belt.rotation.x=Math.PI/2;belt.position.y=.92;accessoryGroup.add(belt);}
  if(role==="trader"){const bag=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),material(0x6a4d38));bag.scale.set(1,.8,.7);bag.position.set(.43,1.02,.08);accessoryGroup.add(bag);}
  if(role==="gatherer"){const basket=new THREE.Mesh(new THREE.TorusGeometry(.18,.055,6,12),material(0x9a6b35));basket.rotation.x=Math.PI/2;basket.position.set(-.43,.98,.08);accessoryGroup.add(basket);}
  if(role==="teacher"){const book=box(.22,.28,.06,0x6f5138);book.position.set(.34,1.0,.28);accessoryGroup.add(book);}
  if(role==="organizer"){const sash=box(.08,.72,.04,0xd8c08a);sash.position.set(.22,1.18,.32);sash.rotation.z=-.22;accessoryGroup.add(sash);}
  accessoryGroup.position.z=.02;
  g.add(accessoryGroup); g.userData.accessoryRole=role??null;
  const activityToolGroup=new THREE.Group();
  const woodMat=material(0x6b4b32),metalMat=material(0x8b9298),greenMat=material(0x5f913d),stoneMat=material(0x777777);
  const axeHandle=box(.045,.62,.045,woodMat),axeHead=box(.24,.12,.07,metalMat); axeHandle.position.y=.31; axeHead.position.set(.02,.62,0); axeHead.rotation.z=-.18;
  const hammerHandle=box(.045,.55,.045,woodMat),hammerHead=box(.3,.1,.1,metalMat); hammerHandle.position.y=.275; hammerHead.position.set(0,.55,0);
  const hoeHandle=box(.04,.62,.04,woodMat),hoeHead=box(.26,.06,.05,metalMat); hoeHandle.position.y=.31; hoeHead.position.set(0,.62,0); hoeHead.rotation.z=-.3;
  const rodHandle=box(.025,.72,.025,woodMat),rodTip=box(.025,.28,.025,woodMat); rodHandle.position.y=.36; rodHandle.rotation.z=-.42; rodTip.position.set(.14,.72,0); rodTip.rotation.z=.42;
  const crop=new THREE.Group(); const cropStem=box(.035,.32,.035,greenMat),cropLeaf=box(.16,.035,.035,greenMat); cropStem.position.y=.16; cropLeaf.position.set(.08,.27,0); crop.add(cropStem,cropLeaf);
  const stoneTool=box(.18,.18,.18,stoneMat); stoneTool.position.set(0,.18,0); const basketLoad=new THREE.Group(); basketLoad.add(stoneTool);
  const parts={axe:new THREE.Group(),hammer:new THREE.Group(),hoe:new THREE.Group(),rod:new THREE.Group(),crop,basketLoad};
  parts.axe.add(axeHandle,axeHead); parts.hammer.add(hammerHandle,hammerHead); parts.hoe.add(hoeHandle,hoeHead); parts.rod.add(rodHandle,rodTip);
  Object.values(parts).forEach(p=>{p.visible=false;activityToolGroup.add(p);});
  activityToolGroup.position.set(.48,1.02,.18); g.add(activityToolGroup);
  g.userData.activityTools={group:activityToolGroup,parts};
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.34,20),material(0x2b241f,.95)); shadow.scale.set(1,.55,1); shadow.rotation.x=-Math.PI/2; shadow.position.y=.012; g.add(shadow); g.userData.shadow=shadow;
  g.add(torso,collar,neck,pelvis,shoulderL,shoulderR); g.add(chest,waist,head,earL,earR,hair,nose,eyeWL,eyeWR,eyeL,eyeR,mouth,armL,armR,handL,handR,cuffL,cuffR,legL,legR,kneeL,kneeR,footL,footR,marker); g.userData.parts={armL,armR,legL,legR,head};addVisualDetail(g,a);
  g.traverse(o=>{if(o.isMesh)o.renderOrder=1000;}); return (scene.add(g),g);
}
function animateHumanoid(m,a,t){
  const parts=m.userData.parts; if(!parts)return;
  const activity=a.currentActivity??"idle";
  const phase=a.activityPhase??null;
  const cycle=t*7+(a.id==="alex"?0:1.7),walk=Math.sin(cycle),slow=Math.sin(t*2.2),fast=Math.sin(t*8);
  const moving=Boolean(a.movement?.moving)||activity==="moving"||phase==="approach";
  let armL=0,armR=0,legL=0,legR=0,bounce=0,lean=0,headTurn=0;
  if(phase==="approach"||moving){
    armL=walk*.55;armR=-walk*.55;legL=-walk*.85;legR=walk*.85;
    bounce=Math.abs(Math.sin(cycle*2))*.035;lean=.025*Math.cos(cycle);
  }
  if(phase==="inspect"){armL=-.18+slow*.08;armR=.18-slow*.08;legL=.035;legR=-.035;headTurn=Math.sin(t*1.3)*.18;lean=Math.sin(t*.9)*.025;
  } else if(phase==="collect"){armL=-.55+fast*.9;armR=.2-fast*.4;legL=.08;legR=-.08;bounce=Math.abs(fast)*.018;
  } else if(phase==="cast"){armL=-.65+slow*.28;armR=-1.0+slow*.22;legL=.025;legR=-.025;lean=-.04;
  } else if(phase==="wait"){armL=-.12+slow*.05;armR=.12-slow*.05;legL=.02;legR=-.02;headTurn=Math.sin(t*.7)*.1;
  } else if(phase==="discover"){armL=-.28+slow*.16;armR=.28-slow*.16;legL=.04;legR=-.04;headTurn=Math.sin(t*1.1)*.35;lean=Math.sin(t*.8)*.035;
  } else if(phase==="prepare"){armL=-.25+fast*.35;armR=.2-fast*.3;legL=.06;legR=-.06;bounce=Math.abs(fast)*.01;
  } else if(phase==="construct"||phase==="craft"){armL=-.45+fast*.95;armR=-.25-fast*.65;legL=.05;legR=-.05;bounce=Math.abs(fast)*.01;
  } else if(phase==="plant"){armL=-.35+slow*.7;armR=.05-slow*.55;legL=.1;legR=-.1;lean=-.07;
  } else if(phase==="harvest"){armL=-.5+fast*.8;armR=.1-fast*.55;legL=.09;legR=-.09;lean=-.04;
  } else if(phase==="talk"){armL=-.2+slow*.18;armR=.2-slow*.18;lean=slow*.035;headTurn=Math.sin(t*1.5)*.12;
  } else if(phase==="teach"){armL=-.65+slow*.18;armR=.12-slow*.12;lean=.02;headTurn=Math.sin(t*.9)*.08;
  } else if(phase==="work"){armL=-.38+fast*.72;armR=.18-fast*.52;legL=.05;legR=-.05;
  } else if(phase==="exchange"){armL=-.38+slow*.2;armR=.38-slow*.2;lean=slow*.025;
  } else if(!phase){
    if(activity==="gathering"){armL=-.55+fast*.9;armR=.2-fast*.4;legL=.08;legR=-.08;bounce=Math.abs(fast)*.018;}
    else if(activity==="building"||activity==="crafting"){armL=-.45+fast*.95;armR=-.25-fast*.65;legL=.05;legR=-.05;bounce=Math.abs(fast)*.01;}
    else if(activity==="farming"||activity==="planting"||activity==="harvesting"){armL=-.35+fast*.7;armR=.05-fast*.55;legL=.1;legR=-.1;bounce=Math.abs(fast)*.014;}
    else if(activity==="fishing"){armL=-.2+slow*.25;armR=-.35+slow*.2;legL=.035;legR=-.035;}
    else if(activity==="eating"){const w=(Math.sin(t*5)+1)*.5;armL=-.8*w;armR=-.55*w;legL=.03;legR=-.03;}
    else if(activity==="drinking"){const w=(Math.sin(t*3)+1)*.5;armL=-1.0*w;armR=-.15;legL=.02;legR=-.02;}
    else if(activity==="cooperating"||activity==="socializing"){armL=-.2+slow*.18;armR=.2-slow*.18;lean=slow*.035;}
    else if(activity==="resting"){armL=Math.sin(t*1.5)*.045;armR=-armL;lean=Math.sin(t*.8)*.015;}
    else {armL=Math.sin(t*2)*.045;armR=-armL;}
  }
  parts.armL.rotation.x=armL;parts.armR.rotation.x=armR;parts.legL.rotation.x=legL;parts.legR.rotation.x=legR;m.rotation.z=lean;m.position.y=bounce;
  if(moving&&a.movement?.target){const dx=a.movement.target.x-a.position.x,dz=a.movement.target.z-a.position.z;if(Math.hypot(dx,dz)>.05)m.rotation.y=Math.atan2(dx,dz);}
  const head=m.userData.parts.head;if(head)head.rotation.z=headTurn+Math.sin(t*1.7)*.018;
  const tool=m.userData.activityTools;
  if(tool){const p=tool.parts;p.axe.visible=p.hammer.visible=p.hoe.visible=p.rod.visible=p.crop.visible=p.basketLoad.visible=false;if(phase==="collect"||(!phase&&activity==="gathering")){p.axe.visible=a.lastActionName!=="gather_stone";p.basketLoad.visible=a.lastActionName==="gather_stone";tool.group.position.set(.42,1.02,.18);p.axe.rotation.z=-.18+Math.sin(t*8)*.12;if(p.basketLoad.visible)tool.group.position.set(-.42,.72,.18);} else if(phase==="construct"||phase==="craft"||phase==="work"||(!phase&&(activity==="building"||activity==="crafting"||activity==="cooperating"))){p.hammer.visible=true;tool.group.position.set(.44,1.02,.18);p.hammer.rotation.z=Math.sin(t*8)*.35;} else if(phase==="plant"||phase==="harvest"||(!phase&&(activity==="farming"||activity==="harvesting"||activity==="planting"))){p.hoe.visible=phase!=="plant";p.crop.visible=phase==="plant";tool.group.position.set(.4,phase==="plant"?.72:1.02,.3);p.hoe.rotation.z=-.45+Math.sin(t*5)*.18;} else if(phase==="cast"||phase==="wait"||(!phase&&activity==="fishing")){p.rod.visible=true;tool.group.position.set(-.38,1.02,.28);p.rod.rotation.z=-.18+Math.sin(t*2.6)*.08;}}
  m.userData.animationActivity=activity;m.userData.animationPhase=phase;m.userData.isLocomoting=moving;const marker=m.children.find(o=>o.geometry?.type==="SphereGeometry"&&o.position?.y>2.4);if(marker){const pulse=phase?1+Math.sin(t*6)*.12:1;marker.scale.setScalar(pulse);}
}
function addVisualDetail(g,a){
  const detail=material(a.id==="alex"?0x345b8c:0x8c4f34,.68),trim=material(0xc6a36a,.72);
  const belt=box(.62,.09,.18,trim);belt.position.set(0,.72,.34);g.add(belt);
  const tunicL=box(.13,.38,.045,detail),tunicR=tunicL.clone();tunicL.position.set(-.23,1.12,.38);tunicR.position.set(.23,1.12,.38);g.add(tunicL,tunicR);
  const chest=box(.34,.16,.05,detail);chest.position.set(0,1.18,.43);g.add(chest);
  const collarTrim=new THREE.Mesh(new THREE.TorusGeometry(.18,.018,6,18),trim);collarTrim.rotation.x=Math.PI/2;collarTrim.position.set(0,1.53,.01);g.add(collarTrim);
  const badge=new THREE.Mesh(new THREE.CircleGeometry(.055,16),trim);badge.position.set(.13,1.19,.46);badge.rotation.x=-Math.PI/2;g.add(badge);
  const eyeBrowMat=material(0x2a211c,1);
  const browL=box(.10,.018,.018,eyeBrowMat),browR=browL.clone();browL.position.set(-.115,2.055,.35);browR.position.set(.115,2.055,.35);browL.rotation.z=-.08;browR.rotation.z=.08;g.add(browL,browR);
  const bootL=new THREE.Mesh(new THREE.TorusGeometry(.11,.022,6,12),trim),bootR=bootL.clone();bootL.rotation.x=Math.PI/2;bootR.rotation.x=Math.PI/2;bootL.position.set(-.16,.23,.12);bootR.position.set(.16,.23,.12);g.add(bootL,bootR);
}
function syncMeshes(){normalize();syncStructures();const t=performance.now()/1000;for(const a of agents){let m=meshes.get(a.id);if(!m){m=createMesh(a);meshes.set(a.id,m);}m.visible=true;m.position.set(a.position.x,m.position.y??0,a.position.z);animateHumanoid(m,a,t);}}
function centerOnAgents(){const c=agents.filter(a=>a.id==="alex"||a.id==="bruno");if(c.length)cameraTarget.set(c.reduce((s,a)=>s+a.position.x,0)/c.length,0,c.reduce((s,a)=>s+a.position.z,0)/c.length);}
function centerOnAgent(a){if(a)cameraTarget.set(+a.position.x||0,0,+a.position.z||0);}
function updateCamera(){const h=cameraDistance*Math.cos(cameraPitch);camera.position.set(cameraTarget.x+Math.sin(cameraYaw)*h,cameraTarget.y+cameraDistance*Math.sin(cameraPitch),cameraTarget.z+Math.cos(cameraYaw)*h);camera.lookAt(cameraTarget);}
function pct(v){return Math.round(Math.max(0,Math.min(100,+v||0)));}
const action=v=>({rest:"Descansar",drink:"Beber agua",eat_plant:"Comer planta",catch_fish:"Pescar",gather_wood:"Recolectar madera",gather_stone:"Recolectar piedra",socialize:"Socializar",share_knowledge:"Compartir conocimiento",cooperate:"Cooperar",build_shelter:"Construir refugio",craft_tool:"Fabricar herramienta",farm:"Preparar cultivo",harvest:"Cosechar",eat_farm_food:"Comer alimento cultivado",trade:"Comerciar",explore_plants:"Investigar plantas",explore_fishing:"Investigar pesca",explore_wood:"Investigar madera",explore_stone:"Investigar piedra",explore_area:"Explorar entorno",eat_fish:"Comer pescado"})[v]??v??"Ninguna";
const activity=v=>({idle:"Sin actividad",resting:"Descansando",drinking:"Bebiendo",eating:"Comiendo",fishing:"Pescando",gathering:"Recolectando",moving:"Explorando / desplazándose",cooperating:"Cooperando",socializing:"Socializando",building:"Construyendo",crafting:"Fabricando",farming:"Cultivando",planting:"Plantando",harvesting:"Cosechando",trading:"Comerciando",teaching:"Enseñando",dead:"Fallecido"})[v]??v??"Sin actividad";
function phaseLabel(v){return ({approach:"Aproximándose",inspect:"Inspeccionando",collect:"Recolectando",cast:"Lanzando",wait:"Esperando",discover:"Descubriendo",prepare:"Preparando",construct:"Construyendo",craft:"Fabricando",plant:"Plantando",harvest:"Cosechando",talk:"Conversando",teach:"Enseñando",work:"Trabajando",exchange:"Intercambiando"}[v]??v??"—");}
function renderAgentPanel(a){if(!a)return;document.querySelector("#agentName").textContent=a.name;document.querySelector("#agentAge").textContent=`Edad: ${a.age} años · ${a.alive?"Vivo":"Fallecido"} · Día ${simulation.day}`;document.querySelector("#agentAvatar").style.background=a.id==="alex"?"#345b8c":"#8c4f34";const n=[["Hambre",a.needs?.hunger],["Sed",a.needs?.thirst],["Energía",a.needs?.energy],["Social",a.needs?.social],["Seguridad",a.needs?.safety],["Salud",a.needs?.health]];document.querySelector("#agentStatus").innerHTML=n.map(([k,v])=>`<div class="agentRow"><span>${k}</span><strong>${pct(v)}%</strong></div><div class="agentBar"><span style="width:${pct(v)}%"></span></div>`).join("")+`<div class="agentRow"><span>Actividad</span><strong>${activity(a.currentActivity)}</strong></div><div class="agentRow"><span>Fase</span><strong>${phaseLabel(a.activityPhase)}</strong></div><div class="agentRow"><span>Intención</span><strong>${action(a.currentIntent?.name)}</strong></div><div class="agentRow"><span>Última acción</span><strong>${action(a.lastActionName)}</strong></div><div class="agentRow"><span>Objetivo</span><strong>${action(a.plan?.goal)}</strong></div><div class="agentRow"><span>Siguiente paso</span><strong>${action(a.plan?.steps?.[0])}</strong></div><div class="agentRow"><span>Progreso</span><strong>${a.plan ? `${a.plan.progress ?? 0} · replanteos ${a.plan.replans ?? 0}` : "—"}</strong></div>`;const d=a.decisionSnapshot;document.querySelector("#agentDecision").innerHTML=d?.chosen?`<div class="agentRow"><span>Elección</span><strong>${action(d.chosen.name)}</strong></div><div class="agentRow"><span>Puntuación</span><strong>${Number(d.chosen.score).toFixed(2)}</strong></div>`:'<div class="agentEmpty">Todavía no hay una decisión registrada.</div>';const inv=(a.inventory??[]).reduce((o,i)=>(o[i.type]=(o[i.type]||0)+(Number(i.amount)||0),o),{});const tools=(a.inventory??[]).filter(i=>i.type==="tool"&&Number(i.durability)>0);document.querySelector("#agentResources").innerHTML=`<div class="agentRow"><span>Monedas</span><strong>${a.money??0}</strong></div><div class="agentRow"><span>Posición</span><strong>${(+a.position?.x||0).toFixed(1)}, ${(+a.position?.z||0).toFixed(1)}</strong></div><div class="agentRow"><span>Inventario</span><strong>${Object.entries(inv).map(([k,v])=>`${k} × ${v.toFixed(1)}`).join(", ")||"vacío"}</strong></div>${tools.length?`<div class="agentRow"><span>Herramientas</span><strong>${tools.map(t=>`${t.kind??"herramienta"} · ${t.durability}`).join(", ")}</strong></div>`:""}`;document.querySelector("#agentKnowledge").innerHTML=(a.knowledge??[]).length?a.knowledge.slice(-10).reverse().map(k=>`<span class="agentTag">${String(k.topic).replace(/^action:/,"")} · ${pct((k.confidence??0)*100)}%</span>`).join(""):"<div class=\"agentEmpty\">Aún no ha adquirido conocimiento.</div>";document.querySelector("#agentRelationships").innerHTML=(a.relationships??[]).length?a.relationships.map(r=>`<div class="agentRow"><span>${agents.find(x=>x.id===r.agentId)?.name??r.agentId}</span><strong>confianza ${pct((r.trust??0)*100)}%</strong></div>`).join(""):"<div class=\"agentEmpty\">Aún no tiene relaciones registradas.</div>";document.querySelector("#agentExperiences").innerHTML=(a.experiences??[]).length?a.experiences.slice(-8).reverse().map(e=>`<div class="agentExperience"><strong>Día ${e.day??"—"}</strong> · ${e.description??"Experiencia registrada"}</div>`).join(""):"<div class=\"agentEmpty\">Aún no hay experiencias registradas.</div>";const p=document.querySelector("#agentPanel");p.classList.add("open");p.setAttribute("aria-hidden","false");}
function openAgent(id){const a=agents.find(x=>x.id===id);if(a){selectedAgentId=id;centerOnAgent(a);renderAgentPanel(a);}}
document.querySelector("#closeAgentPanel")?.addEventListener("click",()=>{const p=document.querySelector("#agentPanel");p.classList.remove("open");p.setAttribute("aria-hidden","true");});
document.querySelector("#agentDebug")?.addEventListener("click",centerOnAgents);
document.querySelectorAll("[data-agent]")?.forEach(button=>button.addEventListener("click",e=>{e.stopPropagation();openAgent(button.dataset.agent);}));
let dragging=false,lastX=0,lastY=0,pinchStart=0,gestureStart=null,gestureMoved=false,lastAngle=0;
const pointers=new Map();
const distance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
const angle=(a,b)=>Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX);
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function pickAgent(clientX,clientY){const r=renderer.domElement.getBoundingClientRect();pointer.x=((clientX-r.left)/r.width)*2-1;pointer.y=-((clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects([...meshes.values()],true)[0];let o=hit?.object,id=null;while(o&&!id){id=o.userData?.agentId;o=o.parent;}if(id)openAgent(id);return !!id;}
renderer.domElement.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;pointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY,startX:e.clientX,startY:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);if(pointers.size===1){dragging=true;lastX=e.clientX;lastY=e.clientY;gestureStart={x:e.clientX,y:e.clientY,id:e.pointerId};gestureMoved=false;}else if(pointers.size===2){dragging=false;gestureMoved=true;const pts=[...pointers.values()];pinchStart=distance(pts[0],pts[1]);lastAngle=angle(pts[0],pts[1]);}});
renderer.domElement.addEventListener("pointermove",e=>{const p=pointers.get(e.pointerId);if(!p)return;p.clientX=e.clientX;p.clientY=e.clientY;if(pointers.size===2){const pts=[...pointers.values()];const d=distance(pts[0],pts[1]);if(pinchStart>0)cameraDistance=Math.max(10,Math.min(110,cameraDistance+(pinchStart-d)*.07));pinchStart=d;const a=angle(pts[0],pts[1]);let da=a-lastAngle;if(da>Math.PI)da-=Math.PI*2;if(da<-Math.PI)da+=Math.PI*2;cameraYaw-=da*1.35;lastAngle=a;return;}if(pointers.size!==1||!dragging)return;const dx=e.clientX-p.startX,dy=e.clientY-p.startY;if(Math.hypot(dx,dy)>8)gestureMoved=true;const mdx=e.clientX-lastX,mdy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;const s=.14;const right=new THREE.Vector3(Math.cos(cameraYaw),0,-Math.sin(cameraYaw));const forward=new THREE.Vector3(Math.sin(cameraYaw),0,Math.cos(cameraYaw));cameraTarget.addScaledVector(right,-mdx*s);cameraTarget.addScaledVector(forward,-mdy*s);clampCamera();});
function endPointer(e){const wasTap=pointers.size===1&&!gestureMoved&&gestureStart?.id===e.pointerId;const x=e.clientX,y=e.clientY;pointers.delete(e.pointerId);if(pointers.size<2){pinchStart=0;lastAngle=0;}if(pointers.size===1){const p=[...pointers.values()][0];dragging=true;lastX=p.clientX;lastY=p.clientY;}else{dragging=false;}if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);if(wasTap)pickAgent(x,y);if(pointers.size===0){gestureStart=null;gestureMoved=false;}}
renderer.domElement.addEventListener("pointerup",endPointer);renderer.domElement.addEventListener("pointercancel",endPointer);renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();cameraDistance=Math.max(10,Math.min(110,cameraDistance+e.deltaY*.035));},{passive:false});
addEventListener("keydown",e=>{const s=1.2;if(e.key==="w"||e.key==="ArrowUp")cameraTarget.z-=s;if(e.key==="s"||e.key==="ArrowDown")cameraTarget.z+=s;if(e.key==="a"||e.key==="ArrowLeft")cameraTarget.x-=s;if(e.key==="d"||e.key==="ArrowRight")cameraTarget.x+=s;if(e.key==="+"||e.key==="=")cameraDistance=Math.max(10,cameraDistance-2);if(e.key==="-")cameraDistance=Math.min(110,cameraDistance+2);clampCamera();});
function ensureVisibleMotion(agent,now,dt){
  agent.__motionWatch ??={lastX:agent.position.x,lastZ:agent.position.z,lastMoveAt:now,lastTargetAt:0};
  const w=agent.__motionWatch;
  const moved=Math.hypot(agent.position.x-w.lastX,agent.position.z-w.lastZ)>.035;
  if(moved){w.lastX=agent.position.x;w.lastZ=agent.position.z;w.lastMoveAt=now;}
  // Watchdog: si un estado persistido deja al habitante inmóvil demasiado tiempo,
  // recupera el paseo sin tocar una intención real en curso.
  if(!agent.currentIntent && agent.alive && !agent.movement?.moving && now-w.lastMoveAt>7){
    const seed=(agent.id==="alex"?17:43)+Math.floor(now/7000);
    const angle=seed*2.399;
    const radius=5.5+(seed%4)*1.25;
    setMovementTarget(agent,{
      x:agent.position.x+Math.cos(angle)*radius,
      z:agent.position.z+Math.sin(angle)*radius
    },world.bounds);
    agent.currentActivity="moving";
    w.lastMoveAt=now;
    w.lastTargetAt=now;
  }
}

function update(){const now=performance.now(),dt=Math.min((now-last)/1000,.25);last=now;try{animateLighting(simulation.hour);}catch(e){console.error("Lúmina lighting",e);}try{animateEnvironment(now/1000);}catch(e){console.error("Lúmina environment",e);}try{for(const a of agents){if(a.currentIntent?.target)setMovementTarget(a,a.currentIntent.target,world.bounds);}tick(simulation,dt/37.5);for(const a of agents){if(a.currentIntent?.target)setMovementTarget(a,a.currentIntent.target,world.bounds);moveAgent(a,dt);ensureVisibleMotion(a,now/1000,dt);}}catch(e){console.error("Lúmina simulation",e);}try{syncMeshes();}catch(e){console.error("Lúmina meshes",e);}try{updateVillageLOD();}catch(e){console.error("Lúmina village LOD",e);}try{const panel=document.querySelector("#agentPanel");if(selectedAgentId&&panel?.classList.contains("open"))renderAgentPanel(agents.find(a=>a.id===selectedAgentId));if(worldTime){const h=Math.floor(simulation.hour),m=Math.floor((simulation.hour-h)*60),alive=agents.filter(a=>a.alive!==false).length;worldTime.textContent=`Aldea IA · Día ${simulation.day} · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} · Habitantes ${alive} · Velocidad 1x`;const count=document.querySelector("#agentDebug strong");if(count)count.textContent=`Habitantes: ${alive}`;}}catch(e){console.error("Lúmina UI",e);}if(now-lastSave>=2000){try{save();}catch(e){console.error("Lúmina save",e);}lastSave=now;}}
loadLocal();normalize();syncMeshes();centerOnAgents();loadRemoteIfNeeded();updateCamera();addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});addEventListener("beforeunload",save);function animate(){requestAnimationFrame(animate);update();updateCamera();renderer.render(scene,camera);}animate();
