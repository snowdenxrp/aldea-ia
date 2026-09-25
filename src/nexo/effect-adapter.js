// Adaptador tipado de efectos de Nexo.
// Separa decisión de mutación real y exige precondición, resultado y postcondición.
// Por defecto no ejecuta nada: cada efecto debe registrarse explícitamente.
const TERMINAL = new Set(["completed","failed","blocked","unsupported"]);

function validStatus(status){ return TERMINAL.has(status); }

export function createEffectAdapter({handlers={}, getStateVersion=()=>null}={}) {
  const registry = new Map(Object.entries(handlers));
  const executed = new Map();

  function register(action, handler){
    if(typeof action!=="string" || !action.trim() || typeof handler!=="function")
      throw new TypeError("action y handler son obligatorios");
    registry.set(action, handler);
  }

  async function execute(request={}) {
    const {missionId,stepId,action,target=null,idempotencyKey,precondition,postcondition,context={}}=request;
    if(!missionId || !stepId || !action || !idempotencyKey)
      return {status:"failed",code:"INVALID_EFFECT_REQUEST",verified:false};
    if(executed.has(idempotencyKey)) return structuredClone(executed.get(idempotencyKey));

    const handler=registry.get(action);
    if(typeof handler!=="function"){
      const result={status:"unsupported",code:"EFFECT_NOT_REGISTERED",verified:false,action,target};
      executed.set(idempotencyKey,result);
      return result;
    }

    let pre;
    try { pre=typeof precondition==="function" ? await precondition({missionId,stepId,action,target,context,stateVersion:getStateVersion()}) : true; }
    catch(error){ pre=false; }
    if(!pre){
      const result={status:"blocked",code:"PRECONDITION_FAILED",verified:false,action,target};
      executed.set(idempotencyKey,result);
      return result;
    }

    const beforeVersion=getStateVersion();
    let effectResult;
    try { effectResult=await handler({missionId,stepId,action,target,context,beforeVersion}); }
    catch(error){
      const result={status:"failed",code:"EFFECT_EXCEPTION",verified:false,action,target,error:String(error?.message??error)};
      executed.set(idempotencyKey,result);
      return result;
    }

    if(!effectResult || !validStatus(effectResult.status)){
      const result={status:"failed",code:"INVALID_EFFECT_RESULT",verified:false,action,target};
      executed.set(idempotencyKey,result);
      return result;
    }
    if(effectResult.status!=="completed"){
      const result={...effectResult,verified:false,action,target};
      executed.set(idempotencyKey,result);
      return result;
    }

    const afterVersion=getStateVersion();
    let post=false;
    try { post=typeof postcondition==="function" ? await postcondition({missionId,stepId,action,target,context,beforeVersion,afterVersion,effectResult}) : false; }
    catch(error){ post=false; }

    if(!post){
      const result={status:"failed",code:"POSTCONDITION_FAILED",verified:false,action,target,effectResult};
      executed.set(idempotencyKey,result);
      return result;
    }

    const evidence={verified:true,kind:"effect-postcondition",action,target,beforeVersion,afterVersion,details:effectResult.details??null};
    const result={status:"completed",verified:true,action,target,evidence,effectResult};
    executed.set(idempotencyKey,result);
    return result;
  }

  return {register,execute,hasExecuted:key=>executed.has(key)};
}
