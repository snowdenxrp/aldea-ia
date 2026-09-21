import * as THREE from "./three.module.js";

export function createVillageMaterials(){
  const mat=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  return {
    ground:mat(0x6f9b58,1),
    soil:mat(0x795331,1),
    wood:mat(0x69462f,.9),
    stone:mat(0x817a70,.95),
    roof:mat(0x70452f,.82),
    water:mat(0x4f9ed1,.18,.08),
    foliage:mat(0x4f7f43,.92)
  };
}
