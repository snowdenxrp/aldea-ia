import * as THREE from "./three.module.js";

export function createTerrainMaterial(base=0x6f9b58){
  const size=128;
  const data=new Uint8Array(size*size*4);
  const c=new THREE.Color(base);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const coarse=Math.sin(x*.19+y*.11)*8+Math.sin(x*.047-y*.071)*7;
    const fine=((x*17+y*31+(x*y*7))%37)-18;
    const n=coarse+fine*.55;
    const patch=((Math.sin(x*.055)*Math.cos(y*.043)+1)*.5);
    data[i]=Math.max(0,Math.min(255,Math.round(c.r*255+n+patch*7)));
    data[i+1]=Math.max(0,Math.min(255,Math.round(c.g*255+n+patch*10)));
    data[i+2]=Math.max(0,Math.min(255,Math.round(c.b*255+n*.72+patch*3)));
    data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat,THREE.UnsignedByteType);
  texture.wrapS=THREE.RepeatWrapping;
  texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(11,11);
  texture.anisotropy=4;
  texture.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map:texture,roughness:.96,metalness:0});
}
