import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { world } from "./world.js";
import { createInitialAgents } from "./agents.js";
import { createSimulation, tick } from "./simulation.js";
import { setMovementTarget, moveAgent } from "./movement.js";

const app = document.querySelector("#app");
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
const agentMeshes = new Map();

function createAgentMesh(agent) {
  const group = new THREE.Group();
  group.position.set(agent.position.x, 0, agent.position.z);
  group.scale.setScalar(1.35);
  group.userData.agentId = agent.id;

  const skin = new THREE.MeshStandardMaterial({ color: 0xe0b08a, roughness: 0.9 });
  const clothing = new THREE.MeshStandardMaterial({
    color: agent.id === "alex" ? 0x345b8c : 0x8c4f34,
    roughness: 0.85
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3c3028, roughness: 0.9 });

  const marker = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.07, 8, 32),
    new THREE.MeshStandardMaterial({
      color: agent.id === "alex" ? 0x4da3ff : 0xffa347,
      emissive: agent.id === "alex" ? 0x123b66 : 0x663000,
      emissiveIntensity: 0.8
    })
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.08;
  marker.userData.agentId = agent.id;
  group.add(marker);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.42), clothing);
  torso.position.y = 1.15;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), skin);
  head.position.y = 1.86;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), dark);
  hair.position.y = 2.02;
  hair.castShadow = true;
  group.add(hair);

  const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.72, 8);
  const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.78, 8);

  const leftArm = new THREE.Mesh(armGeometry, skin);
  leftArm.position.set(-0.47, 1.17, 0);
  leftArm.rotation.z = -0.08;
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeometry, skin);
  rightArm.position.set(0.47, 1.17, 0);
  rightArm.rotation.z = 0.08;
  rightArm.castShadow = true;
  group.add(rightArm);

  const leftLeg = new THREE.Mesh(legGeometry, dark);
  leftLeg.position.set(-0.2, 0.58, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeometry, dark);
  rightLeg.position.set(0.2, 0.58, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.42), dark);
  leftFoot.position.set(-0.2, 0.15, 0.08);
  leftFoot.castShadow = true;
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.42), dark);
  rightFoot.position.set(0.2, 0.15, 0.08);
  rightFoot.castShadow = true;
  group.add(rightFoot);

  return group;
}

for (const agent of agents) {
  const mesh = createAgentMesh(agent);
  agentMeshes.set(agent.id, mesh);
  scene.add(mesh);
}

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

function formatPercent(value) {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function translateActivity(value) {
  const labels = {
    idle: "Sin actividad",
    resting: "Descansando",
    drinking: "Bebiendo",
    eating: "Comiendo",
    fishing: "Pescando",
    gathering: "Recolectando",
    moving: "Desplazándose"
  };
  return labels[value] ?? value;
}

function translateAction(value) {
  const labels = {
    rest: "Descansar",
    drink: "Beber agua",
    eat_plant: "Comer planta",
    catch_fish: "Pescar",
    gather_wood: "Recolectar madera",
    gather_stone: "Recolectar piedra",
    socialize: "Socializar",
    share_knowledge: "Compartir conocimiento",
    explore_plants: "Investigar plantas",
    explore_fishing: "Investigar pesca"
  };
  return labels[value] ?? value;
}

function translateItem(value) {
  const labels = { fish: "pez", wood: "madera", stone: "piedra" };
  return labels[value] ?? value;
}

function translateKnowledgeTopic(value) {
  const labels = {
    "action:rest": "Acción: descansar",
    "action:drink": "Acción: beber agua",
    "action:eat_plant": "Acción: comer planta",
    "action:catch_fish": "Acción: pescar",
    "action:gather_wood": "Acción: recolectar madera",
    "action:gather_stone": "Acción: recolectar piedra",
    "action:socialize": "Acción: socializar",
    "action:share_knowledge": "Acción: compartir conocimiento",
    "action:explore_plants": "Acción: investigar plantas",
    "action:explore_fishing": "Acción: investigar pesca"
  };
  return labels[value] ?? value.replace(/^action:/, "Acción: ");
}

function renderAgentPanel(agent) {
  agentName.textContent = agent.name;
  agentAge.textContent = `Edad: ${agent.age} años · ${agent.alive ? "Vivo" : "Fallecido"}`;
  agentAvatar.style.background = agent.id === "alex" ? "#345b8c" : "#8c4f34";

  const needs = [
    ["Hambre", agent.needs.hunger],
    ["Sed", agent.needs.thirst],
    ["Energía", agent.needs.energy],
    ["Social", agent.needs.social],
    ["Seguridad", agent.needs.safety],
    ["Salud", agent.needs.health]
  ];

  agentStatus.innerHTML = `
    <div class="agentRow"><span>Actividad</span><strong>${translateActivity(agent.currentActivity)}</strong></div>
    <div class="agentRow"><span>Intención actual</span><strong>${agent.currentIntent ? translateAction(agent.currentIntent.name) : "Ninguna"}</strong></div>
    ${needs.map(([label, value]) => `
      <div class="agentRow"><span>${label}</span><strong>${formatPercent(value)}%</strong></div>
      <div class="agentBar"><span style="width:${formatPercent(value)}%"></span></div>
    `).join("")}
  `;

  const decision = agent.decisionSnapshot;
  if (decision?.chosen) {
    const considered = (decision.considered ?? [])
      .map(option => `${translateAction(option.name)} (${Number(option.score).toFixed(2)})`)
      .join(" · ");

    agentDecision.innerHTML = `
      <div class="agentRow"><span>Elección</span><strong>${translateAction(decision.chosen.name)}</strong></div>
      <div class="agentRow"><span>Prioridad</span><strong>${Number(decision.chosen.score).toFixed(2)}</strong></div>
      <div class="agentExperience"><strong>Opciones consideradas:</strong> ${considered || "—"}</div>
    `;
  } else {
    agentDecision.innerHTML = '<div class="agentEmpty">Todavía no hay una decisión registrada.</div>';
  }

  const inventory = agent.inventory ?? [];
  const inventoryTotals = inventory.reduce((totals, item) => {
    const type = item.type;
    const amount = Number(item.amount) || 0;
    totals[type] = (totals[type] ?? 0) + amount;
    return totals;
  }, {});
  const inventoryText = Object.entries(inventoryTotals)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => `${translateItem(type)} × ${amount.toFixed(2)}`)
    .join(", ");

  agentResources.innerHTML = `
    <div class="agentRow"><span>Monedas</span><strong>${agent.money}</strong></div>
    <div class="agentRow"><span>Posición</span><strong>${agent.position.x.toFixed(1)}, ${agent.position.z.toFixed(1)}</strong></div>
    <div class="agentRow"><span>Inventario</span><strong>${inventoryText || "vacío"}</strong></div>
  `;

  const knowledge = agent.knowledge ?? [];
  agentKnowledge.innerHTML = knowledge.length
    ? knowledge.slice(-12).reverse().map(item => `<span class="agentTag">${translateKnowledgeTopic(item.topic)} · ${Math.round(item.confidence * 100)}%</span>`).join("")
    : '<div class="agentEmpty">Todavía no ha adquirido conocimiento del mundo.</div>';

  const relationships = agent.relationships ?? [];
  agentRelationships.innerHTML = relationships.length
    ? relationships.map(rel => {
        const other = agents.find(item => item.id === rel.agentId);
        const name = other?.name ?? rel.agentId;
        return `<div class="agentRow"><span>${name}</span><strong>confianza ${Math.round(rel.trust * 100)}% · familiaridad ${Math.round(rel.familiarity * 100)}%</strong></div>`;
      }).join("")
    : '<div class="agentEmpty">Aún no tiene relaciones registradas.</div>';

  const experiences = agent.experiences ?? [];
  agentExperiences.innerHTML = experiences.length
    ? experiences.slice(-8).reverse().map(exp => `<div class="agentExperience"><strong>Día ${exp.day ?? "—"}</strong> · ${exp.description}</div>`).join("")
    : '<div class="agentEmpty">Aún no hay experiencias registradas.</div>';
}

function openAgentPanel(agent) {
  renderAgentPanel(agent);
  agentPanel.classList.add("open");
  agentPanel.setAttribute("aria-hidden", "false");
}

function closePanel() {
  agentPanel.classList.remove("open");
  agentPanel.setAttribute("aria-hidden", "true");
}

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

function pointerDistance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function pointerAngle(a, b) {
  return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
}

renderer.domElement.addEventListener("pointerdown", e => {
  if (activePointers.size === 0) pointerStart = { x: e.clientX, y: e.clientY };
  activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

  if (activePointers.size === 1) {
    dragging = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  } else if (activePointers.size === 2) {
    dragging = false;
    const points = [...activePointers.values()];
    pinchDistance = pointerDistance(points[0], points[1]);
    pinchAngle = pointerAngle(points[0], points[1]);
  }

  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener("pointermove", e => {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

  if (activePointers.size === 2) {
    const points = [...activePointers.values()];
    const distance = pointerDistance(points[0], points[1]);
    const angle = pointerAngle(points[0], points[1]);

    if (pinchDistance !== null) {
      const zoomChange = pinchDistance - distance;
      cameraDistance = Math.max(10, Math.min(65, cameraDistance + zoomChange * 0.055));
    }

    if (pinchAngle !== null) {
      let angleChange = angle - pinchAngle;
      if (angleChange > Math.PI) angleChange -= Math.PI * 2;
      if (angleChange < -Math.PI) angleChange += Math.PI * 2;
      cameraYaw += angleChange;
    }

    pinchDistance = distance;
    pinchAngle = angle;
    return;
  }

  if (!dragging) return;

  const dx = e.clientX - lastPointerX;
  const dy = e.clientY - lastPointerY;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;

  const sensitivity = 0.075;
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
  const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));

  cameraTarget.addScaledVector(right, -dx * sensitivity);
  cameraTarget.addScaledVector(forward, -dy * sensitivity);
  cameraTarget.x = Math.max(-38, Math.min(38, cameraTarget.x));
  cameraTarget.z = Math.max(-38, Math.min(38, cameraTarget.z));
});

function endPointer(e) {
  const wasSingleTap = activePointers.size === 1 && pointerStart &&
    Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 10;

  activePointers.delete(e.pointerId);

  if (activePointers.size < 2) {
    pinchDistance = null;
    pinchAngle = null;
  }

  if (activePointers.size === 1) {
    const remaining = [...activePointers.values()][0];
    dragging = true;
    lastPointerX = remaining.clientX;
    lastPointerY = remaining.clientY;
  } else {
    dragging = false;
  }

  if (renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);

  if (wasSingleTap) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects([...agentMeshes.values()], true);
    const hit = hits[0];
    let selectedId = hit?.object?.userData?.agentId ?? null;
    let object = hit?.object;

    while (!selectedId && object?.parent) {
      object = object.parent;
      selectedId = object.userData?.agentId ?? null;
    }

    if (selectedId) {
      const selected = simulation.agents.find(agent => agent.id === selectedId);
      if (selected) openAgentPanel(selected);
    }
  }

  pointerStart = null;
}

renderer.domElement.addEventListener("pointerup", endPointer);
renderer.domElement.addEventListener("pointercancel", endPointer);
renderer.domElement.addEventListener("wheel", e => {
  e.preventDefault();
  cameraDistance = Math.max(10, Math.min(65, cameraDistance + e.deltaY * 0.03));
}, { passive: false });

const buttons = document.querySelectorAll("[data-move]");
buttons.forEach(button => {
  const key = button.dataset.move;
  let holdTimer = null;
  let interval = null;

  const moveOnce = () => {
    const distance = 4;
    if (key === "w") cameraTarget.z += distance;
    if (key === "s") cameraTarget.z -= distance;
    if (key === "d") cameraTarget.x += distance;
    if (key === "a") cameraTarget.x -= distance;
    cameraTarget.x = Math.max(-38, Math.min(38, cameraTarget.x));
    cameraTarget.z = Math.max(-38, Math.min(38, cameraTarget.z));
  };

  const down = e => {
    e.preventDefault();
    e.stopPropagation();
    moveOnce();
    holdTimer = setTimeout(() => {
      interval = setInterval(moveOnce, 100);
    }, 250);
  };

  const up = e => {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(holdTimer);
    clearInterval(interval);
    holdTimer = null;
    interval = null;
  };

  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("pointercancel", up);
  button.addEventListener("pointerleave", up);
  button.addEventListener("contextmenu", e => e.preventDefault());
});

function moveCamera(deltaSeconds) {
  const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
  const direction = new THREE.Vector3();

  if (keys.has("w") || keys.has("arrowup")) direction.add(forward);
  if (keys.has("s") || keys.has("arrowdown")) direction.sub(forward);
  if (keys.has("d") || keys.has("arrowright")) direction.add(right);
  if (keys.has("a") || keys.has("arrowleft")) direction.sub(right);

  if (direction.lengthSq() > 0) {
    direction.normalize();
    cameraTarget.addScaledVector(direction, 18 * deltaSeconds);
    cameraTarget.x = Math.max(-38, Math.min(38, cameraTarget.x));
    cameraTarget.z = Math.max(-38, Math.min(38, cameraTarget.z));
  }

  const horizontal = cameraDistance * Math.cos(cameraPitch);
  camera.position.set(
    cameraTarget.x + Math.sin(cameraYaw) * horizontal,
    cameraTarget.y + cameraDistance * Math.sin(cameraPitch),
    cameraTarget.z + Math.cos(cameraYaw) * horizontal
  );
  camera.lookAt(cameraTarget);
}

let lastSimulationTime = performance.now();
function updateSimulation() {
  const now = performance.now();
  const elapsed = Math.min((now - lastSimulationTime) / 1000, 0.25);
  lastSimulationTime = now;

  tick(simulation, elapsed / 60);

  for (const agent of simulation.agents) {
    if (agent.currentIntent?.target) setMovementTarget(agent, agent.currentIntent.target);
    moveAgent(agent, elapsed);
    const mesh = agentMeshes.get(agent.id);
    if (!mesh) continue;
    mesh.position.set(agent.position.x, 0, agent.position.z);
  }
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  updateSimulation();
  moveCamera(Math.min(clock.getDelta(), 0.05));
  const t = clock.getElapsedTime();
  sun.position.x = Math.sin(t * 0.04) * 18;
  renderer.render(scene, camera);
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

animate();