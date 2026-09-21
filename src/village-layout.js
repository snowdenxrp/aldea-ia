export function getVillageLayout(){
  const river={centerX:-18,width:10,length:150};
  const bridge={x:-18,z:0,lengthX:14,widthZ:3.8,deckHeight:.55};

  // La aldea crece a ambos lados del río. La ribera oeste es un barrio
  // pequeño y productivo; la este concentra plaza, mercado y viviendas.
  const paths=[
    {name:"bridge-west",x:-24.8,z:0,width:4.2,length:8,rotation:0},
    {name:"bridge-east",x:-11.2,z:0,width:4.2,length:8,rotation:0},

    // Ribera oeste
    {name:"west-main",x:-30,z:0,width:3.0,length:30,rotation:0},
    {name:"west-north",x:-30,z:13,width:22,length:2.8,rotation:0},
    {name:"west-south",x:-30,z:-13,width:22,length:2.8,rotation:0},

    // Ribera este
    {name:"residential-north",x:10,z:12,width:42,length:3.2,rotation:0},
    {name:"residential-south",x:10,z:-12,width:42,length:3.2,rotation:0},
    {name:"main-axis",x:10,z:0,width:3.2,length:25,rotation:0},
    {name:"market-link",x:4,z:0,width:2.6,length:10,rotation:0},
    {name:"garden-link",x:1,z:-18,width:2.6,length:10,rotation:0}
  ];

  const buildings=[
    // Barrio oeste: casas escalonadas, no una cuadrícula rígida.
    {type:"house",x:-36,z:15,rotation:Math.PI/2,scale:1.04},
    {type:"house",x:-27,z:15,rotation:Math.PI/2,scale:1.00},
    {type:"house",x:-36,z:-15,rotation:-Math.PI/2,scale:1.02},
    {type:"house",x:-27,z:-15,rotation:-Math.PI/2,scale:1.06},
    {type:"tower",x:-31,z:7},

    // Ribera este: dos calles residenciales con patios.
    {type:"house",x:-4,z:16.5,rotation:Math.PI,scale:1.04},
    {type:"house",x:5,z:16.5,rotation:Math.PI,scale:1.02},
    {type:"house",x:14,z:16.5,rotation:Math.PI,scale:1.06},
    {type:"house",x:23,z:16.5,rotation:Math.PI,scale:1.03},
    {type:"house",x:32,z:16.5,rotation:Math.PI,scale:1.00},

    {type:"house",x:-4,z:-16.5,rotation:0,scale:1.04},
    {type:"house",x:5,z:-16.5,rotation:0,scale:1.00},
    {type:"house",x:14,z:-16.5,rotation:0,scale:1.05},
    {type:"house",x:23,z:-16.5,rotation:0,scale:1.02},
    {type:"house",x:32,z:-16.5,rotation:0,scale:1.00},

    {type:"barn",x:30,z:-5},
  ];

  return {
    river,
    bridge,
    paths,
    plaza:{x:5,z:0,radius:7.0},
    well:{x:5,z:0},
    market:{x:12,z:0},
    garden:{x:0,z:-22},
    buildings,
    trees:[
      [-39,9,2.0],[-40,-8,1.8],[-34,22,1.9],[-24,23,2.1],
      [-39,-22,1.9],[-23,-22,2.0],[-14,19,1.8],[-14,-20,1.8],
      [2,24,2.0],[17,24,1.9],[29,24,2.1],[37,8,2.0],
      [38,-10,1.9],[30,-24,2.0],[15,-24,1.8],[0,-25,1.8],
      [-22,8,1.9],[-22,-8,1.8],[-34,0,1.7],[36,18,1.8]
    ]
  };
}
