// Adaptador tipado de efectos de Nexo.
// Separa decisión de mutación real y exige precondición, resultado y postcondición.
// Por defecto no ejecuta nada: cada efecto debe registrarse explícitamente.
const TERMINAL = new Set(["completed","failed","blocked","unsupported"]);
function validStatus(status){ return TERMINAL.has(status); }

export function createEffectAdapter({handlers={}, getStateVersion=()=>null, executionJournal=null}={}) {
  const registry = new Map(Object.entries(handlers));
  const executed = new Map(Array.isArray(executionJournal)
    ? executionJournal.filter(x=>x?.idempotencyKey&&x?.result).map(x=>[x.idempotencyKey,x.result]) : []);

  function persist(key,result){
    executed.set(key,result);
    if(Array.isArray(executionJournal)) {
      const existing=executionJournal.find(x=>x?.idempotencyKey===key);
      if(existing) existing.result=structuredClone(result);
      else executionJournal.push({idempotencyKey:key,result:structuredClone(result),at:new Date().toISOString()});
      if(executionJournal.length>200) executionJournal.splice(0,executionJournal.length-200);
    }
  }
  function register(action, handler){
    if(typeof action!=="string" || !action.trim() || typeof handler!=="function") throw new TypeError("action y handler son obligatorios");
    registry.set(action, handler);
  }

  async function execute(request={}) {
    const {missionId,stepId,action,target=null,idempotencyKey,precondition,postcondition,context={}}=request;
    if(!missionId || !stepId || !action || !idempotencyKey) return {status:"failed",code:"INVALID_EFFECT_REQUEST",verified:false};
    if(executed.has(idempotencyKey)) return structuredClone(executed.get(idempotencyKey));
    const handler=registry.get(action);
    if(typeof handler!=="function"){
      const result={status:"unsupported",code:"EFFECT_NOT_REGISTERED",verified:false,action,target};
      persist(idempotencyKey,result); return result;
    }
    const preVersion=getStateVersion();
    let pre;
    try { pre=typeof precondition==="function" ? await precondition({missionId,stepId,action,target,context,stateVersion:preVersion}) : true; }
    catch(error){ pre=false; }
    if(!pre){ const result={status:"blocked",code:"PRECONDITION_FAILED",verified:false,action,target}; persist(idempotencyKey,result); return result; }
    const beforeVersion=getStateVersion();
    if(beforeVersion!==preVersion){ const result={status:"blocked",code:"STATE_CHANGED_DURING_PRECONDITION",verified:false,action,target,preVersion,beforeVersion}; persist(idempotencyKey,result); return result; }
    let effectResult;
    try { effectResult=await handler({missionId,stepId,action,target,context,beforeVersion}); }
    catch(error){
      const afterExceptionVersion=getStateVersion();
      const result={status:"failed",code:afterExceptionVersion!==beforeVersion?"EFFECT_EXCEPTION_AFTER_STATE_CHANGE":"EFFECT_EXCEPTION",verified:false,action,target,error:String(error?.message??error)};
      persist(idempotencyKey,result); return result;
    }
    if(!effectResult || !validStatus(effectResult.status)){
      const afterInvalidVersion=getStateVersion();
      const result={status:"failed",code:afterInvalidVersion!==beforeVersion?"PARTIAL_EFFECT_DETECTED":"INVALID_EFFECT_RESULT",verified:false,action,target};
      persist(idempotencyKey,result); return result;
    }
    const afterVersion=getStateVersion();
    if(effectResult.status!=="completed"){
      const result={...effectResult,status:"failed",code:afterVersion!==beforeVersion?"PARTIAL_EFFECT_DETECTED":(effectResult.code??"EFFECT_NOT_COMPLETED"),verified:false,action,target,beforeVersion,afterVersion};
      persist(idempotencyKey,result); return result;
    }
    let post=false;
    try { post=typeof postcondition==="function" ? await postcondition({missionId,stepId,action,target,context,beforeVersion,afterVersion,effectResult}) : false; }
    catch(error){ post=false; }
    if(post!==true){ const result={status:"failed",code:"POSTCONDITION_FAILED",verified:false,action,target,effectResult,beforeVersion,afterVersion}; persist(idempotencyKey,result); return result; }
    const evidence={verified:true,kind:"effect-postcondition",action,target,beforeVersion,afterVersion,details:effectResult.details??null};
    const result={status:"completed",verified:true,action,target,evidence,effectResult};
    persist(idempotencyKey,result); return result;
  }
  return {register,execute,hasExecuted:key=>executed.has(key)};
}
