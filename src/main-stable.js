import THREE from "./three-remote.js";
import { world } from "./world.js";
import { createInitialAgents } from "./agents.js";
import { createSimulation, tick } from "./simulation.js";
import { setMovementTarget, moveAgent } from "./movement.js";
import { getRegionForPosition, getBiomeForRegion, normalizeSpatialWorld } from "./spatial.js";
import { buildVillage } from "./village.js";

const app=document.querySelector("#app"), worldTime=document.querySelector("#worldTime");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9ec9df); scene.fog=new THREE.Fog(0x9ec9df,55,150);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.domElement.style.touchAction="none"; renderer.domElement.style.userSelect="none"; app.appendChild(renderer.domElement);
const light=new THREE.DirectionalLight(0xffffff,2.2); light.position.set(12,25,10); light.castShadow=true; light.shadow.mapSize.set(2048,2048); scene.add(light,new THREE.HemisphereLight(0xbfe7ff,0x6f8f58,1.2));
normalizeSpatialWorld(world);
const homeRegion=getRegionForPosition({x:0,z:0},world);
const homeBiome=getBiomeForRegion(homeRegion,world);
const biomeGroundColors={forest:0x587f4a,plains:0x6f9b58,mountain:0x77715f,wetland:0x5f8a70,arid:0x9a8557};
const ground=new THREE.Mesh(new THREE.PlaneGeometry(150,150,24,24),new THREE.MeshStandardMaterial({color:biomeGroundColors[homeBiome.type]??biomeGroundColors.plains,roughness:1})); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
