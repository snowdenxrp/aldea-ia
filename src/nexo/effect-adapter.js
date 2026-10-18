import { isDeepStrictEqual } from "node:util";
// Adaptador tipado de efectos de Nexo.
// Separa decisión de mutación real y exige precondición, resultado y postcondición.
// Por defecto no ejecuta nada: cada efecto debe registrarse explícitamente.
// Un journal "prepared" NO demuestra que el efecto no ocurrió. Tras un reinicio,
// la recuperación exige reconciliación explícita antes de volver a ejecutar.
const TERMINAL = new Set(["completed","failed","blocked","unsupported"]);
const sharedInFlight = new WeakMap();
const sharedQueue = new WeakMap();
function validStatus(status){ return TERMINAL.has(status); }

export function createEffectAdapter({handlers={}, getStateVersion=()=>null, executionJournal=null, persistPreparedIntent=null}={}) {
  const registry = new Map(Object.entries(handlers));
  const executed = new Map(Array.isArray(executionJournal)
    ? executionJournal.filter(x=>x?.idempotencyKey&&x?.result).map(x=>[x.idempotencyKey,x.result]) : []);

  function journalEntry(key) {
    if(!Array.isArray(executionJournal)) return null;
    return executionJournal.find(x=>x?.idempotencyKey===key) ?? null;
  }

  function pruneJournal() {
    // Unresolved prepared entries are recovery obligations, not disposable history.
    // Bound terminal history first; if every entry is unresolved, exceed the soft cap.
    while(executionJournal.length>200) {
      const terminalIndex=executionJournal.findIndex(entry=>entry?.status!=="prepared");
      if(terminalIndex<0) return;
      executionJournal.splice(terminalIndex,1);
    }
  }

  function recordIntent(request) {
    if(!Array.isArray(executionJournal)) return;
    const {missionId,stepId,action,target=null,idempotencyKey}=request;
    if(!journalEntry(idempotencyKey)) {
      executionJournal.push({
        idempotencyKey, missionId, stepId, action, target,
        status:"prepared", at:new Date().toISOString()
      });
      pruneJournal();
    }
  }

  function persist(key,result){
    executed.set(key,result);
    if(Array.isArray(executionJournal)) {
      const existing=executionJournal.find(x=>x?.idempotencyKey===key);
      if(existing) {
        existing.result=structuredClone(result);
        existing.status=result.status;
        existing.completedAt=new Date().toISOString();
      } else {
        executionJournal.push({idempotencyKey:key,result:structuredClone(result),status:result.status,at:new Date().toISOString()});
      }
      pruneJournal();
    }
  }

  function register(action, handler){
    if(typeof action!=="string" || !action.trim() || typeof handler!=="function") throw new TypeError("action y handler son obligatorios");
    registry.set(action, handler);
  }

  async function reconcilePrepared(entry, request) {
    // A callback supplied by the operation caller cannot authenticate its own
    // authority, provenance, freshness, or PG-009 recovery fence. Do not invoke
    // it and do not turn its assertion into a terminal journal result.
    const hasCallerReconciler = typeof request?.reconcile === "function";
    return {
      status: "blocked",
      code: hasCallerReconciler ? "RECONCILIATION_AUTHORITY_UNAVAILABLE" : "EFFECT_RECONCILIATION_REQUIRED",
      verified: false,
      action: entry.action,
      target: entry.target,
      idempotencyKey: entry.idempotencyKey,
      uncertainty: "effect_may_or_may_not_have_occurred"
    };
  }

  async function executeFresh(request={}) {
    const {missionId,stepId,action,target=null,idempotencyKey,precondition,postcondition,context={}}=request;
    if(!missionId || !stepId || !action || !idempotencyKey) return {status:"failed",code:"INVALID_EFFECT_REQUEST",verified:false};
    const existingEntry=journalEntry(idempotencyKey);
    // Validate the persisted operation identity before returning either a cached
    // result or attempting reconciliation. Idempotency must not alias new intent.
    if(existingEntry && (request.missionId!==existingEntry.missionId || request.stepId!==existingEntry.stepId ||
      request.action!==existingEntry.action || !isDeepStrictEqual(request.target??null,existingEntry.target??null))) {
      return {status:"blocked",code:"EFFECT_IDENTITY_MISMATCH",verified:false,
        idempotencyKey,expected:{missionId:existingEntry.missionId,stepId:existingEntry.stepId,
          action:existingEntry.action,target:structuredClone(existingEntry.target??null)}};
    }
    if(executed.has(idempotencyKey)) return structuredClone(executed.get(idempotencyKey));
    if(existingEntry?.result) {
      executed.set(idempotencyKey,existingEntry.result);
      return structuredClone(existingEntry.result);
    }
    if(existingEntry?.status==="prepared") {
      const reconciled=await reconcilePrepared(existingEntry,request);
      // A blocked reconciliation is not a terminal fact about the external effect.
      // Keep the journal in `prepared` so a later, stronger reconciliation attempt
      // can resolve the ambiguity instead of turning uncertainty into a cached block.
      if(reconciled.status!=="blocked") persist(idempotencyKey,reconciled);
      return reconciled;
    }

    recordIntent(request);
    if(typeof persistPreparedIntent==="function") {
      try {
        await persistPreparedIntent({idempotencyKey, journalEntry:structuredClone(journalEntry(idempotencyKey)), request:{missionId,stepId,action,target,idempotencyKey,context:structuredClone(context)}});
      } catch(error) {
        const result={status:"blocked",code:"EFFECT_INTENT_PERSISTENCE_FAILED",verified:false,action,target,idempotencyKey,error:String(error?.message??error)};
        return result;
      }
    }
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
      // A handler exception does not prove that the external effect did not occur.
      // Preserve the operation as unresolved so recovery must reconcile before any retry.
      const result={status:"blocked",code:"EFFECT_OUTCOME_UNKNOWN",verified:false,action,target,
        error:String(error?.message??error),beforeVersion,afterVersion:afterExceptionVersion,
        stateChanged:afterExceptionVersion!==beforeVersion,uncertainty:"effect_may_or_may_not_have_occurred"};
      return result;
    }
    if(!effectResult || !validStatus(effectResult.status)){
      const afterInvalidVersion=getStateVersion();
      // A handler ran but returned no usable contract result. An unchanged
      // observed revision is not proof that no external effect occurred.
      // Keep PREPARED and require independent reconciliation before any retry.
      return {status:"blocked",
        code:afterInvalidVersion!==beforeVersion?"PARTIAL_EFFECT_DETECTED":"EFFECT_OUTCOME_UNKNOWN",
        verified:false,action,target,beforeVersion,afterVersion:afterInvalidVersion,
        stateChanged:afterInvalidVersion!==beforeVersion,idempotencyKey,
        uncertainty:"effect_may_or_may_not_have_occurred"};
    }
    const afterVersion=getStateVersion();
    if(effectResult.status!=="completed"){
      // Handler-reported failure/unsupported is not a universal no-effect
      // guarantee. Only an operation-specific trusted verifier may settle it;
      // none is available here, so preserve PREPARED even if revision is stable.
      return {...effectResult,status:"blocked",
        code:afterVersion!==beforeVersion?"PARTIAL_EFFECT_DETECTED":"EFFECT_OUTCOME_UNKNOWN",
        verified:false,action,target,beforeVersion,afterVersion,
        stateChanged:afterVersion!==beforeVersion,idempotencyKey,
        uncertainty:"effect_may_or_may_not_have_occurred"};
    }

    let post=false;
    try { post=typeof postcondition==="function" ? await postcondition({missionId,stepId,action,target,context,beforeVersion,afterVersion,effectResult}) : false; }
    catch(error){ post=false; }
    if(post!==true){
      // The handler reported completion but the required postcondition was not
      // verified. The effect may already have happened; never cache this as a
      // terminal failure or let a retry redispatch it.
      return {status:"blocked",code:"POSTCONDITION_FAILED",verified:false,action,target,effectResult,
        beforeVersion,afterVersion,idempotencyKey,uncertainty:"effect_may_or_may_not_have_occurred"};
    }

    const evidence={verified:true,kind:"effect-postcondition",action,target,beforeVersion,afterVersion,details:effectResult.details??null};
    const result={status:"completed",verified:true,action,target,evidence,effectResult};
    persist(idempotencyKey,result); return result;
  }

  async function execute(request={}) {
    const key=request?.idempotencyKey;
    if(!Array.isArray(executionJournal)||!key) return executeFresh(request);
    const existingEntry=journalEntry(key);
    // This wrapper's fast paths must enforce the same operation identity as executeFresh.
    if(existingEntry && (request.missionId!==existingEntry.missionId || request.stepId!==existingEntry.stepId ||
      request.action!==existingEntry.action || !isDeepStrictEqual(request.target??null,existingEntry.target??null))) {
      return {status:"blocked",code:"EFFECT_IDENTITY_MISMATCH",verified:false,
        idempotencyKey:key,expected:{missionId:existingEntry.missionId,stepId:existingEntry.stepId,
          action:existingEntry.action,target:structuredClone(existingEntry.target??null)}};
    }
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
