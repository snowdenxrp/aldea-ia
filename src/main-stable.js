import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { world } from "./world.js";
import { createInitialAgents } from "./agents.js";
import { createSimulation, tick } from "./simulation.js";
import { setMovementTarget, moveAgent } from "./movement.js";

const app=document.querySelector("#app"), worldTime=document.querySelector("#worldTime");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9ec9df);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.domElement.style.touchAction="none"; renderer.domElement.style.userSelect="none"; app.appendChild(renderer.domElement);
const light=new THREE.DirectionalLight(0xffffff,2.2); light.position.set(12,25,10); scene.add(light,new THREE.HemisphereLight(0xbfe7ff,0x6f8f58,1.2));
const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),new THREE.MeshStandardMaterial({color:0x6f9b58})); ground.rotation.x=-Math.PI/2; scene.add(ground);
const river=new THREE.Mesh(new THREE.PlaneGeometry(10,90),new THREE.MeshStandardMaterial({color:0x4f9ed1})); river.rotation.x=-Math.PI/2; river.position.set(-18,.03,0); scene.add(river);
for(const [x,z] of [[-5,-7],[4,-6],[8,2],[1,8]]){const h=new THREE.Mesh(new THREE.BoxGeometry(4,2.4,4),new THREE.MeshStandardMaterial({color:0xc8a27b}));h.position.set(x,1.2,z);scene.add(h);}
const agents=createInitialAgents(),simulation=createSimulation(world,agents),SAVE_KEY="lumina-world-v8";
let selectedAgentId=null;
let cameraTarget=new THREE.Vector3(1,0,1),cameraDistance=34,cameraYaw=.55,cameraPitch=.58,last=performance.now(),lastSave=last,fault=null;
const meshes=new Map();
function validState(s){return s&&s.world?.resources&&Array.isArray(s.agents)&&s.agents.some(a=>a?.id==="alex")&&s.agents.some(a=>a?.id==="bruno");}
function normalize(){for(const fallback of createInitialAgents()){let a=agents.find(x=>x.id===fallback.id);if(!a){a=structuredClone(fallback);agents.push(a);}if (typeof a.alive !== "boolean") a.alive = fallback.alive;a.position??={...fallback.position};a.position.x=Number.isFinite(+a.position.x)?+a.position.x:fallback.position.x;a.position.z=Number.isFinite(+a.position.z)?+a.position.z:fallback.position.z;a.position.x=Math.max(world.bounds.minX,Math.min(world.bounds.maxX,a.position.x));a.position.z=Math.max(world.bounds.minZ,Math.min(world.bounds.maxZ,a.position.z));a.currentActivity??="idle";a.currentIntent??=null;a.decisionCooldownHours=Number.isFinite(+a.decisionCooldownHours)?Math.max(0,+a.decisionCooldownHours):0;a.lastActionName??=null;a.needs??={hunger:100,thirst:100,energy:100,social:100,safety:100,health:100};a.inventory??=[];a.knowledge??=[];a.relationships??=[];a.experiences??=[];}}
function applyState(s){Object.assign(world,structuredClone(s.world));simulation.day=Number(s.day)||world.day||1;simulation.hour=Number.isFinite(+s.hour)?+s.hour:(world.timeOfDay||8);simulation.events=Array.isArray(s.events)?s.events.slice(-500):[];agents.splice(0,agents.length,...structuredClone(s.agents));normalize();}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:8,savedAt:Date.now(),day:simulation.day,hour:simulation.hour,world,agents,events:simulation.events.slice(-500)}));}catch{}}
function loadLocal(){try{const current=JSON.parse(localStorage.getItem(SAVE_KEY)||"null"),legacy=["lumina-world-v5","lumina-world-v4","lumina-world-v3"].map(k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch{return null}}).filter(validState);let chosen=validState(current)?current:null;if(legacy.length){const best=legacy.sort((a,b)=>(+b.savedAt||0)-(+a.savedAt||0))[0];if(!chosen||(+best.day>+chosen.day||(+best.day===+chosen.day&&+best.hour>+chosen.hour)))chosen=best;}if(chosen)applyState(chosen);}catch{}}
async function loadRemoteIfNeeded(){try{if(validState(JSON.parse(localStorage.getItem(SAVE_KEY)||"null")))return;const r=await fetch("./world-state.json?ts="+Date.now(),{cache:"no-store"});if(!r.ok)return;const s=await r.json();if(validState(s)){applyState(s);save();syncMeshes();centerOnAgents();}}catch{}}
function createMesh(a){const g=new THREE.Group();g.userData.agentId=a.id;g.scale.setScalar(1.55);g.frustumCulled=false;const blue=a.id==="alex";const body=new THREE.Mesh(new THREE.BoxGeometry(.82,1,.48),new THREE.MeshBasicMaterial({color:blue?0x2f7de1:0xe87832,depthTest:false}));body.position.y=1.18;const head=new THREE.Mesh(new THREE.SphereGeometry(.38,16,12),new THREE.MeshBasicMaterial({color:0xf0bd91,depthTest:false}));head.position.y=1.98;const marker=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),new THREE.MeshBasicMaterial({color:blue?0x59b7ff:0xffb15c,depthTest:false}));marker.position.y=2.65;g.add(body,head,marker);g.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.renderOrder=1000;}});scene.add(g);return g;}
function syncMeshes(){normalize();for(const a of agents){let m=meshes.get(a.id);if(!m){m=createMesh(a);meshes.set(a.id,m);}m.visible=true;m.position.set(a.position.x,0,a.position.z);}}
function centerOnAgents(){const c=agents.filter(a=>a.id==="alex"||a.id==="bruno");if(c.length)cameraTarget.set(c.reduce((s,a)=>s+a.position.x,0)/c.length,0,c.reduce((s,a)=>s+a.position.z,0)/c.length);}
function centerOnAgent(a){if(a)cameraTarget.set(+a.position.x||0,0,+a.position.z||0);}
function updateCamera(){const h=cameraDistance*Math.cos(cameraPitch);camera.position.set(cameraTarget.x+Math.sin(cameraYaw)*h,cameraTarget.y+cameraDistance*Math.sin(cameraPitch),cameraTarget.z+Math.cos(cameraYaw)*h);camera.lookAt(cameraTarget);}
function pct(v){return Math.round(Math.max(0,Math.min(100,+v||0)));}
const action=v=>({rest:"Descansar",drink:"Beber agua",eat_plant:"Comer planta",catch_fish:"Pescar",gather_wood:"Recolectar madera",gather_stone:"Recolectar piedra",socialize:"Socializar",share_knowledge:"Compartir conocimiento",explore_plants:"Investigar plantas",explore_fishing:"Investigar pesca",explore_wood:"Investigar madera",explore_stone:"Investigar piedra",explore_area:"Explorar entorno",eat_fish:"Comer pescado"})[v]??v??"Ninguna";
const activity=v=>({idle:"Sin actividad",resting:"Descansando",drinking:"Bebiendo",eating:"Comiendo",fishing:"Pescando",gathering:"Recolectando",moving:"Desplazándose",dead:"Fallecido"})[v]??v??"Sin actividad";
function renderAgentPanel(a){if(!a)return;document.querySelector("#agentName").textContent=a.name;document.querySelector("#agentAge").textContent=`Edad: ${a.age} años · ${a.alive?"Vivo":"Fallecido"} · Día ${simulation.day}`;document.querySelector("#agentAvatar").style.background=a.id==="alex"?"#345b8c":"#8c4f34";const n=[["Hambre",a.needs?.hunger],["Sed",a.needs?.thirst],["Energía",a.needs?.energy],["Social",a.needs?.social],["Seguridad",a.needs?.safety],["Salud",a.needs?.health]];document.querySelector("#agentStatus").innerHTML=n.map(([k,v])=>`<div class="agentRow"><span>${k}</span><strong>${pct(v)}%</strong></div><div class="agentBar"><span style="width:${pct(v)}%"></span></div>`).join("")+`<div class="agentRow"><span>Actividad</span><strong>${activity(a.currentActivity)}</strong></div><div class="agentRow"><span>Intención</span><strong>${action(a.currentIntent?.name)}</strong></div><div class="agentRow"><span>Última acción</span><strong>${action(a.lastActionName)}</strong></div>`;const d=a.decisionSnapshot;document.querySelector("#agentDecision").innerHTML=d?.chosen?`<div class="agentRow"><span>Elección</span><strong>${action(d.chosen.name)}</strong></div><div class="agentRow"><span>Puntuación</span><strong>${Number(d.chosen.score).toFixed(2)}</strong></div>`:'<div class="agentEmpty">Todavía no hay una decisión registrada.</div>';const inv=(a.inventory??[]).reduce((o,i)=>(o[i.type]=(o[i.type]||0)+(Number(i.amount)||0),o),{});document.querySelector("#agentResources").innerHTML=`<div class="agentRow"><span>Monedas</span><strong>${a.money??0}</strong></div><div class="agentRow"><span>Posición</span><strong>${(+a.position?.x||0).toFixed(1)}, ${(+a.position?.z||0).toFixed(1)}</strong></div><div class="agentRow"><span>Inventario</span><strong>${Object.entries(inv).map(([k,v])=>`${k} × ${v.toFixed(1)}`).join(", ")||"vacío"}</strong></div>`;document.querySelector("#agentKnowledge").innerHTML=(a.knowledge??[]).length?a.knowledge.slice(-10).reverse().map(k=>`<span class="agentTag">${String(k.topic).replace(/^action:/,"")} · ${pct((k.confidence??0)*100)}%</span>`).join(""):"<div class=\"agentEmpty\">Aún no ha adquirido conocimiento.</div>";document.querySelector("#agentRelationships").innerHTML=(a.relationships??[]).length?a.relationships.map(r=>`<div class="agentRow"><span>${agents.find(x=>x.id===r.agentId)?.name??r.agentId}</span><strong>confianza ${pct((r.trust??0)*100)}%</strong></div>`).join(""):"<div class=\"agentEmpty\">Aún no tiene relaciones registradas.</div>";document.querySelector("#agentExperiences").innerHTML=(a.experiences??[]).length?a.experiences.slice(-8).reverse().map(e=>`<div class="agentExperience"><strong>Día ${e.day??"—"}</strong> · ${e.description??"Experiencia registrada"}</div>`).join(""):"<div class=\"agentEmpty\">Aún no hay experiencias registradas.</div>";const p=document.querySelector("#agentPanel");p.classList.add("open");p.setAttribute("aria-hidden","false");}
function openAgent(id){const a=agents.find(x=>x.id===id);if(a){selectedAgentId=id;centerOnAgent(a);renderAgentPanel(a);}}
document.querySelector("#closeAgentPanel")?.addEventListener("click",()=>{const p=document.querySelector("#agentPanel");p.classList.remove("open");p.setAttribute("aria-hidden","true");});
document.querySelector("#agentDebug")?.addEventListener("click",centerOnAgents);
// Limpieza defensiva: elimina cualquier texto de instrucciones antiguo que haya quedado en una versión cacheada del DOM.
document.querySelectorAll("small").forEach(el=>{if(/arrastra|pellizca|toca un habitante/i.test(el.textContent||""))el.remove();});
document.querySelectorAll("[data-agent]")?.forEach(button=>button.addEventListener("click",e=>{e.stopPropagation();openAgent(button.dataset.agent);}));
// Cámara estable: un dedo arrastra, dos dedos hacen pinch-zoom/rotación y la rueda hace zoom.
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
  const s=.105;
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
function update(){const now=performance.now(),dt=Math.min((now-last)/1000,.25);last=now;if(fault)return;try{tick(simulation,dt/37.5);for(const a of agents){if(a.currentIntent?.target)setMovementTarget(a,a.currentIntent.target,world.bounds);moveAgent(a,dt);}syncMeshes();const panel=document.querySelector("#agentPanel");if(selectedAgentId&&panel?.classList.contains("open"))renderAgentPanel(agents.find(a=>a.id===selectedAgentId));if(worldTime){const h=Math.floor(simulation.hour),m=Math.floor((simulation.hour-h)*60);worldTime.textContent=`Aldea IA · Día ${simulation.day} · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} · Velocidad 1x`;}if(now-lastSave>=2000){save();lastSave=now;}}catch(e){fault=e;console.error("Lúmina",e);}}
loadLocal();normalize();syncMeshes();centerOnAgents();loadRemoteIfNeeded();updateCamera();addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});addEventListener("beforeunload",save);function animate(){requestAnimationFrame(animate);update();updateCamera();renderer.render(scene,camera);}animate();