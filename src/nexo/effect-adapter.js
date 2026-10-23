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

function readEffectAdapterOptions(options) {
  if (options === undefined) options = {};
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("effect adapter options must be a record");
  }
  let prototype;
  try {
    prototype = Object.getPrototypeOf(options);
  } catch {
    throw new TypeError("effect adapter options must be a plain record");
  }
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("effect adapter options must be a plain record");
  }
  const values = Object.create(null);
  for (const key of ["handlers", "verifiers", "getStateVersion", "executionJournal", "persistPreparedIntent"]) {
    let descriptor;
    try {
      descriptor = Object.getOwnPropertyDescriptor(options, key);
    } catch {
      throw new TypeError("effect adapter options must contain readable data fields");
    }
    if (!descriptor) continue;
    if (!descriptor.enumerable || !("value" in descriptor)) {
      throw new TypeError("effect adapter options must contain enumerable data fields");
    }
    values[key] = descriptor.value;
  }
  return {
    handlers: values.handlers === undefined ? {} : values.handlers,
    verifiers: values.verifiers === undefined ? {} : values.verifiers,
    getStateVersion: values.getStateVersion === undefined ? () => null : values.getStateVersion,
    executionJournal: values.executionJournal === undefined ? null : values.executionJournal,
    persistPreparedIntent: values.persistPreparedIntent === undefined ? null : values.persistPreparedIntent
  };
}

function readFunctionRegistry(registry, label) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new TypeError(`${label} must be a plain function registry`);
  }
  let prototype;
  try {
    prototype = Object.getPrototypeOf(registry);
  } catch {
    throw new TypeError(`${label} must be a plain function registry`);
  }
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain function registry`);
  }
  const entries = [];
  for (const key of Reflect.ownKeys(registry)) {
    if (typeof key !== "string") throw new TypeError(`${label} must not contain symbol keys`);
    let descriptor;
    try {
      descriptor = Object.getOwnPropertyDescriptor(registry, key);
    } catch {
      throw new TypeError(`${label} must contain enumerable data properties`);
    }
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new TypeError(`${label} must contain enumerable data properties`);
    }
    if (typeof descriptor.value !== "function") {
      throw new TypeError(`${label} entries must be functions`);
    }
    entries.push([key, descriptor.value]);
  }
  return entries;
}

export function createEffectAdapter(options = {}) {
  const {
    handlers, verifiers, getStateVersion, executionJournal, persistPreparedIntent
  } = readEffectAdapterOptions(options);
  if (typeof getStateVersion !== "function") {
    throw new TypeError("getStateVersion must be a function");
  }
  const registry = new Map(readFunctionRegistry(handlers, "handlers"));
  // Verifiers are trusted bootstrap configuration, deliberately separate from
  // handlers and from caller-supplied request callbacks.
  const verifierRegistry = new Map(readFunctionRegistry(verifiers, "verifiers"));
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


  // Read-only reconciliation probe. The verifier must be installed by trusted
  // bootstrap configuration; operation callers cannot supply or replace it.
  // This method never settles the journal and never authorizes redispatch.
  async function verifyPrepared({idempotencyKey, missionId, stepId, action, target=null}={}) {
    if(!idempotencyKey || !missionId || !stepId || !action) {
      return {status:"unknown",code:"EFFECT_RECONCILIATION_CONTEXT_INVALID"};
    }
    const entry=journalEntry(idempotencyKey);
    if(!entry || entry.status!=="prepared") {
      return {status:"unknown",code:"EFFECT_PREPARED_OBLIGATION_REQUIRED",idempotencyKey};
    }
    if(entry.missionId!==missionId || entry.stepId!==stepId || entry.action!==action ||
       !isDeepStrictEqual(entry.target??null,target??null)) {
      return {status:"unknown",code:"EFFECT_IDENTITY_MISMATCH",idempotencyKey};
    }
    const verifier=verifierRegistry.get(action);
    if(typeof verifier!=="function") {
      return {status:"unknown",code:"EFFECT_RECONCILIATION_VERIFIER_UNAVAILABLE",idempotencyKey,action,target};
    }
    let observation;
    try {
      observation=await verifier(structuredClone({idempotencyKey,missionId,stepId,action,target:target??null}));
    } catch(error) {
      return {status:"unknown",code:"EFFECT_RECONCILIATION_VERIFIER_FAILED",idempotencyKey,action,target,
        error:String(error?.message??error)};
    }
    if(!observation || typeof observation!=="object" || Array.isArray(observation) ||
       !["applied","not_applied","unknown"].includes(observation.status) ||
       observation.action!==action || observation.idempotencyKey!==idempotencyKey ||
       !isDeepStrictEqual(observation.target??null,target??null) ||
       !Number.isSafeInteger(observation.observedRevision) || observation.observedRevision<0 ||
       typeof observation.source!=="string" || !observation.source.trim()) {
      return {status:"unknown",code:"EFFECT_RECONCILIATION_EVIDENCE_INVALID",idempotencyKey,action,target};
    }
    return {status:observation.status,code:"EFFECT_RECONCILIATION_OBSERVED",idempotencyKey,missionId,stepId,action,target:target??null,
      observedRevision:observation.observedRevision,source:observation.source,
      evidence:observation.evidence??null,journalSettled:false,redispatchAuthorized:false};
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

  async function executeFresh(request={}, { preparedExternally = false } = {}) {
    const {missionId,stepId,action,target=null,idempotencyKey,precondition,postcondition,context={}}=request;
    if(!missionId || !stepId || !action || !idempotencyKey) return {status:"failed",code:"INVALID_EFFECT_REQUEST",verified:false};
    const existingEntry=journalEntry(idempotencyKey);
    const saveResult = (key, result) => preparedExternally ? result : persist(key, result);
    if (preparedExternally && (executed.has(idempotencyKey) || existingEntry)) {
      return { status:"blocked", code:"EFFECT_LOCAL_JOURNAL_CONFLICT_WITH_CANONICAL_PREPARE", verified:false, idempotencyKey };
    }
    // Validate the persisted operation identity before returning either a cached
    // result or attempting reconciliation. Idempotency must not alias new intent.
    if(existingEntry && (request.missionId!==existingEntry.missionId || request.stepId!==existingEntry.stepId ||
      request.action!==existingEntry.action || !isDeepStrictEqual(request.target??null,existingEntry.target??null))) {
      return {status:"blocked",code:"EFFECT_IDENTITY_MISMATCH",verified:false,
        idempotencyKey,expected:{missionId:existingEntry.missionId,stepId:existingEntry.stepId,
          action:existingEntry.action,target:structuredClone(existingEntry.target??null)}};
    }
    if(!preparedExternally && executed.has(idempotencyKey)) return structuredClone(executed.get(idempotencyKey));
    if(!preparedExternally && existingEntry?.result) {
      executed.set(idempotencyKey,existingEntry.result);
      return structuredClone(existingEntry.result);
    }
    if(!preparedExternally && existingEntry?.status==="prepared") {
      const reconciled=await reconcilePrepared(existingEntry,request);
      // A blocked reconciliation is not a terminal fact about the external effect.
      // Keep the journal in `prepared` so a later, stronger reconciliation attempt
      // can resolve the ambiguity instead of turning uncertainty into a cached block.
      if(reconciled.status!=="blocked") persist(idempotencyKey,reconciled);
      return reconciled;
    }

    if(!preparedExternally) recordIntent(request);
    if(!preparedExternally && typeof persistPreparedIntent==="function") {
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
      saveResult(idempotencyKey,result); return result;
    }

    const preVersion=getStateVersion();
    let pre;
    try { pre=typeof precondition==="function" ? await precondition({missionId,stepId,action,target,context,stateVersion:preVersion}) : true; }
    catch(error){ pre=false; }
    if(!pre){ const result={status:"blocked",code:"PRECONDITION_FAILED",verified:false,action,target}; saveResult(idempotencyKey,result); return result; }

    const beforeVersion=getStateVersion();
    if(beforeVersion!==preVersion){
      const result={status:"blocked",code:"STATE_CHANGED_DURING_PRECONDITION",verified:false,action,target,preVersion,beforeVersion};
      saveResult(idempotencyKey,result); return result;
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
    saveResult(idempotencyKey,result); return result;
  }

  async function executePrepared(request={}, { preparedCommit } = {}) {
    const key=request?.idempotencyKey;
    if (!preparedCommit || preparedCommit.status !== "committed" ||
        preparedCommit.preparedCommitted !== true ||
        !Number.isSafeInteger(preparedCommit.storeRevision) || preparedCommit.storeRevision < 0 ||
        !key || request.missionId !== request?.preparedOperation?.missionId ||
        request.stepId !== request?.preparedOperation?.stepId ||
        request.action !== request?.preparedOperation?.action ||
        !isDeepStrictEqual(request.target ?? null, request?.preparedOperation?.target ?? null) ||
        key !== request?.preparedOperation?.idempotencyKey) {
      return { status:"blocked", code:"EFFECT_CANONICAL_PREPARE_CONFIRMATION_REQUIRED", verified:false, idempotencyKey:key };
    }
    return executeFresh(request, { preparedExternally: true });
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

  // Capability discovery lets a canonical runtime reject an unregistered action before PREPARED/dispatch.
  // This reports handler presence only; it is not a reconciliation or authorization contract.
  function supports(action){ return typeof action === "string" && registry.has(action); }
  function supportsReconciliation(action){ return typeof action === "string" && typeof verifierRegistry.get(action) === "function"; }

  return {register,execute,executePrepared,supports,supportsReconciliation,verifyPrepared,hasExecuted:key=>executed.has(key)};
}
