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
camera.position.set(22, 22, 28);
camera.lookAt(0, 0, 0);
let cameraTarget = new THREE.Vector3(0, 0, 0);
let cameraDistance = 34;
let cameraYaw = 0.55;
let cameraPitch = 0.58;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
app.appendChild(renderer.domElement);

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(12, 25, 10);
sun.castShadow = true;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbfe7ff, 0x6f8f58, 1.2));

const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: 0x6f9b58 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function flatPatch(x, z, w, d, color) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness: 1 }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.025, z);
  scene.add(mesh);
}

const river = new THREE.Mesh(new THREE.PlaneGeometry(10, 90), new THREE.MeshStandardMaterial({ color: 0x4f9ed1, roughness: 0.25 }));
river.rotation.x = -Math.PI / 2;
river.position.set(-18, 0.03, 0);
scene.add(river);

flatPatch(2, -22, 32, 12, 0x789f52);
flatPatch(24, 15, 18, 20, 0x77756d);

function addTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * scale, 0.32 * scale, 1.8 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x765333 }));
  trunk.position.set(x, 0.9 * scale, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const crown = new THREE.Mesh(new THREE.SphereGeometry(1.25 * scale, 12, 8), new THREE.MeshStandardMaterial({ color: 0x3f743e }));
  crown.position.set(x, 2.4 * scale, z);
  crown.castShadow = true;
  scene.add(crown);
}

for (const [x, z, s] of [[18,-14,1.2],[25,-9,1],[16,-3,1.3],[26,2,.9],[20,9,1.1],[29,13,.9],[12,16,1.2],[4,14,1],[-10,15,1.1],[-6,21,.9],[-13,7,1.2],[-5,10,1]]) addTree(x, z, s);

function addHouse(x, z) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0xc8a27b }));
  base.position.y = 1.2;
  base.castShadow = true;
  group.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0x7c4935 }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.6;
  roof.castShadow = true;
  group.add(roof);
  group.position.set(x, 0, z);
  scene.add(group);
}

addHouse(-5, -7); addHouse(4, -6); addHouse(8, 2); addHouse(1, 8);

const agents = createInitialAgents();
const simulation = createSimulation(world, agents);

const SAVE_KEY = "lumina-world-v5";
let lastSaveTime = performance.now();
let simulationFault = null;
let frameCount = 0;

function normalizeAgent(agent, fallback) {
  const source = agent ?? fallback;
  // Alex y Bruno son los dos habitantes núcleo de Lúmina: nunca deben desaparecer por un estado guardado corrupto.
  source.alive = true;
  source.position ??= { ...(fallback?.position ?? { x: 0, z: 0 }) };
  const x = Number(source.position.x);
  const z = Number(source.position.z);
  const bounds = world.bounds ?? { minX: -34, maxX: 34, minZ: -34, maxZ: 34 };
  source.position.x = Number.isFinite(x) ? Math.max(bounds.minX, Math.min(bounds.maxX, x)) : fallback.position.x;
  source.position.z = Number.isFinite(z) ? Math.max(bounds.minZ, Math.min(bounds.maxZ, z)) : fallback.position.z;
  source.currentActivity ??= "idle";
  source.currentIntent ??= null;
  source.lastActionName ??= null;
  source.lastActionResult ??= null;
  source.needs ??= { hunger: 100, thirst: 100, energy: 100, social: 100, safety: 100, health: 100 };
  source.inventory ??= [];
  source.knowledge ??= [];
  source.memories ??= [];
  source.relationships ??= [];
  source.skills ??= [];
  source.experiences ??= [];
  return source;
}

function ensureCoreAgents() {
  const initial = createInitialAgents();
  const byId = new Map(agents.map(agent => [agent.id, agent]));
  for (const fallback of initial) {
    if (!byId.has(fallback.id)) {
      agents.push(fallback);
      continue;
    }
    normalizeAgent(byId.get(fallback.id), fallback);
  }
  for (let i = agents.length - 1; i >= 0; i--) {
    if (!agents[i]?.id || !agents[i]?.name) agents.splice(i, 1);
  }
}

function parseSavedState(raw) {
  try {
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.agents) || !saved.world?.resources) return null;
    return saved;
  } catch {
    return null;
  }
}

function restoreSimulation() {
  try {
    const current = parseSavedState(localStorage.getItem(SAVE_KEY) ?? "");
    // En versiones anteriores guardábamos en v3/v4. No debemos perder el progreso
    // simplemente por cambiar la versión interna del formato.
    const legacy = ["lumina-world-v4", "lumina-world-v3"]
      .map(key => ({ key, saved: parseSavedState(localStorage.getItem(key) ?? "") }))
      .filter(item => item.saved);

    // Si v5 acaba de arrancar en el estado inicial pero existe un progreso anterior
    // (por ejemplo, Día 9), recuperar automáticamente ese progreso.
    let saved = current;
    if ((!saved || (Number(saved.day) <= 1 && Number(saved.hour) <= 8)) && legacy.length) {
      const bestLegacy = legacy
        .sort((a, b) => (Number(b.saved.savedAt) || 0) - (Number(a.saved.savedAt) || 0))[0]?.saved;
      if (bestLegacy && (Number(bestLegacy.day) > 1 || Number(bestLegacy.hour) > 8)) saved = bestLegacy;
    }
    if (!saved) return false;

    Object.assign(world, saved.world);
    Object.assign(simulation, {
      hour: Number.isFinite(Number(saved.hour)) ? Number(saved.hour) : (world.timeOfDay ?? 8),
      day: Number.isFinite(Number(saved.day)) ? Number(saved.day) : (world.day ?? 1),
      events: Array.isArray(saved.events) ? saved.events.slice(-500) : []
    });
    agents.splice(0, agents.length, ...saved.agents);
    ensureCoreAgents();
    // Migrar el estado recuperado al formato actual sin borrar las versiones antiguas.
    saveSimulation();
    return agents.length > 0;
  } catch (error) {
    console.warn("Lúmina: estado local inválido; se usará el estado inicial.", error);
    return false;
  }
}

function saveSimulation() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 5, savedAt: Date.now(), day: simulation.day, hour: simulation.hour, world, agents, events: simulation.events.slice(-500) }));
    return true;
  } catch (error) {
    console.warn("Lúmina: no se pudo guardar el estado local.", error);
    return false;
  }
}

async function restoreRemoteSimulation() {
  // El estado remoto es una plantilla inicial, no debe sobrescribir el progreso local.
  const existingLocal = localStorage.getItem(SAVE_KEY);
  if (existingLocal) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch("./world-state.json?ts=" + Date.now(), { cache: "no-store", signal: controller.signal });
    if (!response.ok) return false;
    const saved = await response.json();
    if (saved?.version < 3 || !Array.isArray(saved.agents) || !saved.world?.resources) return false;
    const localRaw = localStorage.getItem(SAVE_KEY);
    const local = localRaw ? JSON.parse(localRaw) : null;
    const remoteSavedAt = Number(saved.savedAt) || 0;
    const localSavedAt = Number(local?.savedAt) || 0;
    if (localSavedAt > remoteSavedAt) return false;
    Object.assign(world, saved.world);
    simulation.hour = Number.isFinite(Number(saved.hour)) ? Number(saved.hour) : (world.timeOfDay ?? 8);
    simulation.day = Number.isFinite(Number(saved.day)) ? Number(saved.day) : (world.day ?? 1);
    simulation.events = Array.isArray(saved.events) ? saved.events.slice(-500) : [];
    agents.splice(0, agents.length, ...saved.agents);
    ensureCoreAgents();
    saveSimulation();
    return agents.length > 0;
  } catch (error) {
    console.warn("Lúmina: no se pudo cargar el estado remoto.", error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

restoreSimulation();
ensureCoreAgents();
for (const agent of agents) normalizeAgent(agent, createInitialAgents().find(item => item.id === agent.id) ?? createInitialAgents()[0]);
const agentMeshes = new Map();

function createAgentMesh(agent) {
  // Renderizado deliberadamente simple y brillante: evita que iluminación, sombras,
  // materiales o profundidad hagan desaparecer a un habitante.
  const group = new THREE.Group();
  const position = agent.position ?? { x: 0, z: 0 };
  group.position.set(Number(position.x) || 0, 0.1, Number(position.z) || 0);
  group.scale.setScalar(1.55);
  group.renderOrder = 1000;
  group.userData.agentId = agent.id;
  group.frustumCulled = false;

  const isAlex = agent.id === "alex";
  const bodyColor = isAlex ? 0x2f7de1 : 0xe87832;
  const glowColor = isAlex ? 0x59b7ff : 0xffb15c;

  const bodyMat = new THREE.MeshBasicMaterial({ color: bodyColor, depthTest: false, depthWrite: false });
  const skinMat = new THREE.MeshBasicMaterial({ color: 0xf0bd91, depthTest: false, depthWrite: false });
  const darkMat = new THREE.MeshBasicMaterial({ color: 0x292929, depthTest: false, depthWrite: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: glowColor, depthTest: false, depthWrite: false });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.09, 10, 40), glowMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  group.add(ring);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.0, 0.48), bodyMat);
  torso.position.y = 1.18;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 14), skinMat);
  head.position.y = 1.98;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.39, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), darkMat);
  hair.position.y = 2.12;
  group.add(hair);

  const armGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.78, 10);
  const leftArm = new THREE.Mesh(armGeometry, skinMat);
  leftArm.position.set(-0.53, 1.18, 0);
  leftArm.rotation.z = -0.1;
  group.add(leftArm);
  const rightArm = new THREE.Mesh(armGeometry, skinMat);
  rightArm.position.set(0.53, 1.18, 0);
  rightArm.rotation.z = 0.1;
  group.add(rightArm);

  const legGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.82, 10);
  const leftLeg = new THREE.Mesh(legGeometry, darkMat);
  leftLeg.position.set(-0.22, 0.56, 0);
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeometry, darkMat);
  rightLeg.position.set(0.22, 0.56, 0);
  group.add(rightLeg);

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.14, 0.45), darkMat);
  leftFoot.position.set(-0.22, 0.14, 0.08);
  group.add(leftFoot);
  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.14, 0.45), darkMat);
  rightFoot.position.set(0.22, 0.14, 0.08);
  group.add(rightFoot);

  // Gran punto luminoso sobre la cabeza: sirve como identificador inequívoco.
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), glowMat);
  beacon.position.y = 2.65;
  group.add(beacon);

  group.traverse(object => {
    if (object.isMesh) {
      object.frustumCulled = false;
      object.renderOrder = 1000;
    }
  });
  return group;
}
function syncAgentMeshes() {
  // Los dos habitantes núcleo deben tener siempre una representación visual,
  // independientemente de lo que contenga el estado guardado.
  ensureCoreAgents();
  const core = createInitialAgents();
  for (const fallback of core) {
    const agent = agents.find(item => item.id === fallback.id);
    if (!agent) continue;
    normalizeAgent(agent, fallback);
    let mesh = agentMeshes.get(agent.id);
    if (!mesh) {
      mesh = createAgentMesh(agent);
      agentMeshes.set(agent.id, mesh);
      scene.add(mesh);
    }
    mesh.visible = true;
    mesh.position.set(agent.position.x, 0, agent.position.z);
  }
  for (const agent of agents) {
    if (agentMeshes.has(agent.id)) continue;
    const fallback = { position: { x: 0, z: 0 } };
    normalizeAgent(agent, fallback);
    const mesh = createAgentMesh(agent);
    agentMeshes.set(agent.id, mesh);
    scene.add(mesh);
    mesh.visible = true;
    mesh.position.set(agent.position.x, 0, agent.position.z);
  }
}

function addVisualDiagnostics() {
  let panel = document.querySelector("#luminaDiag");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "luminaDiag";
    panel.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:9999;padding:8px 10px;background:rgba(0,0,0,.75);color:#fff;font:12px monospace;border-radius:8px;pointer-events:none;max-width:90vw;";
    document.body.appendChild(panel);
  }
  const alex = agents.find(a => a.id === "alex");
  const bruno = agents.find(a => a.id === "bruno");
  const am = agentMeshes.get("alex");
  const bm = agentMeshes.get("bruno");
  panel.textContent = [
    "LÚMINA DEBUG",
    "frames: " + frameCount,
    "agents: " + agents.length,
    "Alex: " + (alex ? "OK" : "MISSING") + " mesh=" + (!!am) + " vis=" + (am?.visible ?? false) + " pos=" + (alex ? alex.position.x.toFixed(1)+","+alex.position.z.toFixed(1) : "—"),
    "Bruno: " + (bruno ? "OK" : "MISSING") + " mesh=" + (!!bm) + " vis=" + (bm?.visible ?? false) + " pos=" + (bruno ? bruno.position.x.toFixed(1)+","+bruno.position.z.toFixed(1) : "—"),
    "fault: " + (simulationFault ? (simulationFault.message || simulationFault) : "none")
  ].join(" · ");
}

syncAgentMeshes();
restoreRemoteSimulation().then(restored => { if (restored) syncAgentMeshes(); }).catch(() => {});

const agentPanel = document.querySelector("#agentPanel");
const closeAgentPanel = document.querySelector("#closeAgentPanel");
const agentAvatar = document.querySelector("#agentAvatar");
const agentName = document.querySelector("#agentName");
const agentAge = document.querySelector("#agentAge");
const agentStatus = document.querySelector("#agentStatus");
const agentDecision = document.querySelector("#agentDecision");
const agentResources = document.querySelector("#agentResources");
const agentKnowledge = document.querySelector("#agentKnowledge");
const agentRelationships = document.querySelector("#agentRelationships");
const agentExperiences = document.querySelector("#agentExperiences");

function formatPercent(value) { return Math.round(Math.max(0, Math.min(100, value))); }
function translateActivity(value) { const labels = { idle: "Sin actividad", dead: "Fallecido", resting: "Descansando", drinking: "Bebiendo", eating: "Comiendo", fishing: "Pescando", gathering: "Recolectando", moving: "Desplazándose" }; return labels[value] ?? value; }
function translateAction(value) { const labels = { rest: "Descansar", drink: "Beber agua", eat_plant: "Comer planta", catch_fish: "Pescar", gather_wood: "Recolectar madera", gather_stone: "Recolectar piedra", socialize: "Socializar", share_knowledge: "Compartir conocimiento", explore_plants: "Investigar plantas", explore_fishing: "Investigar pesca", explore_wood: "Investigar madera", explore_stone: "Investigar piedra", explore_area: "Explorar el entorno", eat_fish: "Comer pescado" }; return labels[value] ?? value; }
function translateItem(value) { return ({ fish: "pescado", wood: "madera", stone: "piedra" })[value] ?? value; }
function translateKnowledgeTopic(value) { const labels = { "action:rest": "Acción: descansar", "action:drink": "Acción: beber agua", "action:eat_plant": "Acción: comer planta", "action:catch_fish": "Acción: pescar", "action:gather_wood": "Acción: recolectar madera", "action:gather_stone": "Acción: recolectar piedra", "action:socialize": "Acción: socializar", "action:share_knowledge": "Acción: compartir conocimiento", "action:explore_plants": "Acción: investigar plantas", "action:explore_fishing": "Acción: investigar pesca", "action:explore_wood": "Acción: investigar madera", "action:explore_stone": "Acción: investigar piedra", "action:explore_area": "Acción: explorar el entorno", "action:eat_fish": "Acción: comer pescado" }; return labels[value] ?? String(value).replace(/^action:/, "Acción: "); }

function renderAgentPanel(agent) {
  agentName.textContent = agent.name;
  agentAge.textContent = `Edad: ${agent.age} años · ${agent.alive ? "Vivo" : "Fallecido"} · Día ${simulation.day}`;
  agentAvatar.style.background = agent.id === "alex" ? "#345b8c" : "#8c4f34";
  const needs = [["Hambre", agent.needs.hunger], ["Sed", agent.needs.thirst], ["Energía", agent.needs.energy], ["Social", agent.needs.social], ["Seguridad", agent.needs.safety], ["Salud", agent.needs.health]];
  agentStatus.innerHTML = `<div class="agentRow"><span>Actividad</span><strong>${translateActivity(agent.currentActivity)}</strong></div><div class="agentRow"><span>Intención actual</span><strong>${agent.currentIntent ? translateAction(agent.currentIntent.name) : "Ninguna"}</strong></div><div class="agentRow"><span>Última acción</span><strong>${agent.lastActionName ? translateAction(agent.lastActionName) : "Ninguna"}</strong></div>${needs.map(([label, value]) => `<div class="agentRow"><span>${label}</span><strong>${formatPercent(value)}%</strong></div><div class="agentBar"><span style="width:${formatPercent(value)}%"></span></div>`).join("")}`;
  const decision = agent.decisionSnapshot;
  if (decision?.chosen) { const considered = (decision.considered ?? []).map(option => `${translateAction(option.name)} (${Number(option.score).toFixed(2)})`).join(" · "); agentDecision.innerHTML = `<div class="agentRow"><span>Elección</span><strong>${translateAction(decision.chosen.name)}</strong></div><div class="agentRow"><span>Prioridad</span><strong>${Number(decision.chosen.score).toFixed(2)}</strong></div><div class="agentExperience"><strong>Opciones consideradas:</strong> ${considered || "—"}</div>`; } else agentDecision.innerHTML = '<div class="agentEmpty">Todavía no hay una decisión registrada.</div>';
  const inventoryTotals = (agent.inventory ?? []).reduce((totals, item) => { const type = item.type; const amount = Number(item.amount) || 0; totals[type] = (totals[type] ?? 0) + amount; return totals; }, {});
  const inventoryText = Object.entries(inventoryTotals).filter(([, amount]) => amount > 0).map(([type, amount]) => `${translateItem(type)} × ${amount.toFixed(2)}`).join(", ");
  agentResources.innerHTML = `<div class="agentRow"><span>Monedas</span><strong>${agent.money}</strong></div><div class="agentRow"><span>Posición</span><strong>${agent.position.x.toFixed(1)}, ${agent.position.z.toFixed(1)}</strong></div><div class="agentRow"><span>Inventario</span><strong>${inventoryText || "vacío"}</strong></div>`;
  const knowledge = agent.knowledge ?? [];
  agentKnowledge.innerHTML = knowledge.length ? knowledge.slice(-12).reverse().map(item => `<span class="agentTag">${translateKnowledgeTopic(item.topic)} · ${Math.round(item.confidence * 100)}%</span>`).join("") : '<div class="agentEmpty">Todavía no ha adquirido conocimiento del mundo.</div>';
  const relationships = agent.relationships ?? [];
  agentRelationships.innerHTML = relationships.length ? relationships.map(rel => { const other = agents.find(item => item.id === rel.agentId); const name = other?.name ?? rel.agentId; return `<div class="agentRow"><span>${name}</span><strong>confianza ${Math.round(rel.trust * 100)}% · familiaridad ${Math.round(rel.familiarity * 100)}%</strong></div>`; }).join("") : '<div class="agentEmpty">Aún no tiene relaciones registradas.</div>';
  const experiences = agent.experiences ?? [];
  agentExperiences.innerHTML = experiences.length ? experiences.slice(-8).reverse().map(exp => `<div class="agentExperience"><strong>Día ${exp.day ?? "—"}</strong> · ${exp.description}</div>`).join("") : '<div class="agentEmpty">Aún no hay experiencias registradas.</div>';
}
function openAgentPanel(agent) { renderAgentPanel(agent); agentPanel.classList.add("open"); agentPanel.setAttribute("aria-hidden", "false"); }
function closePanel() { agentPanel.classList.remove("open"); agentPanel.setAttribute("aria-hidden", "true"); }
closeAgentPanel.addEventListener("click", closePanel);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerStart = null;
const keys = new Set();
addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let pinchDistance = null;
let pinchAngle = null;
const activePointers = new Map();
function pointerDistance(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
function pointerAngle(a, b) { return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX); }
renderer.domElement.addEventListener("pointerdown", e => { if (activePointers.size === 0) pointerStart = { x: e.clientX, y: e.clientY }; activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY }); if (activePointers.size === 1) { dragging = true; lastPointerX = e.clientX; lastPointerY = e.clientY; } else if (activePointers.size === 2) { dragging = false; const points = [...activePointers.values()]; pinchDistance = pointerDistance(points[0], points[1]); pinchAngle = pointerAngle(points[0], points[1]); } renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener("pointermove", e => { if (!activePointers.has(e.pointerId)) return; activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY }); if (activePointers.size === 2) { const points = [...activePointers.values()]; const distance = pointerDistance(points[0], points[1]); const angle = pointerAngle(points[0], points[1]); if (pinchDistance !== null) cameraDistance = Math.max(10, Math.min(65, cameraDistance + (pinchDistance - distance) * 0.055)); if (pinchAngle !== null) { let angleChange = angle - pinchAngle; if (angleChange > Math.PI) angleChange -= Math.PI * 2; if (angleChange < -Math.PI) angleChange += Math.PI * 2; cameraYaw += angleChange; } pinchDistance = distance; pinchAngle = angle; return; } if (!dragging) return; const dx = e.clientX - lastPointerX; const dy = e.clientY - lastPointerY; lastPointerX = e.clientX; lastPointerY = e.clientY; const sensitivity = 0.075; const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)); const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw)); cameraTarget.addScaledVector(right, -dx * sensitivity); cameraTarget.addScaledVector(forward, -dy * sensitivity); cameraTarget.x = Math.max(-38, Math.min(38, cameraTarget.x)); cameraTarget.z = Math.max(-38, Math.min(38, cameraTarget.z)); });
function endPointer(e) { const wasSingleTap = activePointers.size === 1 && pointerStart && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 10; activePointers.delete(e.pointerId); if (activePointers.size < 2) { pinchDistance = null; pinchAngle = null; } if (activePointers.size === 1) { const remaining = [...activePointers.values()][0]; dragging = true; lastPointerX = remaining.clientX; lastPointerY = remaining.clientY; } else dragging = false; if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId); if (wasSingleTap) { const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1; raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects([...agentMeshes.values()], true)[0]; let selectedId = hit?.object?.userData?.agentId ?? null; let object = hit?.object; while (!selectedId && object?.parent) { object = object.parent; selectedId = object.userData?.agentId ?? null; } if (selectedId) { const selected = simulation.agents.find(agent => agent.id === selectedId); if (selected) openAgentPanel(selected); } } pointerStart = null; }
renderer.domElement.addEventListener("pointerup", endPointer);
renderer.domElement.addEventListener("pointercancel", endPointer);
renderer.domElement.addEventListener("wheel", e => { e.preventDefault(); cameraDistance = Math.max(10, Math.min(65, cameraDistance + e.deltaY * 0.03)); }, { passive: false });

function moveCamera(deltaSeconds) { const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw)); const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)); const direction = new THREE.Vector3(); if (keys.has("w") || keys.has("arrowup")) direction.add(forward); if (keys.has("s") || keys.has("arrowdown")) direction.sub(forward); if (keys.has("d") || keys.has("arrowright")) direction.add(right); if (keys.has("a") || keys.has("arrowleft")) direction.sub(right); if (direction.lengthSq() > 0) { direction.normalize(); cameraTarget.addScaledVector(direction, 18 * deltaSeconds); cameraTarget.x = Math.max(-38, Math.min(38, cameraTarget.x)); cameraTarget.z = Math.max(-38, Math.min(38, cameraTarget.z)); } const horizontal = cameraDistance * Math.cos(cameraPitch); camera.position.set(cameraTarget.x + Math.sin(cameraYaw) * horizontal, cameraTarget.y + cameraDistance * Math.sin(cameraPitch), cameraTarget.z + Math.cos(cameraYaw) * horizontal); camera.lookAt(cameraTarget); }

let lastSimulationTime = performance.now();
function updateSimulation() {
  const now = performance.now();
  frameCount += 1;
  const elapsed = Math.min((now - lastSimulationTime) / 1000, 0.25);
  lastSimulationTime = now;
  if (worldTime) { const hour = Math.floor(simulation.hour); const minute = Math.floor((simulation.hour - hour) * 60); worldTime.textContent = `Aldea IA · Día ${simulation.day} · ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} · Velocidad 1x`; }
  try {
    if (!simulationFault) tick(simulation, elapsed / 37.5);
    syncAgentMeshes();
    addVisualDiagnostics();
    for (const agent of simulation.agents) {
      if (agent.currentIntent?.target) setMovementTarget(agent, agent.currentIntent.target, world.bounds);
      moveAgent(agent, elapsed);
      const mesh = agentMeshes.get(agent.id);
      if (mesh) { mesh.visible = agent.alive !== false; mesh.position.set(agent.position.x, 0, agent.position.z); }
    }
  } catch (error) {
    simulationFault = error;
    console.error("Lúmina: error durante la simulación; se mantiene el mundo visible.", error);
  }
  if (now - lastSaveTime >= 2000) { saveSimulation(); lastSaveTime = now; }
}

addEventListener("beforeunload", saveSimulation);
const clock = new THREE.Clock();
function animate() { requestAnimationFrame(animate); updateSimulation(); moveCamera(Math.min(clock.getDelta(), 0.05)); const t = clock.getElapsedTime(); sun.position.x = Math.sin(t * 0.04) * 18; renderer.render(scene, camera); }
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
animate();
