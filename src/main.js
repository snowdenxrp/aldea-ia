import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const app = document.querySelector("#app");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ec9df);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
camera.position.set(22, 22, 28);
camera.lookAt(0, 0, 0);

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

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 90),
  new THREE.MeshStandardMaterial({ color: 0x6f9b58 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function flatPatch(x, z, w, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({ color, roughness: 1 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.025, z);
  scene.add(mesh);
  return mesh;
}

// River: the first permanent water resource of Lúmina.
const river = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 90),
  new THREE.MeshStandardMaterial({ color: 0x4f9ed1, roughness: 0.25 })
);
river.rotation.x = -Math.PI / 2;
river.position.set(-18, 0.03, 0);
scene.add(river);

// Fertile land: a distinct zone where future crops can be grown.
flatPatch(2, -22, 32, 12, 0x789f52);

// Rocky zone: a future source of stone and minerals.
flatPatch(24, 15, 18, 20, 0x77756d);

// Forest zone: trees are resources, not decoration.
function addTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.32 * scale, 1.8 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x765333 })
  );
  trunk.position.set(x, 0.9 * scale, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.25 * scale, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x3f743e })
  );
  crown.position.set(x, 2.4 * scale, z);
  crown.castShadow = true;
  scene.add(crown);
}

for (const [x, z, s] of [
  [18, -14, 1.2], [25, -9, 1], [16, -3, 1.3], [26, 2, .9],
  [20, 9, 1.1], [29, 13, .9], [12, 16, 1.2], [4, 14, 1],
  [-10, 15, 1.1], [-6, 21, .9], [-13, 7, 1.2], [-5, 10, 1]
]) addTree(x, z, s);

function addHouse(x, z) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.4, 4),
    new THREE.MeshStandardMaterial({ color: 0xc8a27b })
  );
  base.position.y = 1.2;
  base.castShadow = true;
  group.add(base);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.2, 2.4, 4),
    new THREE.MeshStandardMaterial({ color: 0x7c4935 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 3.6;
  roof.castShadow = true;
  group.add(roof);

  group.position.set(x, 0, z);
  scene.add(group);
}

addHouse(-5, -7);
addHouse(4, -6);
addHouse(8, 2);
addHouse(1, 8);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
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
