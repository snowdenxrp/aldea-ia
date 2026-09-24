# NEXO — ROOT ROTATION, COMPROMISE, MULTI-ROOT TRUST AND DESCENDANT REVOCATION
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Research question

How does Nexo prevent authority rooted in an old, compromised, rotated, or replaced trust root from surviving through descendants, caches, delegated capabilities, queued work, provider continuations, or restored snapshots?

This round extends the prior authority-cycle and delegation research. It does not close PG-009 and does not authorize V21 implementation.

## 2. External cross-check

NIST SP 800-193 describes roots of trust as foundational elements for security functions such as measurement, storage, reporting, recovery, verification, and update; it emphasizes that their correct behavior is foundational and that resiliency requires protection, detection, and secure recovery. [NIST SP 800-193]

Trust-anchor standards make the same architectural problem explicit: rollover requires adding/removing/replacing trust anchors, stale anchors must be detectable, and compromise recovery needs an independent still-trusted path where available. RFC 4986 also distinguishes planned and emergency rollover and requires recovery from compromise when another uncompromised trust anchor exists. RFC 6024 similarly requires recovery from loss/compromise of a trust-anchor manager without relying on the compromised key. [RFC 4986; RFC 6024; RFC 5011]

These sources are examples of trust-anchor management, not proof that Nexo's architecture is correct.

## 3. Core distinction

ROOT TRUST != CURRENT AUTHORITY != DESCENDANT CAPABILITY != EFFECT ENFORCEMENT != WORLD EVIDENCE

A valid signature under an old root proves only that the old root authorized/signed something under its historical trust context. It does not prove that the same authority remains current after a root transition.

Therefore every protected authority artifact must carry a root-continuity binding sufficient to reject stale ancestry.

## 4. New canonical candidate objects

### RootTrustSet
- trust_set_id
- members
- composition_contract
- threshold/AND/OR semantics
- independence/failure-domain assumptions
- current root generation
- activation epoch
- revocation/cutoff state

### RootGeneration
- generation_id
- parent_generation
- activation_boundary
- cutoff_boundary
- authorized transition record
- policy/invariant baseline
- trust-set fingerprint
- dependency/common-mode context

### RootContinuityContext
Binds:
- root generation
- trust-set fingerprint
- authority epoch
- policy/invariant version
- capability lineage
- artifact/config generation
- dependency graph version
- recovery/update generation
- scope/containment generation

### RootCutoff
Records the authoritative point after which old-root-derived authority is no longer admissible.

### RootRevocationClosure
The protected closure of all authority descendants that must be invalidated or revalidated:
- active capabilities
- delegated capabilities
- queued work
- delayed jobs
- retries/redrives
- provider continuations
- callbacks
- caches
- admission reservations
- prepared assurance bundles
- recovery/reconciliation authority
- replicated authority state
- snapshot-derived authority

### TrustTransition
Explicit protected transition describing old/new trust sets, overlap rules, cutoff, descendant invalidation, enforcement verification, and recovery path.

## 5. Root rotation is not a key replacement only

A clean rotation must be treated as an authority-context transition:

REQUEST
→ NEW_ROOT_AUTHENTICATED
→ NEW_TRUST_CONTEXT_BOUND
→ TRANSITION_PREPARED
→ OLD_AUTHORITY_CUTOFF
→ DESCENDANT_INVALIDATION/FENCING
→ ENFORCEMENT_VERIFICATION
→ NEW_ROOT_ACTIVE
→ RECONCILIATION
→ OLD_ROOT_DECOMMISSIONED

The exact order may differ by implementation, but the safety property is fixed: there must be an authoritative boundary separating old-root authority from new-root authority.

A period where both roots can independently authorize protected effects is not automatically safe. It requires an explicit overlap contract that defines:
- which effects may use the old root;
- which may use the new root;
- whether either root can delegate;
- whether old-root descendants can cross the boundary;
- how conflicting authorizations are resolved;
- when old-root admission is cut off;
- how enforcement of the cutoff is independently verified.

Without that contract, dual validity is treated as UNKNOWN/HOLD for protected claims.

## 6. Root compromise is different from planned rotation

Planned rotation can preserve a controlled transition.

Suspected root compromise is an adversarial state. The architecture must assume that old-root signatures may be forged after compromise. Therefore:
- signature validity under the old root is insufficient;
- old-root authority is cut off at an authoritative emergency boundary;
- all descendants become stale candidates;
- active external effects require resource-side fencing where feasible;
- queued/retried/delegated work must fail closed at its protected effect boundary;
- restored snapshots cannot restore old authority;
- evidence produced solely through compromised-root authority cannot independently prove safety.

If the system cannot establish a current trusted root and current enforcement boundary, it remains QUARANTINED/SAFETY-ONLY rather than promoting itself to normal authority.

## 7. Multi-root trust: no implicit amplification

A multi-root trust set must have an explicit CompositionContract.

Candidate semantics:
- AND: all required roots authorize;
- OR: any authorized root can authorize;
- threshold: at least k of n roots;
- bounded role split: roots authorize distinct mandatory dimensions;
- conditional composition: authorization depends on explicit context.

No implicit union/product is allowed.

Critical invariant:

EFFECTIVE_ROOT_AUTHORITY <= EXPLICIT_COMPOSITION_CONTRACT(root_set, context)

Adding a root, removing a root, changing k-of-n, changing role semantics, or changing independence assumptions is itself a protected trust transition.

A new root cannot silently increase authority merely because it was added to the configured trust set.

## 8. Root compromise in multi-root systems

Compromise handling depends on composition semantics.

For AND:
- one compromised root may force HOLD if its participation is mandatory;
- replacing it requires a protected transition;
- old-root descendants remain invalid until the new composition is active.

For OR:
- one compromised root may authorize effects independently;
- therefore that root must be cut off from protected admission even if other roots remain healthy.

For threshold:
- compromise of fewer than k roots may or may not preserve safety, depending on the exact contract and whether compromised roots can collude;
- threshold arithmetic alone does not establish independence;
- common trust roots, operators, KMS, update channels, or shared infrastructure can collapse nominal independence.

Thus:

THRESHOLD COUNT != INDEPENDENCE PROOF

This follows the prior common-mode research.

## 9. Descendant revocation closure

Root revocation must propagate through authority lineage, not just through directly signed objects.

Required closure:

ROOT
→ ROOT GENERATION
→ AUTHORITY CONTEXTS
→ CAPABILITIES
→ DELEGATIONS
→ QUEUED/DELAYED WORK
→ RETRIES/REDRIVES
→ PROVIDER CONTINUATIONS
→ EFFECT BOUNDARIES
→ EXTERNAL EFFECT STATE
→ ASSURANCE/EVIDENCE CLAIMS

At every protected effect boundary:

accept only if
- root generation is current;
- trust-set composition is current;
- authority epoch is current;
- capability lineage is current;
- required scope is current;
- policy/invariant context is current;
- no applicable invalidation exists;
- resource incarnation is current;
- required fence/enforcement state is current.

This is stronger than graph-wide cache deletion: if a stale artifact survives somewhere, the final protected boundary must still reject it.

## 10. Snapshot rollback attack

A snapshot can restore old root state, old capability state, old epochs, or old trust-set configuration.

Therefore:

RESTORED_STATE != CURRENT_ROOT_AUTHORITY

A snapshot restore must enter QUARANTINED recovery and establish:
1. current trust anchor/root context;
2. current root generation/cutoff;
3. current authority epoch;
4. current stop/recovery fence;
5. current capability revocation state;
6. current artifact/config generation;
7. current dependency context;
8. current external-effect uncertainty;
9. current enforcement boundary.

Any restored object whose root generation is older than the current cutoff is stale regardless of its local signature validity.

This closes the specific ABA-like attack where rollback resurrects a previously valid root and its descendants.

## 11. Root transition and recovery-of-recovery

Recovery itself cannot depend solely on the root being recovered.

A viable architecture therefore needs a separate recovery/bootstrap trust path, or a pre-established multi-root mechanism with explicit independence and emergency semantics.

Candidate invariant:

RECOVERY_AUTHORITY != RECOVERED_MISSION_AUTHORITY

Recovery can establish a new root context only under a separately defined bootstrap authority envelope. It cannot silently inherit the authority it is attempting to restore.

If the recovery root is itself compromised or uncertain, the system requires an even lower/foundational recovery path or permanent quarantine/manual re-establishment. No recursive software mechanism can manufacture an independent trust root from compromised state.

## 12. Root transition state machine

Candidate abstract states:

ROOT_STABLE
ROOT_ROTATION_PREPARED
ROOT_OVERLAP_RESTRICTED
ROOT_CUTOFF_PENDING
ROOT_CUTOFF_ACTIVE
DESCENDANTS_INVALIDATING
ENFORCEMENT_REVALIDATING
NEW_ROOT_ACTIVE
OLD_ROOT_DECOMMISSIONED
ROOT_UNKNOWN
ROOT_COMPROMISED
ROOT_QUARANTINED

Forbidden transitions include:
- ROOT_COMPROMISED → ROOT_STABLE without independent recovery evidence;
- ROOT_CUTOFF_ACTIVE → OLD_ROOT_AUTHORIZED;
- snapshot restore → authority restored;
- stale descendant → current capability without revalidation;
- old-root signature → current authority by signature alone;
- new root addition → authority expansion without protected CompositionContract;
- recovery owner → mission authority without explicit protected transition.

## 13. New invariants

R1 — Root freshness:
Protected authority requires a current RootContinuityContext.

R2 — Cutoff dominance:
After RootCutoff(g_old), no protected effect may be admitted solely under g_old.

R3 — Descendant invalidation:
Invalid root authority invalidates every descendant whose authorization depends on that root unless an explicit independent re-authorization contract proves otherwise.

R4 — No rollback resurrection:
Restoring historical root/capability state cannot restore current authority.

R5 — Composition non-amplification:
Changing a multi-root set cannot increase effective authority without an explicit composition transition.

R6 — Compromise fail-closed:
When root integrity/currentness is UNKNOWN or COMPROMISED, protected authority is HOLD/QUARANTINE unless an independent recovery path establishes a new valid context.

R7 — Enforcement boundary:
A root cutoff is not a world-effect claim until the relevant last effect-capable boundary is fenced or the claim is weakened.

R8 — Recovery separation:
Recovery/bootstrap authority cannot self-promote into normal mission authority.

R9 — Evidence binding:
Evidence/assurance created under a stale or compromised root cannot be promoted merely because its cryptographic syntax remains valid.

R10 — No hidden dual authority:
Any overlap between old and new roots must be explicit, bounded, and claim-specific.

## 14. Adversarial cases added

RC-01 old root signs a new capability after legitimate rotation → DENY.
RC-02 old delegated capability survives in cache → protected effect boundary rejects stale root generation.
RC-03 queued job carries old-root authorization → reject at admission/effect boundary.
RC-04 retry/redrive reuses old authorization → reject unless continuation is explicitly revalidated.
RC-05 provider continuation ignores Nexo cutoff → require resource-side fence or weaken claim.
RC-06 snapshot restores old root + old epoch → quarantine and re-anchor.
RC-07 old/new roots both valid during overlap → require explicit overlap contract; otherwise HOLD.
RC-08 OR trust set contains compromised root → cutoff compromised member before protected admission.
RC-09 threshold roots share compromised KMS/operator → nominal threshold does not prove independence.
RC-10 new root is added by old compromised root → reject as circular trust expansion.
RC-11 recovery uses restored old root to authorize itself → reject.
RC-12 root generation changes while assurance bundle is prepared → invalidate/revalidate.
RC-13 root rotation changes policy but old policy remains cached → invalidate old assurance and capabilities.
RC-14 root cutoff succeeds internally but external provider remains active → no external containment claim.
RC-15 root revocation propagates partially → publish only degraded claim matching verified enforcement scope.
RC-16 old root returns after network partition → stale generation rejection prevents resurrection.
RC-17 old root signs a rollback artifact → artifact authenticity under old root is insufficient; current root/policy/refinement required.
RC-18 multiple recovery authorities disagree on current root → ambiguity → HOLD/QUARANTINE unless a higher-level composition contract resolves it.

## 15. Important limitation

This research establishes a stronger architecture candidate, not a proof.

Still open:
- exact formalization of RootTrustSet composition;
- proof that descendant invalidation is complete for the implementation's effect graph;
- implementation-level enforcement of root-generation checks;
- formal treatment of offline/disconnected resources;
- exact recovery/bootstrap trust topology;
- SANY/TLC execution;
- implementation-to-formal refinement;
- fault-injection tests around root cutoff, snapshot rollback, partitions, provider continuation, and recovery crashes.

## 16. Distillation decision

CARRY_FORWARD:
- root epochs/generations;
- explicit trust composition;
- independent recovery authority;
- descendant revocation closure;
- resource-side enforcement boundary;
- snapshot != authority;
- common-mode analysis.

REWORK:
- exact multi-root composition algebra;
- root overlap semantics;
- bootstrap/recovery trust topology;
- root cutoff linearization and crash semantics.

REJECT:
- implicit root-set union;
- signature-valid == current-authority;
- cache deletion as the sole revocation mechanism;
- snapshot restore as authority restore;
- process restart as root recovery.

HISTORICAL_ONLY:
- any earlier model that represented root trust as a single boolean without generation/context binding.

OPEN:
- formal theorem/proof and executable verification.

## 17. Bottom line

The architecture must make old trust incapable of silently surviving through descendants.

The key mechanism is not “delete the old key.” It is:

ROOT GENERATION + AUTHORITATIVE CUTOFF + DESCENDANT INVALIDATION + EFFECT-BOUNDARY REJECTION + INDEPENDENT RECOVERY + SNAPSHOT NON-RESTORATION OF AUTHORITY.

Even then, if the last external effect-capable boundary cannot be controlled, Nexo must not claim that the root compromise or cutoff stopped the external world.

Status remains:
RESEARCH COMPLETE FOR THIS ATTACK ROUND / DESIGN CANDIDATE / NOT FORMALLY VERIFIED / NOT IMPLEMENTED.
