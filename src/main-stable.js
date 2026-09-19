import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { world } from "./world.js";
import { createInitialAgents } from "./agents.js";
import { createSimulation, tick } from "./simulation.js";
import { setMovementTarget, moveAgent } from "./movement.js";

const app = document.querySelector("#app");
const worldTime = document.querySelector("#worldTime");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ec9df);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
app.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 2.2);
light.position.set(12, 25, 10);
scene.add(light, new THREE.HemisphereLight(0xbfe7ff, 0x6f8f58, 1.2));
const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x6f9b58 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const river = new THREE.Mesh(new THREE.PlaneGeometry(10, 90), new THREE.MeshStandardMaterial({ color: 0x4f9ed1 }));
river.rotation.x = -Math.PI / 2;
river.position.set(-18, 0.03, 0);
scene.add(river);
for (const [x, z] of [[-5,-7],[4,-6],[8,2],[1,8]]) {
  const house = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0xc8a27b }));
  house.position.set(x, 1.2, z);
  scene.add(house);
}

const agents = createInitialAgents();
const simulation = createSimulation(world, agents);
const SAVE_KEY = "lumina-world-v6";
let cameraTarget = new THREE.Vector3(1, 0, 1);
let cameraDistance = 34;
let cameraYaw = 0.55;
let cameraPitch = 0.58;
let last = performance.now();
let lastSave = last;
let fault = null;
const meshes = new Map();

function validState(s) {
  return s && s.world?.resources && Array.isArray(s.agents) && s.agents.some(a => a?.id === "alex") && s.agents.some(a => a?.id === "bruno");
}
function normalize() {
  const initial = createInitialAgents();
  for (const fallback of initial) {
    let a = agents.find(x => x.id === fallback.id);
    if (!a) { a = structuredClone(fallback); agents.push(a); }
    a.alive = true;
    a.position ??= { ...fallback.position };
    a.position.x = Number.isFinite(Number(a.position.x)) ? Number(a.position.x) : fallback.position.x;
    a.position.z = Number.isFinite(Number(a.position.z)) ? Number(a.position.z) : fallback.position.z;
    a.position.x = Math.max(world.bounds.minX, Math.min(world.bounds.maxX, a.position.x));
    a.position.z = Math.max(world.bounds.minZ, Math.min(world.bounds.maxZ, a.position.z));
    a.currentActivity ??= "idle";
    a.currentIntent ??= null;
  }
}
function applyState(s) {
  Object.assign(world, structuredClone(s.world));
  simulation.day = Number(s.day) || world.day || 1;
  simulation.hour = Number.isFinite(Number(s.hour)) ? Number(s.hour) : (world.timeOfDay || 8);
  simulation.events = Array.isArray(s.events) ? s.events.slice(-500) : [];
  agents.splice(0, agents.length, ...structuredClone(s.agents));
  normalize();
}
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 6, savedAt: Date.now(), day: simulation.day, hour: simulation.hour, world, agents, events: simulation.events.slice(-500) }));
  } catch {}
}
function loadLocal() {
  try {
    const current = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    const legacy = ["lumina-world-v5", "lumina-world-v4", "lumina-world-v3"].map(k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }).filter(validState);
    let chosen = validState(current) ? current : null;
    if (legacy.length) {
      const best = legacy.sort((a,b) => (Number(b.savedAt)||0) - (Number(a.savedAt)||0))[0];
      if (!chosen || (Number(best.day) > Number(chosen.day) || (Number(best.day) === Number(chosen.day) && Number(best.hour) > Number(chosen.hour)))) chosen = best;
    }
    if (chosen) applyState(chosen);
  } catch {}
}
async function loadRemoteIfNeeded() {
  if (validState(JSON.parse(localStorage.getItem(SAVE_KEY) || "null"))) return;
  try {
    const r = await fetch("./world-state.json?ts=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return;
    const s = await r.json();
    if (validState(s)) { applyState(s); save(); syncMeshes(); }
  } catch {}
}
function createMesh(agent) {
  const group = new THREE.Group();
  group.userData.agentId = agent.id;
  group.scale.setScalar(1.55);
  group.frustumCulled = false;
  const blue = agent.id === "alex";
  const body = new THREE.Mesh(new THREE.BoxGeometry(.82,1,.48), new THREE.MeshBasicMaterial({color:blue?0x2f7de1:0xe87832,depthTest:false}));
  body.position.y = 1.18;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.38,16,12), new THREE.MeshBasicMaterial({color:0xf0bd91,depthTest:false}));
  head.position.y = 1.98;
  const marker = new THREE.Mesh(new THREE.SphereGeometry(.13,12,8), new THREE.MeshBasicMaterial({color:blue?0x59b7ff:0xffb15c,depthTest:false}));
  marker.position.y = 2.65;
  group.add(body, head, marker);
  group.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.renderOrder = 1000; } });
  scene.add(group);
  return group;
}
function syncMeshes() {
  normalize();
  for (const agent of agents) {
    let mesh = meshes.get(agent.id);
    if (!mesh) { mesh = createMesh(agent); meshes.set(agent.id, mesh); }
    mesh.visible = true;
    mesh.position.set(agent.position.x, 0, agent.position.z);
  }
}
function centerOnAgents() {
  const core = agents.filter(a => a.id === "alex" || a.id === "bruno");
  if (!core.length) return;
  cameraTarget.set(core.reduce((s,a)=>s+a.position.x,0)/core.length,0,core.reduce((s,a)=>s+a.position.z,0)/core.length);
}
function updateCamera() {
  const h = cameraDistance * Math.cos(cameraPitch);
  camera.position.set(cameraTarget.x + Math.sin(cameraYaw)*h, cameraTarget.y + cameraDistance*Math.sin(cameraPitch), cameraTarget.z + Math.cos(cameraYaw)*h);
  camera.lookAt(cameraTarget);
}
function update() {
  const now = performance.now();
  const dt = Math.min((now-last)/1000, .25);
  last = now;
  if (fault) return;
  try {
    tick(simulation, dt / 37.5);
    for (const a of agents) {
      if (a.currentIntent?.target) setMovementTarget(a, a.currentIntent.target, world.bounds);
      moveAgent(a, dt);
    }
    syncMeshes();
    if (worldTime) {
      const h = Math.floor(simulation.hour);
      const m = Math.floor((simulation.hour-h)*60);
      worldTime.textContent = `Aldea IA · Día ${simulation.day} · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} · Velocidad 1x`;
    }
    if (now-lastSave >= 2000) { save(); lastSave = now; }
  } catch (e) { fault = e; console.error("Lúmina", e); }
}

loadLocal();
normalize();
syncMeshes();
centerOnAgents();
loadRemoteIfNeeded();

document.querySelector("#agentDebug")?.addEventListener("click", centerOnAgents);
addEventListener("resize", () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });
addEventListener("beforeunload", save);
updateCamera();
function animate() { requestAnimationFrame(animate); update(); updateCamera(); renderer.render(scene,camera); }
animate();
