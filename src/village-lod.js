const DETAIL_RANK={far:1,medium:2,close:3};

export function getVillageDetailLevel(distance){
  const d=Number(distance);
  if(!Number.isFinite(d)||d<24)return "close";
  if(d<65)return "medium";
  return "far";
}

export function applyVillageDetailLevel(root,level){
  const wanted=level||"medium";
  const rank=DETAIL_RANK[wanted]??DETAIL_RANK.medium;
  root.traverse?.(node=>{
    const detail=node.userData?.detailLevel;
    if(!detail)return;
    node.visible=(DETAIL_RANK[detail]??DETAIL_RANK.far)<=rank;
  });
  root.userData.lodLevel=wanted;
  return wanted;
}
