export function getVillageLayout(){
  const river={centerX:-18,width:10,length:150};
  const bridge={x:-18,z:0,lengthX:14,widthZ:3.8,deckHeight:.55};

  // Red de caminos deliberadamente separada de las fachadas:
  // los edificios se colocan en "bolsas" residenciales a ambos lados.
  const paths=[
    {name:"bridge-west",x:-24.8,z:0,width:4.2,length:8,rotation:0},
    {name:"bridge-east",x:-11.2,z:0,width:4.2,length:8,rotation:0},
    {name:"north",x:3,z:10.8,width:3.2,length:23,rotation:0},
    {name:"south",x:0,z:-10.8,width:2.2,length:23,rotation:0},
    {name:"east",x:15.2,z:1,width:3.1,length:29,rotation:0},
    {name:"west",x:-5.8,z:1,width:3.1,length:18,rotation:0},
    {name:"market-link",x:8.7,z:1,width:2.8,length:9,rotation:0},
    {name:"garden-link",x:-1.2,z:-8.4,width:2.8,length:9,rotation:0}
  ];

  // Escala residencial más abierta: cada casa tiene aire alrededor y
  // ninguna se coloca directamente sobre un camino principal.
  const buildings=[
    // Anillo residencial norte: fachadas hacia calles, no sobre ellas.
    {type:"house",x:-7.5,z:9.0,rotation:-.25,scale:1.04},
    {type:"house",x:1.0,z:15.0,rotation:-.05,scale:1.02},
    {type:"house",x:10.5,z:13.8,rotation:.18,scale:1.06},
    {type:"house",x:19.5,z:10.5,rotation:.38,scale:1.03},
    {type:"house",x:26.5,z:6.5,rotation:.52,scale:1.00},

    // Anillo residencial sur: separado del eje central y con patios entre casas.
    {type:"house",x:-8.5,z:-7.2,rotation:-.35,scale:1.03},
    {type:"house",x:2.8,z:-6.2,rotation:.05,scale:1.00},
    {type:"house",x:13.0,z:-7.0,rotation:.25,scale:1.05},
    {type:"house",x:21.5,z:-5.5,rotation:.45,scale:1.02},
    {type:"house",x:28.0,z:-1.5,rotation:.58,scale:1.00},
    {type:"house",x:7.5,z:-17.0,rotation:.10,scale:1.04},
    {type:"house",x:18.5,z:-16.0,rotation:-.18,scale:1.02},

    // Edificios públicos/productivos en el borde.
    {type:"barn",x:25,z:-12},
    {type:"tower",x:-10,z:15}
  ];

  return {
    river,
    bridge,
    paths,
    plaza:{x:3,z:1,radius:7.0},
    well:{x:3,z:1},
    market:{x:9,z:1},
    garden:{x:-1,z:-14},
    buildings,
    trees:[
      [-15,-9,2.0],[-13,-3,1.75],[-13,17,2.15],[18,17,1.9],[25,-8,2.0],
      [7,-18,1.65],[-19,8,1.9],[30,4,2.0],[31,15,1.75],[25,-19,2.0],
      [8,20,1.8],[-3,22,2.0],[31,-2,1.95],[-3,-22,1.8],[18,-21,1.75],
      [33,9,1.8],[-21,-17,1.9],[-20,18,1.8]
    ]
  };
}
