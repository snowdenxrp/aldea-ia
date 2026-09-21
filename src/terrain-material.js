import * as THREE from "./three.module.js";

function hash(x,y){
  let n=(x*374761393+y*668265263)|0;
  n=(n^(n>>>13))*1274126177;
  return ((n^(n>>>16))>>>0)/4294967295;
}
function smooth(t){return t*t*(3-2*t);}
function noise(x,y){
  const x0=Math.floor(x),y0=Math.floor(y),fx=smooth(x-x0),fy=smooth(y-y0);
  const a=hash(x0,y0),b=hash(x0+1,y0),c=hash(x0,y0+1),d=hash(x0+1,y0+1);
  return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;
}

export function createTerrainMaterial(base=0x6f9b58){
  const size=256;
  const data=new Uint8Array(size*size*4);
  const c=new THREE.Color(base);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const u=x/size,v=y/size;
    const broad=noise(u*7.5,v*7.5);
    const medium=noise(u*22+11.3,v*22+4.7);
    const fine=noise(u*65+3.1,v*65+17.8);
    const variation=(broad-.5)*25+(medium-.5)*13+(fine-.5)*5;
    const greenLift=(broad-.5)*8+(medium-.5)*4;
    data[i]=Math.max(0,Math.min(255,Math.round(c.r*255+variation*.72)));
    data[i+1]=Math.max(0,Math.min(255,Math.round(c.g*255+variation+greenLift)));
    data[i+2]=Math.max(0,Math.min(255,Math.round(c.b*255+variation*.45)));
    data[i+3]=255;
  }
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat,THREE.UnsignedByteType);
  texture.wrapS=THREE.ClampToEdgeWrapping;
  texture.wrapT=THREE.ClampToEdgeWrapping;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.magFilter=THREE.LinearFilter;
  texture.anisotropy=4;
  texture.needsUpdate=true;
  return new THREE.MeshStandardMaterial({map:texture,roughness:.97,metalness:0});
}
