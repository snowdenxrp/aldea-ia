// Lúmina visual audit receiver for Cloudflare Pages Functions.
// Required environment variable: GITHUB_TOKEN
// Recommended token permission: Contents -> Read and write, only for this repository.
const REPO = "snowdenxrp/aldea-ia";
const BRANCH = "main";

function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});}
function stamp(date=new Date()){
  return date.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z").replace("T","-");
}
async function github(path,init={},token){
  const res=await fetch("https://api.github.com"+path,{
    ...init,
    headers:{
      "Accept":"application/vnd.github+json",
      "Authorization":"Bearer "+token,
      "X-GitHub-Api-Version":"2022-11-28",
      "User-Agent":"lumina-visual-audit",
      ...(init.headers||{})
    }
  });
  const text=await res.text();
  let data; try{data=JSON.parse(text);}catch{data={message:text};}
  if(!res.ok)throw new Error("GitHub "+res.status+": "+(data.message||text));
  return data;
}
function toBase64(bytes){
  let out="";
  const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk)out+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)));
  return btoa(out);
}
export async function onRequestPost({request,env}){
  if(!env.GITHUB_TOKEN)return json({ok:false,error:"GITHUB_TOKEN no configurado"},500);
  const form=await request.formData();
  const image=form.get("image");
  const metadataText=String(form.get("metadata")||"{}");
  if(!(image instanceof File))return json({ok:false,error:"Falta image"},400);
  if(image.type!=="image/png")return json({ok:false,error:"Solo PNG"},415);
  if(image.size>12*1024*1024)return json({ok:false,error:"PNG demasiado grande"},413);
  let metadata={}; try{metadata=JSON.parse(metadataText);}catch{return json({ok:false,error:"metadata inválida"},400);}
  const now=new Date();
  const id=stamp(now);
  const latestPath="audits/visual/latest.png";
  const historyPath="audits/visual/history/"+id+".png";
  const metadataPath="audits/visual/latest.json";
  const historyMetadataPath="audits/visual/history/"+id+".json";
  const encoded=toBase64(new Uint8Array(await image.arrayBuffer()));
  const meta=JSON.stringify({...metadata,serverSavedAt:now.toISOString(),imageBytes:image.size,historyPath,latestPath},null,2);
  async function put(path,content,message){
    let sha;
    try{const existing=await github("/repos/"+REPO+"/contents/"+path+"?ref="+encodeURIComponent(BRANCH),{},env.GITHUB_TOKEN);sha=existing.sha;}catch(e){if(!String(e.message).includes("404"))throw e;}
    return github("/repos/"+REPO+"/contents/"+path,{
      method:"PUT",
      body:JSON.stringify({message,content,branch:BRANCH,...(sha?{sha}:{})})
    },env.GITHUB_TOKEN);
  }
  await put(historyPath,encoded,"audit: save visual capture "+id);
  await put(latestPath,encoded,"audit: update latest visual capture");
  await put(historyMetadataPath,btoa(unescape(encodeURIComponent(meta))),"audit: save visual capture metadata "+id);
  await put(metadataPath,btoa(unescape(encodeURIComponent(meta))),"audit: update latest visual metadata");
  return json({ok:true,latestPath,historyPath,metadataPath,githubUrl:"https://github.com/"+REPO+"/blob/"+BRANCH+"/"+latestPath});
}
export async function onRequestGet(){return json({ok:true,service:"lumina-visual-audit",repository:REPO});}
