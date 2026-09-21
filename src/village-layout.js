export function getVillageLayout(){
  const river={centerX:-18,width:10,length:150};
  const bridge={x:-18,z:0,lengthX:14,widthZ:3.8,deckHeight:.55};

  // Aldea organizada por calles: plaza central libre, dos calles residenciales
  // paralelas y un eje de conexión. Las casas forman filas con patios y
  // fachadas orientadas hacia la calle, en vez de quedar desperdigadas.
  const paths=[
    {name:"bridge-west",x:-24.8,z:0,width:4.2,length:8,rotation:0},
    {name:"bridge-east",x:-11.2,z:0,width:4.2,length:8,rotation:0},
    {name:"residential-north",x:12,z:11.8,width:35,length:3.2,rotation:0},
    {name:"residential-south",x:12,z:-11.8,width:35,length:3.2,rotation:0},
    {name:"main-axis",x:12,z:0,width:3.2,length:26,rotation:0},
    {name:"west-link",x:-5.8,z:0,width:3.1,length:18,rotation:0},
    {name:"market-link",x:8,z:0,width:2.6,length:12,rotation:0},
    {name:"garden-link",x:1,z:-17,width:2.6,length:10,rotation:0}
  ];

  const buildings=[
    // Fila norte: misma separación, patios traseros y acceso a la calle.
    {type:"house",x:-4.5,z:16.3,rotation:Math.PI,scale:1.04},
    {type:"house",x:4.5,z:16.3,rotation:Math.PI,scale:1.02},
    {type:"house",x:13.5,z:16.3,rotation:Math.PI,scale:1.06},
    {type:"house",x:22.5,z:16.3,rotation:Math.PI,scale:1.03},
    {type:"house",x:31.0,z:16.3,rotation:Math.PI,scale:1.00},

    // Fila sur: espejo visual con suficiente espacio entre viviendas.
    {type:"house",x:-4.5,z:-16.3,rotation:Math.PI,scale:1.04},
    {type:"house",x:4.5,z:-16.3,rotation:Math.PI,scale:1.00},
    {type:"house",x:13.5,z:-16.3,rotation:Math.PI,scale:1.05},
    {type:"house",x:22.5,z:-16.3,rotation:Math.PI,scale:1.02},
    {type:"house",x:31.0,z:-16.3,rotation:Math.PI,scale:1.00},

    // Edificios de referencia fuera de las filas residenciales.
    {type:"tower",x:-9,z:17},
    {type:"barn",x:29,z:-5.5}
  ];

  return {
    river,
    bridge,
    paths,
    plaza:{x:3,z:1,radius:7.0},
    well:{x:3,z:1},
    market:{x:9,z:2},
    garden:{x:0,z:-21},
    buildings,
    trees:[
      [-15,-9,2.0],[-13,-3,1.75],[-13,24,2.15],[18,23,1.9],[28,-9,2.0],
      [7,-24,1.65],[-20,8,1.9],[34,5,2.0],[33,24,1.75],[25,-24,2.0],
      [8,25,1.8],[-2,25,2.0],[34,-1,1.95],[-8,-25,1.8],[18,-25,1.75],
      [33,10,1.8],[-21,-17,1.9],[-20,22,1.8]
    ]
  };
}
