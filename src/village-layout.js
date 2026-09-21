export function getVillageLayout(){
  const river={centerX:-18,width:10,length:150};
  const bridge={x:-18,z:0,lengthX:14,widthZ:3.8,deckHeight:.55};
  const paths=[
    {name:"bridge-west",x:-24.7,z:0,width:5.4,length:8,rotation:0},
    {name:"bridge-east",x:-11.3,z:0,width:5.4,length:8,rotation:0},
    {name:"north",x:2,z:10,width:4.2,length:20,rotation:0},
    {name:"south",x:2,z:-10,width:4.2,length:22,rotation:0},
    {name:"east",x:14,z:1,width:3.8,length:28,rotation:0},
    {name:"west",x:-5,z:1,width:3.8,length:18,rotation:0},
    {name:"market-link",x:8,z:1,width:3.2,length:10,rotation:0},
    {name:"garden-link",x:-1,z:-8,width:3.1,length:10,rotation:0}
  ];
  const buildings=[
    {type:"house",x:-7,z:-6,rotation:-.18,scale:.98},
    {type:"house",x:2,z:-8,rotation:.05,scale:.94},
    {type:"house",x:11,z:-5,rotation:.2,scale:.96},
    {type:"house",x:16,z:-4,rotation:.45,scale:.9},
    {type:"house",x:14,z:4,rotation:.65,scale:.98},
    {type:"house",x:8,z:10,rotation:.95,scale:.94},
    {type:"house",x:1,z:13,rotation:-.9,scale:.97},
    {type:"house",x:-7,z:7,rotation:-1,scale:.93},
    {type:"house",x:19,z:2,rotation:.2,scale:.86},
    {type:"house",x:18,z:9,rotation:.35,scale:.88},
    {type:"house",x:4,z:-15,rotation:.1,scale:.9},
    {type:"house",x:13,z:-14,rotation:-.2,scale:.88},
    {type:"barn",x:21,z:-10},
    {type:"tower",x:-10,z:9}
  ];
  return {
    river,
    bridge,
    paths,
    plaza:{x:2,z:1,radius:7.6},
    well:{x:2,z:1},
    market:{x:8,z:1},
    garden:{x:-1,z:-13},
    buildings,
    trees:[[-15,-8,1.2],[-13,-4,1],[-12,13,1.35],[17,10,1.1],[20,-7,1.2],[6,-14,.9],[-18,7,1.1],[24,4,1],[24,12,.9],[22,-16,1.1],[9,16,.95],[-4,17,1.1],[28,-2,1.15],[-2,-19,1],[15,-19,.95],[27,8,1]]
  };
}
