import * as THREE from "./three.module.js";

export function createTerrainMaterial(base=0x6f9b58){
  const size=32;
  const data=new Uint8Array(size*size*4);
  const c=new THREE.Color(base);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const n=((x*17+y*31+(x*y*7))%29)-14;
    data[i]=Math.max(0,Math.min(255,Math.round(c.r*255+n)));
    data[i+1]=Math.max(0,Math.min(255,Math.round(c.g*255+n)));
    data[i+2]=Math.max(0,Math.min(255,Math.round(c.b*255+n*.7)));
    data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat,THREE.UnsignedByteType);
  texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(18,18);texture.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map:texture,roughness:1});
}
