export function getVillageDetailLevel(distance){
  const d=Number(distance);
  if(!Number.isFinite(d)||d<24)return "close";
  if(d<65)return "medium";
  return "far";
}

export function applyVillageDetailLevel(root,level){
  const wanted=level||"medium";
  root.traverse?.(node=>{
    if(!node.userData?.detailLevel)return;
    node.visible=node.userData.detailLevel===wanted;
  });
  return wanted;
}
