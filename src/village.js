import * as THREE from "./three.module.js";
import { getVillageLayout } from "./village-layout.js";
import { createTerrainMaterial } from "./terrain-material.js";

const M=(c,r=.82,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const meshBox=(w,h,d,c,r=.82)=>new THREE.Mesh(B(w,h,d),M(c,r));
const C=(a,b,h,c,s=10)=>new THREE.Mesh(new THREE.CylinderGeometry(a,b,h,s),M(c));
function add(g,scene){g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g);return g;}
function path(scene,x,z,w,d,r=0){const m=meshBox(w,.045,d,0xb59a72,1);m.position.set(x,.025,z);m.rotation.y=r;m.receiveShadow=true;scene.add(m);}
function terrainPatch(scene,x,z,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),createTerrainMaterial(0x6f9b58));m.rotation.x=-Math.PI/2;m.position.set(x,.006,z);m.receiveShadow=true;scene.add(m);}
function house(scene,x,z,r=0,s=1){
 const g=new THREE.Group();
 const foundation=meshBox(3.25,.22,2.95,0x8c735e);foundation.position.y=.11;
 const wall=meshBox(3,2,2.7,0xc99868,.92);wall.position.y=1.15;
 const roof=new THREE.Mesh(new THREE.ConeGeometry(2.18,1.35,4),M(0x70452f,.8));roof.position.y=2.82;roof.rotation.y=Math.PI/4;
 const eave=meshBox(3.35,.13,2.95,0x5f3e2b);eave.position.y=2.18;
 const door=meshBox(.58,1.12,.1,0x543522);door.position.set(0,.67,1.38);
 const step=meshBox(.8,.14,.42,0x8b765e);step.position.set(0,.18,1.48);
 const knob=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),M(0xd2ad68));knob.position.set(.2,.7,1.45);
 g.add(foundation,wall,roof,eave,door,step,knob);
 for(const sx of [-.92,.92]){const w=meshBox(.55,.52,.07,0x7fb7c7,.35);w.position.set(sx,1.35,1.38);const v=meshBox(.045,.52,.08,0x593a28);v.position.set(sx,1.35,1.43);const h=meshBox(.55,.045,.08,0x593a28);h.position.set(sx,1.35,1.43);g.add(w,v,h);}
 const chim=meshBox(.32,.72,.32,0x654235);chim.position.set(.82,3.15,-.35);g.add(chim);
 g.position.set(x,0,z);g.rotation.y=r;g.scale.setScalar(s);return add(g,scene);
}
function lamp(scene,x,z){const g=new THREE.Group(),p=C(.055,.075,1.65,0x4b382c,8),a=meshBox(.48,.06,.06,0x4b382c),l=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),new THREE.MeshBasicMaterial({color:0xffd783}));p.position.y=.82;a.position.set(.2,1.56,0);l.position.set(.43,1.43,0);const glow=new THREE.PointLight(0xffd08a,.75,9,2);glow.position.set(.43,1.35,0);g.add(p,a,l,glow);g.position.set(x,0,z);scene.add(g);}
function well(scene,x,z){const g=new THREE.Group();for(let i=0;i<12;i++){const a=i*Math.PI*2/12,s=C(.34,.34,.28,0x817a70,8);s.position.set(Math.cos(a)*.85,.14,Math.sin(a)*.85);g.add(s)}for(const px of [-.78,.78]){const p=meshBox(.12,1.75,.12,0x5a3c2a);p.position.set(px,.9,0);g.add(p)}const beam=meshBox(1.75,.13,.13,0x5a3c2a);beam.position.y=1.68;const roof=new THREE.Mesh(new THREE.ConeGeometry(1.18,.7,4),M(0x74452f));roof.rotation.y=Math.PI/4;roof.position.y=2.05;g.add(beam,roof);g.position.set(x,0,z);return add(g,scene);}
function market(scene,x,z){const g=new THREE.Group();for(const sx of [-1.5,1.5]){const p=meshBox(.12,1.9,.12,0x5d3e29);p.position.set(sx,.95,0);g.add(p)}const top=meshBox(3.35,.12,1.65,0x8f5e3c);top.position.y=.76;const roof=meshBox(3.55,.12,1.85,0xb36d4a);roof.position.y=2;g.add(top,roof);for(let i=0;i<4;i++){const q=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),M([0x8b5a32,0xc78f3e,0x6f8f45,0xd1a14c][i]));q.position.set(-.95+i*.65,.95,.2);g.add(q)}g.position.set(x,0,z);return add(g,scene);}
function garden(scene,x,z){const g=new THREE.Group(),soil=meshBox(4,.08,2.7,0x795331,1);soil.position.y=.04;g.add(soil);for(let px=-1.5;px<=1.5;px+=.75)for(let pz=-.9;pz<=.9;pz+=.65){const s=C(.035,.045,.3,0x4f7d38,6);s.position.set(px,.23,pz);const l=new THREE.Mesh(new THREE.SphereGeometry(.11,7,5),M(0x609044));l.scale.y=.65;l.position.set(px+.05,.43,pz);g.add(s,l)}g.position.set(x,0,z);return add(g,scene);}
function bridge(scene,x,z){
 const g=new THREE.Group();
 const deck=meshBox(12.5,.28,3.4,0x765238,.82);deck.position.y=.55;g.add(deck);
 const beam=meshBox(12.8,.22,.28,0x563a27);beam.position.set(0,.38,0);g.add(beam);
 for(const sx of [-5.4,-3.6,-1.8,0,1.8,3.6,5.4])for(const sz of [-1.45,1.45]){const p=meshBox(.14,1.05,.14,0x553a29);p.position.set(sx,.98,sz);g.add(p)}
 for(const sz of [-1.45,1.45]){const r=meshBox(11.7,.12,.12,0x553a29);r.position.set(0,1.42,sz);g.add(r);for(const sx of [-5.4,-3.6,-1.8,0,1.8,3.6,5.4]){const d=meshBox(.09,.58,.09,0x60402b);d.position.set(sx,1.15,sz);g.add(d)}}
 for(const sx of [-6.1,6.1])for(const sz of [-1.45,1.45]){const cap=C(.2,.2,.16,0x65452f,8);cap.position.set(sx,.72,sz);g.add(cap)}
 g.position.set(x,0,z);return add(g,scene);
}
function tree(scene,x,z,s=1){const g=new THREE.Group();const trunk=C(.16,.22,1.5,0x68452f,8);trunk.position.y=.75;const crown=new THREE.Mesh(new THREE.SphereGeometry(1.05,12,9),M(0x4f7f43,.92));crown.position.y=1.75;crown.scale.set(1.05,.92,1.05);g.add(trunk,crown);g.position.set(x,0,z);g.scale.setScalar(s);return add(g,scene);}
function barn(scene,x,z){const g=new THREE.Group();const w=meshBox(4,2.5,3.2,0xa96f45);w.position.y=1.25;const r=new THREE.Mesh(new THREE.ConeGeometry(2.8,1.6,4),M(0x623b2c));r.rotation.y=Math.PI/4;r.position.y=3.3;const d=meshBox(1.2,1.8,.12,0x4b3025);d.position.set(0,.9,1.62);g.add(w,r,d);g.position.set(x,0,z);return add(g,scene);}
function tower(scene,x,z){const g=new THREE.Group(),b=C(.9,1.1,5,0x8d7966,10);b.position.y=2.5;const r=new THREE.Mesh(new THREE.ConeGeometry(1.25,1.1,8),M(0x56392d));r.position.y=5.55;g.add(b,r);g.position.set(x,0,z);return add(g,scene);}
function bank(scene,x,z,w,d){const m=meshBox(w,.12,d,0x8e7657,1);m.position.set(x,.06,z);m.rotation.y=.02;scene.add(m);for(let i=0;i<Math.max(4,Math.floor(w*d/12));i++){const a=i*2.41;const t=C(.035,.05,.22,0x638d4c,6);t.position.set(x+Math.cos(a)*(w*.42),.18,z+Math.sin(a)*(d*.42));scene.add(t);}}

export function buildVillage(scene){
 const layout=getVillageLayout();
 const root=new THREE.Group();root.name="LuminaVillageVisual";scene.add(root);
 // Textura procedural local: no depende de imágenes externas y mantiene detalle al acercar la cámara.
 terrainPatch(root, -28.5, 0, 11, 150);terrainPatch(root, 8.5, 0, 43, 150);
 const plaza=new THREE.Mesh(new THREE.CircleGeometry(layout.plaza.radius,40),M(0xb8a27e,1));plaza.rotation.x=-Math.PI/2;plaza.position.set(layout.plaza.x,.035,layout.plaza.z);root.add(plaza);
 for(const p of layout.paths)path(root,p.x,p.z,p.width,p.length,p.rotation);
 bank(root,-23.2,-10,2.4,22);bank(root,-23.2,11,2.4,22);bank(root,-12.8,-10,2.4,22);bank(root,-12.8,11,2.4,22);
 for(const b of layout.buildings){if(b.type==="house")house(root,b.x,b.z,b.rotation,b.scale);else if(b.type==="barn")barn(root,b.x,b.z);else if(b.type==="tower")tower(root,b.x,b.z);}
 well(root,layout.well.x,layout.well.z);market(root,layout.market.x,layout.market.z);garden(root,layout.garden.x,layout.garden.z);bridge(root,layout.bridge.x,layout.bridge.z);
 for(const p of layout.trees)tree(root,p[0],p[1],p[2]);
 for(const p of [[-4,1],[7,1],[2,-7],[2,9],[12,5],[-7,4],[-15,0],[-11,0]])lamp(root,p[0],p[1]);
 for(const z of [-3.4,5.4])for(const x of [-4.8,-3.6,10.8,12]){const p=meshBox(.09,.52,.09,0x69462f);p.position.set(x,.26,z);root.add(p);}
 const fire=new THREE.Mesh(new THREE.ConeGeometry(.28,.85,8),new THREE.MeshBasicMaterial({color:0xffa83d,transparent:true,opacity:.9}));fire.position.set(2,.55,7.1);root.add(fire);
 const sign=meshBox(1.8,.5,.12,0x6b4a31);sign.position.set(2,2.8,-6.2);root.add(sign);
 root.traverse(o=>{if(o.isMesh)o.receiveShadow=true});return root;
}
