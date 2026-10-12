// Captura visual desactivada por decisión de seguridad.
// No leer el cuerpo de la solicitud, no consultar GitHub y no usar secretos.
// La ruta se conserva solo para rechazar clientes antiguos de forma explícita.
function disabled(){
  return new Response(JSON.stringify({ok:false,error:"Captura visual desactivada"}),{
    status:410,
    headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}
  });
}
export function onRequest(){ return disabled(); }
