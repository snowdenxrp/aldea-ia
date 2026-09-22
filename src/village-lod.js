export function getVillageDetailLevel(distance){
  const d=Number(distance);
  if(!Number.isFinite(d)||d<24)return "close";
  if(d<65)return "medium";
  return "far";
}
export function applyVillageDetailLevel(root,level){
  const wanted=level||"medium";
  const rank={far:0,medium:1,close:2};
  root.traverse?.(node=>{
    const dl=node.userData?.detailLevel;
    if(!dl)return;
    // Cada nivel mantiene una silueta útil; al acercarse se añaden piezas de mayor detalle.
    node.visible=(rank[dl]??1)<=(rank[wanted]??1);
  });
  return wanted;
}
