# NCS STEP 7 — Recovery / Succession / Currentness Crosswalk
Date: 2026-10-12
Status: DESIGN RECONCILIATION ONLY — NO IMPLEMENTATION AUTHORIZED — COMMISSIONING STOP

## Purpose
Reconcile existing MASTER/AB research on authority-unavailable bounded safety and constitutional succession with the current Genesis/Constitution gaps. This is not an implementation or commissioning claim.

## Findings

### 1. Succession research does not close Genesis
The prior research defines a candidate lifecycle through AUTHORITY_UNAVAILABLE and BOUNDED_SAFETY_ONLY, then governed successor validation, ordering, predecessor fencing, revalidation, and explicit release. This is useful lifecycle semantics, but it does not identify a currently recognized first trust anchor, authenticate the first verifier, or establish runtime enforcement in a real deployment.

### 2. Recovery must be downstream of a pre-existing legitimacy rule
A recovery/succession record can only be accepted under a rule whose legitimacy predates the disputed recovery. A snapshot, local epoch, timestamp, recovery key, checkpoint, or self-consistent successor bundle cannot create its own authority. If the original trust basis is unavailable and no separately pre-established succession basis can be validated, remain UNKNOWN / QUARANTINED / BOUNDED-SAFETY-ONLY.

### 3. Currentness contains separate problems
- Constitutional ordering/currentness: which exact Constitution revision is legitimately current under amendment/succession rules, including conflict and rollback semantics.
- Effect admission/currentness: whether the actual sink atomically enforces that current authority and rejects stale/revoked generations at final admission.

Solving the first does not prove the second. A sink fence or state revision does not prove the Constitution it enforces is legitimate. The reviewed generic transition and simulation persistence do not currently compose both properties.

### 4. Authority loss may reduce capability, never create authority
While constitutional authority is unavailable, only pre-authorized bounded operations may continue (for example, maintain STOP, preserve evidence, reconcile, observe, or enforce an already-authorized fence). Emergency mode cannot grant ordinary authority, change succession rules, appoint its own successor, or publish currentness.

### 5. Succession must order conflicting histories and fence the predecessor
A successor is not current merely because its artifact or signature validates. Conflicting candidates require an explicit pre-existing constitutional precedence rule; timestamps, local epochs, first-seen order, availability, or apparent quorum are not default tie-breakers. Where exclusivity is required, activation also requires enforceable predecessor cutoff. If ordering or fencing is unknown, remain STOP/UNKNOWN.

### 6. Revocation does not retroactively erase effects
If sink admission linearizes before revocation, later revocation cannot prove the effect never occurred; it must block later admissions and reconcile in-flight/uncertain effects. If revocation linearizes first, the sink must reject stale authority. If order or outcome cannot be established, classify UNKNOWN and do not claim cancellation or global enforcement without evidence.

### 7. Human comparison is one bounded input, not the whole root path
The human-recognition candidate may convey owner intent for exact bytes, readable rendering, version, purpose, scope, and fresh commissioning context only under its accepted assumption and a genuinely recognized reference. It does not independently establish verifier provenance, canonical active-Constitution ownership, succession ordering, currentness/revocation, or the final protected effect boundary. A second phone is only a possible comparison aid after physical and dependency checks; it is not automatically independent, a verifier, or a root.

## Consolidated semantic sequence (design-only)

- GENESIS_UNKNOWN: no protected commissioning; preserve evidence; permit only separately pre-authorized bounded-safe functions.
- OWNER_INTENT_CANDIDATE: exact content/scope reviewed through the recognized comparison assumption; not active authority.
- GENESIS_ESTABLISHED: initial trust basis and verifier provenance independently supported under the declared threat model.
- CONSTITUTION_CANDIDATE: exact content, version, scope, predecessor relation and approval evidence bound; not yet current.
- CONSTITUTION_ORDERED: a legitimate ordering rule resolves amendments/succession/conflicts; competing branches are preserved rather than silently discarded.
- CONSTITUTION_CURRENT: canonical state owner establishes the current revision under ordering, revocation and recovery rules.
- EFFECT_ADMISSION_ELIGIBLE: the actual final sink atomically enforces current authority generation and relevant fences for the exact claim/scope.
- NORMAL_AUTHORITY_RELEASED: required target-specific revalidation, predecessor fencing, uncertainty reconciliation and explicit release are evidenced.

These are semantic labels for review, not proposed enum names or a mandate to add a parallel state machine/store.

## Adversarial obligations
1. Genesis/verifier self-authenticates.
2. Recovery restores stale authority after revocation.
3. Two valid-looking successor branches conflict.
4. Successor activates while predecessor retains a live effect route.
5. Authority becomes unavailable while queued/delegated/in-flight work continues.
6. Recovery begins under one authority and finishes after its scope is revoked.
7. Constitution changes after initial check but before sink admission.
8. A sink is offline or cannot enforce current fencing.
9. Snapshot is intact but constitutionally stale.
10. Correct human comparison is followed by downstream scope expansion or presentation substitution.
11. One sink is fenced while another in-scope sink remains unverified.
12. Recovery/reconciliation progress is mistaken for authority or successful external outcome.

Missing trust, order, currentness, dependency closure, or enforcement means UNKNOWN/STOP for the dependent protected transition. Preserve evidence; do not use permissive fallback.

## Disposition
- Existing MASTER/AB recovery research is reusable as a constraint set; it does not close Genesis or STEP 7.
- No new root, key, Constitution, store, registry, epoch, wrapper, or recovery authority is selected.
- No code, tests, workflows, APK, phone, deployment, or runtime authority changed; no tests were run.
- Genesis: UNKNOWN / NOT ESTABLISHED.
- Canonical current-Constitution owner: UNKNOWN / NOT ESTABLISHED.
- Production effect sink and bypass closure: UNKNOWN / NOT DEMONSTRATED.
- STEP 7 remains OPEN / STOP / UNKNOWN.

Next permitted action: if an actual deployment/sink becomes identifiable, map its canonical authority owner, amendment/recovery paths, and final effect admission boundary against these obligations. If no target exists yet, keep this as a design gate and do not manufacture a simulation or M1 target.
