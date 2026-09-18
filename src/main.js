import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const app = document.querySelector("#app");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ec9df);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 500);
camera.position.set(18, 18, 24);
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
  new THREE.PlaneGeometry(70, 70),
  new THREE.MeshStandardMaterial({ color: 0x6f9b58 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const river = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 70),
  new THREE.MeshStandardMaterial({ color: 0x4f9ed1, roughness: 0.25, metalness: 0.05 })
);
river.rotation.x = -Math.PI / 2;
river.position.y = 0.02;
river.position.x = -14;
scene.add(river);

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
  [14, -12, 1.2], [18, -7, 1], [15, 1, 1.3], [20, 7, .9],
  [-19, -13, 1.1], [-21, -5, .9], [-18, 10, 1.2], [12, 14, 1]
]) addTree(x, z, s);

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
