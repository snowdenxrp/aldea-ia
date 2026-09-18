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

// Primer vínculo entre simulación y representación 3D.
const agents = createInitialAgents();
const simulation = createSimulation(world, agents);
const agentMeshes = new Map();

function createAgentMesh(agent) {
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.1, 4, 8), new THREE.MeshStandardMaterial({ color: agent.id === "alex" ? 0x345b8c : 0x8c4f34 }));
  body.position.set(agent.position.x, 1.15, agent.position.z);
  body.castShadow = true;
  scene.add(body);
  return body;
}

for (const agent of agents) agentMeshes.set(agent.id, createAgentMesh(agent));

// Controles del observador estilo mapa:
// 1 dedo = agarrar y desplazar el mundo.
// 2 dedos = pellizcar para zoom.
// No se usa el gesto de 1 dedo para rotar, para que el desplazamiento sea natural en móvil.
const keys = new Set();
addEventListener("keydown", e => keys.add(e.key.toLowerCase()));
addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

let dragging = false;
let lastPointerX = 0;
let lastPointerY = 0;
let pinchDistance = null;
const activePointers = new Map();

function pointerDistance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

renderer.domElement.addEventListener("pointerdown", e => {
  activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

  if (activePointers.size === 1) {
    dragging = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  } else if (activePointers.size === 2) {
    dragging = false;
    const points = [...activePointers.values()];
    pinchDistance = pointerDistance(points[0], points[1]);
  }

  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener("pointermove", e => {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

  if (activePointers.size === 2) {
    const points = [...activePointers.values()];
    const distance = pointerDistance(points[0], points[1]);

    if (pinchDistance !== null) {
      const zoomChange = pinchDistance - distance;
      cameraDistance = Math.max(10, Math.min(65, cameraDistance + zoomChange * 0.055));
    }

    pinchDistance = distance;
    return;
  }

  if (!dragging) return;

  // El mundo se mueve en la misma dirección que el dedo,
  // como cuando se arrastra un mapa físico.
  const dx = e.clientX - lastPointerX;
  const dy = e.clientY - lastPointerY;
  lastPointerX = e.clientX;
  lastPointerY = e.clientY;

  const sensitivity = 0.055;
  const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
  const forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));

  cameraTarget.addScaledVector(right, -dx * sensitivity);
  cameraTarget.addScaledVector(forward, -dy * sensitivity);

  cameraTarget.x = Math.max(-38, Math.min(38, cameraTarget.x));
  cameraTarget.z = Math.max(-38, Math.min(38, cameraTarget.z));
});

function endPointer(e) {
  activePointers.delete(e.pointerId);

  if (activePointers.size < 2) pinchDistance = null;

  if (activePointers.size === 1) {
    const remaining = [...activePointers.values()][0];
    dragging = true;
    lastPointerX = remaining.clientX;
    lastPointerY = remaining.clientY;
  } else {
    dragging = false;
  }

  if (renderer.domElement.hasPointerCapture(e.pointerId)) {
    renderer.domElement.releasePointerCapture(e.pointerId);
  }
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

  // Por ahora: 1 hora simulada cada 60 segundos reales.
  tick(simulation, elapsed / 60);

  for (const agent of simulation.agents) {
    if (agent.currentIntent?.target) setMovementTarget(agent, agent.currentIntent.target);
    moveAgent(agent, elapsed);
    const mesh = agentMeshes.get(agent.id);
    if (!mesh) continue;
    mesh.position.set(agent.position.x, 1.15, agent.position.z);
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
