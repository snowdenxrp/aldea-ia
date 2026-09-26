// Adaptador tipado de efectos de Nexo.
// Separa decisión de mutación real y exige precondición, resultado y postcondición.
// Por defecto no ejecuta nada: cada efecto debe registrarse explícitamente.
// Un journal "prepared" NO demuestra que el efecto no ocurrió. Tras un reinicio,
// la recuperación exige reconciliación explícita antes de volver a ejecutar.
const TERMINAL = new Set(["completed","failed","blocked","unsupported"]);
const sharedInFlight = new WeakMap();
const sharedQueue = new WeakMap();
function validStatus(status){ return TERMINAL.has(status); }

export function createEffectAdapter({handlers={}, getStateVersion=()=>null, executionJournal=null}={}) {
  const registry = new Map(Object.entries(handlers));
  const executed = new Map(Array.isArray(executionJournal)
    ? executionJournal.filter(x=>x?.idempotencyKey&&x?.result).map(x=>[x.idempotencyKey,x.result]) : []);

  function journalEntry(key) {
    if(!Array.isArray(executionJournal)) return null;
    return executionJournal.find(x=>x?.idempotencyKey===key) ?? null;
  }

  function recordIntent(request) {
    if(!Array.isArray(executionJournal)) return;
    const {missionId,stepId,action,target=null,idempotencyKey}=request;
    if(!journalEntry(idempotencyKey)) {
      executionJournal.push({
        idempotencyKey, missionId, stepId, action, target,
        status:"prepared", at:new Date().toISOString()
      });
      if(executionJournal.length>200) executionJournal.splice(0,executionJournal.length-200);
    }
  }

  function persist(key,result){
    executed.set(key,result);
    if(Array.isArray(executionJournal)) {
      const existing=executionJournal.find(x=>x?.idempotencyKey===key);
      if(existing) { existing.result=structuredClone(result); existing.status=result.status; existing.completedAt=new Date().toISOString(); }
      else executionJournal.push({idempotencyKey:key,result:structuredClone(result),at:new Date().toISOString()});
      if(executionJournal.length>200) executionJournal.splice(0,executionJournal.length-200);
    }
  }

  function register(action, handler){
    if(typeof action!=="string" || !action.trim() || typeof handler!=="function") throw new TypeError("action y handler son obligatorios");
    registry.set(action, handler);
  }

  async function reconcilePrepared(entry, request) {
    const reconcile = request?.reconcile;
    if(typeof reconcile!=="function") {
      return {
        status:"blocked",
        code:"EFFECT_RECONCILIATION_REQUIRED",
        verified:false,
        action:entry.action,
        target:entry.target,
        idempotencyKey:entry.idempotencyKey,
        uncertainty:"effect_may_or_may_not_have_occurred"
      };
    }
    let result;
    try {
      result = await reconcile({
        journalEntry:structuredClone(entry),
        missionId:entry.missionId,
        stepId:entry.stepId,
        action:entry.action,
        target:entry.target,
        context:request.context??{}
      });
    } catch(error) {
      return {
        status:"blocked",
        code:"EFFECT_RECONCILIATION_FAILED",
        verified:false,
        action:entry.action,
        target:entry.target,
        idempotencyKey:entry.idempotencyKey,
        error:String(error?.message??error)
      };
    }
    if(!result || !validStatus(result.status)) {
      return {
        status:"blocked",
        code:"INVALID_RECONCILIATION_RESULT",
        verified:false,
        action:entry.action,
        target:entry.target,
        idempotencyKey:entry.idempotencyKey
      };
    }
    if(result.status==="completed" && result.verified!==true) {
      return {
        status:"blocked",
        code:"UNVERIFIED_RECONCILIATION",
        verified:false,
        action:entry.action,
        target:entry.target,
        idempotencyKey:entry.idempotencyKey
      };
    }
    return {...result,action:entry.action,target:entry.target,idempotencyKey:entry.idempotencyKey};
  }

  async function executeFresh(request={}) {
    const {missionId,stepId,action,target=null,idempotencyKey,precondition,postcondition,context={}}=request;
    if(!missionId || !stepId || !action || !idempotencyKey) return {status:"failed",code:"INVALID_EFFECT_REQUEST",verified:false};
    if(executed.has(idempotencyKey)) return structuredClone(executed.get(idempotencyKey));

    const existingEntry=journalEntry(idempotencyKey);
    if(existingEntry?.result) {
      executed.set(idempotencyKey,existingEntry.result);
      return structuredClone(existingEntry.result);
    }
    if(existingEntry?.status==="prepared") {
      const reconciled=await reconcilePrepared(existingEntry,request);
      if(reconciled.status!=="blocked" || reconciled.code!=="EFFECT_RECONCILIATION_REQUIRED") {
        persist(idempotencyKey,reconciled);
      }
      return reconciled;
    }

    recordIntent(request);
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
    if(beforeVersion!==preVersion){
      const result={status:"blocked",code:"STATE_CHANGED_DURING_PRECONDITION",verified:false,action,target,preVersion,beforeVersion};
      persist(idempotencyKey,result); return result;
    }

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

  async function execute(request={}) {
    const key=request?.idempotencyKey;
    if(!Array.isArray(executionJournal)||!key) return executeFresh(request);
    const persisted=executionJournal.find(x=>x?.idempotencyKey===key&&x?.result);
    if(persisted) { executed.set(key,persisted.result); return structuredClone(persisted.result); }
    let inFlight=sharedInFlight.get(executionJournal);
    if(!inFlight){ inFlight=new Map(); sharedInFlight.set(executionJournal,inFlight); }
    if(inFlight.has(key)) return structuredClone(await inFlight.get(key));
    let queue=sharedQueue.get(executionJournal);
    if(!queue){ queue=Promise.resolve(); sharedQueue.set(executionJournal,queue); }
    const previous=queue;
    const current=previous.then(()=>executeFresh(request),()=>executeFresh(request));
    sharedQueue.set(executionJournal,current.catch(()=>{}));
    inFlight.set(key,current);
    try { return structuredClone(await current); }
    finally { if(inFlight.get(key)===current) inFlight.delete(key); if(sharedQueue.get(executionJournal)===current) sharedQueue.delete(executionJournal); }
  }

  return {register,execute,hasExecuted:key=>executed.has(key)};
}
