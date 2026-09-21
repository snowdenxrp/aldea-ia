import assert from "node:assert/strict";
import { getVillageLayout } from "../src/village-layout.js";

const layout=getVillageLayout();
assert.ok(layout.river && Number.isFinite(layout.river.centerX),"el río debe tener un eje X definido");
assert.ok(layout.river.width >= 8,"el cauce debe tener anchura suficiente para lectura visual");
assert.ok(layout.bridge && layout.bridge.lengthX >= layout.river.width + 2,"el puente debe cruzar todo el ancho del río con margen");
assert.ok(layout.bridge.widthZ >= 3.4,"el puente debe tener una plataforma legible");
assert.ok(Math.abs(layout.bridge.x-layout.river.centerX) < 0.01,"el puente debe centrarse sobre el río");
assert.ok(layout.paths.some(p=>p.name==="bridge-west") && layout.paths.some(p=>p.name==="bridge-east"),"el puente debe tener accesos en ambas orillas");
const houses=layout.buildings.filter(b=>b.type==="house");
assert.ok(houses.length >= 10,"la aldea necesita densidad residencial reconocible");
assert.ok(layout.paths.length >= 7,"la aldea necesita una red de caminos conectada");
assert.ok(layout.trees.length >= 12,"la aldea necesita vegetación distribuida");
assert.ok(layout.plaza && layout.well && layout.market,"la aldea debe tener un centro reconocible");

// Auditoría aproximada de huella: una casa debe quedar fuera del rectángulo
// de cada camino con un margen visual de 2.4 unidades (media huella residencial).
const residentialHalf=2.4;
const relevantPaths=layout.paths.filter(p=>["residential-north","residential-south","main-axis","west-link","market-link","garden-link"].includes(p.name));
function distanceToPath(h,p){
  const hw=p.width/2,hl=p.length/2;
  const horizontal=["east","west","market-link","garden-link"].includes(p.name);
  const cx=p.x,cz=p.z;
  const dx=Math.max(Math.abs(h.x-cx)-hw,0);
  const dz=Math.max(Math.abs(h.z-cz)-hl,0);
  return Math.hypot(dx,dz);
}
for(const h of houses) for(const p of relevantPaths)
  assert.ok(distanceToPath(h,p)>=residentialHalf,`casa en ${h.x},${h.z} invade el camino ${p.name}`);

for(let i=0;i<houses.length;i++) for(let j=i+1;j<houses.length;j++){
  const dx=houses[i].x-houses[j].x,dz=houses[i].z-houses[j].z;
  assert.ok(Math.hypot(dx,dz)>=5.5,`casas demasiado juntas: ${houses[i].x},${houses[i].z} / ${houses[j].x},${houses[j].z}`);
}
assert.ok(houses.every(h=>h.scale>=.98),"las casas residenciales deben mantener una escala visual grande");
assert.ok(layout.trees.every(t=>t[2]>=1.6),"los árboles de la aldea deben superar claramente la escala de los habitantes");

console.log(JSON.stringify({
  audit:"lumina-village-visual-geometry",
  river:layout.river,
  bridge:layout.bridge,
  buildings:layout.buildings.length,
  paths:layout.paths.length,
  trees:layout.trees.length,
  houseMinScale:Math.min(...houses.map(h=>h.scale)),
  treeMinScale:Math.min(...layout.trees.map(t=>t[2])),
  verdict:"PASS"
},null,2));

const north=houses.filter(h=>h.z>0),south=houses.filter(h=>h.z<0);
assert.equal(north.length,5,"la fila residencial norte debe tener cinco casas");
assert.equal(south.length,5,"la fila residencial sur debe tener cinco casas");
assert.ok(north.every(h=>Math.abs(h.z-16.3)<0.01),"las casas del norte deben formar una fila");
assert.ok(south.every(h=>Math.abs(h.z+16.3)<0.01),"las casas del sur deben formar una fila");
