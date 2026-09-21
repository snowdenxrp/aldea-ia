export function getVillageLayout(){
  const river={centerX:-18,width:10,length:150};
  const bridge={x:-18,z:0,lengthX:12.5,widthZ:3.4,deckHeight:.55};
  const paths=[
    {name:"bridge-west",x:-24.5,z:0,width:5.2,length:7,rotation:0},
    {name:"bridge-east",x:-11.5,z:0,width:5.2,length:7,rotation:0},
    {name:"north",x:2,z:9,width:4.4,length:16,rotation:0},
    {name:"south",x:2,z:-9,width:4.4,length:18,rotation:0},
    {name:"east",x:13,z:1,width:22,length:3.8,rotation:0},
    {name:"west",x:-8,z:1,width:16,length:3.8,rotation:0}
  ];
  const buildings=[
    {type:"house",x:-7,z:-6,rotation:-.18,scale:.98},
    {type:"house",x:2,z:-8,rotation:.05,scale:.94},
    {type:"house",x:11,z:-5,rotation:.2,scale:.96},
    {type:"house",x:14,z:4,rotation:.65,scale:.98},
    {type:"house",x:8,z:10,rotation:.95,scale:.94},
    {type:"house",x:-2,z:11,rotation:-.9,scale:.97},
    {type:"house",x:-9,z:6,rotation:-1,scale:.93},
    {type:"house",x:18,z:0,rotation:.2,scale:.86},
    {type:"barn",x:15,z:-11},
    {type:"tower",x:-14,z:9}
  ];
  return {
    river,
    bridge,
    paths,
    plaza:{x:2,z:1,radius:7.2},
    well:{x:2,z:1},
    market:{x:8,z:1},
    garden:{x:-1,z:-13},
    buildings,
    trees:[[-15,-8,1.2],[-13,-4,1],[-12,13,1.35],[17,10,1.1],[20,-7,1.2],[6,-14,.9],[-18,7,1.1],[24,4,1]]
  };
}
