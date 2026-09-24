---- MODULE PG009_EffectIdentity_Concurrency_Sketch ----
EXTENDS Naturals, FiniteSets

CONSTANT Operations, Effects, Targets

ASSUME Operations # {} /\ Effects # {} /\ Targets # {}

VARIABLES
  opStatus, opId, effectKey, target, effectClass,
  effectState, worldState, authority, revocation,
  ledger, observations, owner

vars == <<opStatus, opId, effectKey, target, effectClass,
           effectState, worldState, authority, revocation,
           ledger, observations, owner>>

EffectStates ==
  {"NEW","PREPARED","IN_FLIGHT","UNKNOWN","RECONCILING",
   "PRESENT","ABSENT","VERIFIED","BLOCKED","CONFLICT"}

Classifications ==
  {"SAME_OPERATION_REPLAY","SAME_EFFECT_LEGITIMATE_REPEAT",
   "EFFECT_COLLISION","SEMANTICALLY_DIFFERENT","UNKNOWN"}

Init ==
  /\ opStatus = [o in Operations |-> "NEW"]
  /\ opId = [o in Operations |-> o]
  /\ effectKey = [o in Operations |-> CHOOSE e in Effects : TRUE]
  /\ target = [o in Operations |-> CHOOSE t in Targets : TRUE]
  /\ effectClass = [o in Operations |-> "CRITICAL"]
  /\ effectState = [o in Operations |-> "NEW"]
  /\ worldState = [o in Operations |-> "UNKNOWN"]
  /\ authority = [o in Operations |-> TRUE]
  /\ revocation = [o in Operations |-> FALSE]
  /\ ledger = [o in Operations |-> FALSE]
  /\ observations = [o in Operations |-> "NONE"]
  /\ owner = [o in Operations |-> "UNCLASSIFIED"]

Prepare(o) ==
  /\ opStatus[o] = "NEW"
  /\ authority[o] /\ ~revocation[o]
  /\ effectState' = [effectState EXCEPT ![o] = "PREPARED"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

Dispatch(o) ==
  /\ effectState[o] = "PREPARED"
  /\ authority[o] /\ ~revocation[o]
  /\ effectState' = [effectState EXCEPT ![o] = "IN_FLIGHT"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

LoseOutcome(o) ==
  /\ effectState[o] = "IN_FLIGHT"
  /\ effectState' = [effectState EXCEPT ![o] = "UNKNOWN"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

Observe(o,s) ==
  /\ effectState[o] \\in {"UNKNOWN","RECONCILING","IN_FLIGHT"}
  /\ s \\in {"PRESENT","ABSENT","UNKNOWN"}
  /\ worldState' = [worldState EXCEPT ![o] = s]
  /\ observations' = [observations EXCEPT ![o] = "FRESH"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    effectState,authority,revocation,ledger,owner>>

ClassifySameOperation(a,b) ==
  /\ a # b
  /\ opId[a] = opId[b]
  /\ owner' = [owner EXCEPT ![b] = "SAME_OPERATION_REPLAY"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    effectState,worldState,authority,revocation,ledger,observations>>

ClassifySameEffect(a,b) ==
  /\ a # b
  /\ effectKey[a] = effectKey[b]
  /\ target[a] = target[b]
  /\ owner' = [owner EXCEPT ![b] = "EFFECT_COLLISION"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    effectState,worldState,authority,revocation,ledger,observations>>

PermitLegitimateRepeat(o) ==
  /\ owner[o] = "SAME_EFFECT_LEGITIMATE_REPEAT"
  /\ effectClass[o] # "FORBID_REPEAT"
  /\ effectState' = [effectState EXCEPT ![o] = "PREPARED"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

BlockCollision(o) ==
  /\ owner[o] = "EFFECT_COLLISION"
  /\ effectState' = [effectState EXCEPT ![o] = "BLOCKED"]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,ledger,observations,owner>>

Verify(o) ==
  /\ effectState[o] \\in {"RECONCILING","PRESENT"}
  /\ worldState[o] = "PRESENT"
  /\ effectState' = [effectState EXCEPT ![o] = "VERIFIED"]
  /\ ledger' = [ledger EXCEPT ![o] = TRUE]
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,authority,revocation,observations,owner>>

Revoke(o) ==
  /\ revocation' = [revocation EXCEPT ![o] = TRUE]
  /\ authority' = [authority EXCEPT ![o] = FALSE]
  /\ IF effectState[o] \\in {"NEW","PREPARED","UNKNOWN","RECONCILING"}
       THEN effectState' = [effectState EXCEPT ![o] = "BLOCKED"]
       ELSE UNCHANGED effectState
  /\ UNCHANGED <<opStatus,opId,effectKey,target,effectClass,
                    worldState,ledger,observations,owner>>

InvUnknownNoBlindRetry ==
  \\A o \\in Operations :
    effectState[o] = "UNKNOWN" => effectState[o] # "PREPARED"

InvVerifiedNeedsWorldEvidence ==
  \\A o \\in Operations :
    effectState[o] = "VERIFIED" =>
      /\ worldState[o] = "PRESENT" /\ ledger[o]

InvRevocationRemovesAuthority ==
  \\A o \\in Operations : revocation[o] => ~authority[o]

InvIdentityStable ==
  \\A o \\in Operations : opId[o] = o

InvCollisionNotImplicitlyIndependent ==
  \\A a,b \\in Operations :
    (a # b /\ effectKey[a] = effectKey[b] /\ target[a] = target[b])
      => owner[a] # "UNCLASSIFIED" \\/ owner[b] # "UNCLASSIFIED"

InvReceiptNotWorldTruth ==
  \\A o \\in Operations :
    effectState[o] = "VERIFIED" => worldState[o] = "PRESENT"

====

(* REFINEMENT NOTES
   This sketch intentionally does not claim atomic uniqueness yet.
   Required next-state refinement:
   1. represent an atomic reservation/ownership record per effect_key;
   2. make acquisition a single transition, not check-then-set;
   3. distinguish SAME_OPERATION_REPLAY from EFFECT_COLLISION;
   4. permit SAME_EFFECT_LEGITIMATE_REPEAT only under explicit policy;
   5. stale observations cannot authorize a new irreversible attempt;
   6. authority/revocation changes invalidate uncommitted reservations;
   7. crash after external effect but before ledger commit enters UNKNOWN/reconciliation.
*)


(* ATOMIC RESERVATION REFINEMENT
   reservationKey[o] is the authoritative reservation identity.
   reservationOwner[k] is either NONE or the operation owning k.
   Claim(k,o) must be modeled as one atomic transition: it succeeds only if
   reservationOwner[k] = NONE, otherwise it returns CONFLICT/REPLAY according
   to the independent acceptance relation. A read followed by a write is not
   an implementation of Claim.

   Authority epoch is part of the reservation context. A reservation created
   under epoch E cannot silently authorize execution under E+1. Revocation or
   epoch change invalidates an uncommitted reservation and requires revalidation.

   External execution remains outside this local atomic boundary. Therefore:
   reservation acquired + external result unknown = RECONCILING/UNKNOWN,
   never ABSENT merely because the local completion record is missing.
*)


(* LEASE/CRASH REFINEMENT
   A reservation lease is coordination state, not evidence that the external effect
   did or did not occur. Expiry permits a new reconciliation decision, not automatic
   execution. A successor must first classify the predecessor as NO_ATTEMPT,
   EFFECT_CONFIRMED, EFFECT_ABSENT, or UNKNOWN.

   If UNKNOWN, a new irreversible execution is forbidden unless the target protocol
   supplies a safe idempotency/reconciliation guarantee or an explicit authority
   transition permits a bounded at-most-once strategy. Otherwise remain in
   RECONCILING/UNKNOWN.

   A lease expiration never erases operation_id, effect_key, attempt history, or
   authority epoch. Historical identity survives lease turnover.

   Revocation or epoch change blocks the old owner from executing, but does not
   imply that an already-dispatched external effect was cancelled. Recovery must
   reconcile the external world independently.
*)


(* RECONCILIATION-LEASE REFINEMENT
   ReservationLease and ReconciliationLease are distinct coordination objects.
   A reservation controls admission to a new external attempt; a reconciliation
   lease controls who may investigate an already-uncertain attempt.

   ReconcileClaim(effectKey, reconciler, epoch, lease) must be atomic. At most
   one active reconciler may own a critical effect key at a given reconciliation
   epoch. A second reconciler must observe ACTIVE_RECONCILIATION and not perform
   a competing irreversible retry.

   Reconciliation lease expiry does not imply effect absence. A successor first
   acquires reconciliation ownership, preserves the predecessor attempt history,
   and re-reads the external world using a fresh observation boundary.

   A stale reconciler cannot commit a new world fact after ownership changes.
   Commit of reconciliation evidence must bind effectKey + reconciliationEpoch
   + owner/fencing token + observation freshness/version.

   This prevents split-brain recovery: two recoverers cannot both conclude that
   UNKNOWN means ABSENT and independently trigger the same irreversible effect.
*)


(* SPLIT-BRAIN / FENCED RECONCILIATION REFINEMENT
   A critical effect key has at most one active reconciliation owner at a time.
   Reconciliation ownership is separate from execution reservation.

   Let reconciliationEpoch[k] monotonically identify ownership generations and
   fenceToken[k] identify the currently valid owner. Any reconciliation commit
   must present the current token and epoch; a stale owner is rejected.

   A lease expiry creates eligibility for a successor but does not itself change
   worldState. The successor must acquire the new fence atomically, then perform
   a fresh observation. Previous observations remain historical evidence only.

   Critical retry is permitted only after the acceptance relation evaluates the
   reconciled state and the target's idempotency/reconciliation capability.

   This is a safety boundary, not a liveness guarantee: if ownership cannot be
   safely transferred or the external outcome cannot be reconciled, the system
   may remain UNKNOWN/BLOCKED rather than guessing.
*)


(* EVIDENCE SUFFICIENCY / FRESHNESS REFINEMENT
   A fresh observation is not automatically sufficient evidence of absence.
   Observation quality is modeled separately from freshness.

   Observation metadata must bind at least:
     target, observed state, observed_at/causal position, source identity,
     consistency level, visibility scope, query semantics, and verification method.

   For a retry decision, acceptance must establish that the observation can
   distinguish EFFECT_ABSENT from NOT_VISIBLE/UNKNOWN for the relevant effect
   class. If the target offers only eventual consistency, a recent ABSENT read
   may remain insufficient until a declared consistency/freshness boundary is met.

   Therefore:
     FRESH && ABSENT does not imply SAFE_TO_RETRY.
     SAFE_TO_RETRY requires an independent acceptance relation over observation
     sufficiency, target semantics, effect class, authority epoch, and current
     preconditions.

   A stale observation cannot authorize a critical retry. A fresh but insufficient
   observation also cannot authorize it. UNKNOWN remains UNKNOWN until evidence
   crosses the declared sufficiency boundary.
*)


(* WORLD-VERSION / TOCTOU REFINEMENT
   An observation is bound to a worldVersion or causal position when the target
   exposes one. Critical execution must carry the observed version as a
   precondition/fence. If the target reports a newer version, changed ETag,
   sequence, revision, or equivalent conflict marker, the prepared execution is
   invalidated and must revalidate.

   Freshness is therefore necessary but not sufficient:
     Fresh(obs) /\\ Sufficient(obs) /\\ VersionMatches(obs, precondition)
   are separate predicates.

   Required critical path:
     OBSERVE -> BIND_VERSION -> AUTHORIZE -> EXECUTE_IF_VERSION_MATCHES.

   If the target cannot expose a usable version/conditional-write boundary, Nexo
   must use a weaker target-specific safety class (for example idempotency-aware,
   reconciliation-only, at-most-once, or UNKNOWN/BLOCKED) rather than pretending
   it has compare-and-swap semantics.

   A successful execution receipt does not erase the need to verify the resulting
   world state when the target's receipt is not itself an independent world proof.
*)


(* WORLD VERSION / EXECUTION FENCE REFINEMENT
   A world observation carries a target-local version or causal position.
   A critical execution prepared from observation version V may commit only if
   the target still satisfies the required version/precondition boundary.

   Conceptually:
      OBSERVE(target) -> (state, version V, freshness F)
      PREPARE(effect, expectedVersion V, authorityEpoch E)
      EXECUTE iff current target version/precondition matches V and epoch E

   A conditional write / compare-and-swap is preferred where the target supports
   it. If the target cannot atomically enforce the expected version, the version
   is evidence for revalidation but is NOT by itself an execution fence.

   Therefore:
      observedVersion = currentVersion is required for optimistic concurrency,
      but only a target-enforced conditional transition creates the hard fence.

   If the target version changed, execution is rejected as STALE_PRECONDITION and
   must re-observe/replan. Last-writer-wins is not accepted as a safety mechanism
   for critical state because it can silently overwrite concurrent intent.

   The model must also preserve the distinction between target-local version,
   authority epoch, operation identity, and reconciliation epoch.
*)


(* WORLD VERSION / RETRY-REPLAN REFINEMENT
   A stale-precondition failure does not by itself mean the mission failed.
   It invalidates the execution assumption. Recovery must classify the next
   transition while preserving lineage:

     SAME_OPERATION_RETRY:
       same logical operation/effect identity remains valid; reuse operation_id
       and re-obtain a valid world-version/fence before dispatch.

     REPLAN_SAME_MISSION:
       mission root and obligation remain valid, but the world change alters
       the plan/effect. The old operation remains historical; a new operation_id
       is created and linked to its predecessor/replan reason.

     NEW_OPERATION:
       the intended effect itself changed or the prior obligation was discharged,
       superseded, cancelled, or otherwise no longer valid. New authority and
       preconditions are required as applicable.

   Forbidden:
     - converting STALE_PRECONDITION into SUCCESS;
     - blindly replaying a stale effect with a new operation_id to bypass
       duplicate/effect controls;
     - changing semantic intent while retaining an old operation_id;
     - treating a newer world version as proof that the old operation happened.

   Lineage fields should preserve predecessor_operation_id (when applicable),
   replan_reason, observed_version, rejected_version/expected_version, and the
   authority/policy epochs used for the decision.
*)

(* CONSISTENCY-CAPABILITY REFINEMENT
   Targets differ in concurrency guarantees. Nexo records a target capability
   class rather than assuming that a version token has universal meaning:

     C0 = no reliable version/fence semantics
     C1 = version evidence / optimistic precondition check
     C2 = atomic conditional write / compare-and-swap
     C3 = transactional conflict validation / serializable semantics
     C4 = stronger externally ordered transactional semantics

   The class is target- and operation-specific and is evidence, not authority.
   Critical execution admission must require a class sufficient for the effect.
   C0 cannot silently inherit C2+ guarantees. A C1 read/version check without
   target-side atomic enforcement is not a hard execution fence.
*)


(* GLOBAL CONFLICT / SERIALIZATION REFINEMENT
   Pairwise-valid operations can still violate a shared mission/global invariant.
   Therefore local precondition validity is insufficient for critical concurrent
   effects. Nexo must classify conflicts using read-set/write-set/effect-set
   overlap and explicit global invariants.

   Conceptual conflict classes:
     INDEPENDENT       = no relevant shared state/invariant
     READ_WRITE        = one operation changes state relied upon by another
     WRITE_WRITE       = both mutate the same protected state/effect domain
     EFFECT_COLLISION  = distinct operation IDs may produce the same forbidden effect
     GLOBAL_INVARIANT  = effects touch different resources but jointly violate an invariant
     UNKNOWN           = dependency/visibility information insufficient

   Safe concurrency requires either:
     (a) proven commutativity / independence,
     (b) target-enforced serializable/transactional ordering,
     (c) atomic reservation covering the invariant's full conflict domain, or
     (d) explicit scheduler serialization with durable authority.

   Pairwise checks must not be mistaken for global safety: A valid alone + B valid
   alone does not imply A||B is valid. The admission relation therefore evaluates
   the combined post-state/invariant set for concurrent critical operations.

   If conflict information is incomplete, the default is UNKNOWN/BLOCK or safe
   serialization, not optimistic independence.

   IMPORTANT: external database serializability protects the database transaction's
   consistency; it does not automatically prove Nexo's application-level/global
   invariant unless that invariant is represented inside the transaction or enforced
   by an independent control layer. Spanner documentation explicitly distinguishes
   database concurrency guarantees from application-level invariants and warns that
   internal locks do not guarantee exclusive access to resources outside Spanner.
*)


(* DEPENDENCY DISCOVERY / HIDDEN-CONFLICT REFINEMENT
   A conflict graph is only as safe as its declared dependency relation.
   Nexo therefore distinguishes:

     DECLARED_DEPENDENCY   = dependency asserted by the operation contract
     OBSERVED_DEPENDENCY   = dependency discovered from runtime evidence
     INFERRED_DEPENDENCY   = dependency derived from policy/invariant analysis
     UNKNOWN_DEPENDENCY    = dependency status cannot be established

   Each critical operation carries a dependency footprint:
     ReadSet, WriteSet, EffectSet, ResourceSet, InvariantSet, ExternalSystemSet,
     AuthorityDomainSet, and causal predecessors.

   Conflict analysis computes edges across the union of these footprints.
   However, absence of a declared edge is NOT proof of independence. For critical
   execution, dependency completeness must itself be an assurance property.

   Hidden-dependency controls:
     1. invariant ownership registry maps invariants to authoritative state/domains;
     2. policy requires operations touching an invariant domain to declare it;
     3. runtime evidence can add discovered edges but cannot silently remove declared ones;
     4. dependency omissions enter UNKNOWN / QUARANTINED classification;
     5. critical execution requires a dependency-completeness proof or conservative
        serialization over the affected domain.

   Common-mode dependency is modeled separately: two operations may touch disjoint
   resources but share the same external dependency, authority domain, quota, safety
   invariant, or verifier. Such edges are GLOBAL_INVARIANT / COMMON_MODE, not ignored
   merely because resource IDs differ.

   Dependency graphs are versioned artifacts. Changes to invariant definitions,
   resource topology, policy, or operation schemas can invalidate prior conflict
   analysis and require recomputation.

   IMPORTANT: graph completeness is not established merely because every node has a
   dependency list. The acceptance oracle must test known counterexamples, omitted
   edges, topology changes, and adversarially hidden dependencies.
*)


(* INVARIANT / DEPENDENCY / SCHEDULER AUTHORITY SEPARATION
   Critical safety constraints are not owned by the executor. Define distinct
   authority domains:

     INVARIANT_AUTHORITY  = may define/amend protected invariants and their scope
     DEPENDENCY_AUTHORITY = may certify dependency topology/completeness evidence
     SCHEDULER_AUTHORITY  = may choose ordering/admission among already-authorized ops
     EXECUTOR_AUTHORITY   = may perform an operation only within granted capability
     VERIFIER_AUTHORITY   = may assess whether required postconditions/evidence hold

   Separation rules:
     - Executor cannot weaken, remove, or redefine an invariant used to authorize it.
     - Scheduler cannot grant authority that the policy/capability layer did not grant.
     - Dependency metadata cannot silently redefine invariant semantics.
     - Verifier cannot retroactively authorize execution by declaring an invariant met.
     - A model/agent proposal is information, not invariant authority.

   Invariant changes are governance events with explicit version, scope, rationale,
   affected dependency graph, effective epoch/time, compatibility impact, and review.
   A critical operation prepared under invariant version V is not automatically valid
   under V+1 if the change is materially restrictive or expansive; re-admission is
   required according to policy.

   Scheduler admission is therefore:
      AUTHORIZED(operation, policy, capability, epoch)
      AND SAFE_UNDER(invariants, dependency_graph, world_boundary)
      AND CONFLICTS_RESOLVED
      -> admissible

   not:
      scheduler_priority -> authority.

   The executor receives an already bounded authority envelope and cannot widen it.
*)

(* INVARIANT TAMPER / SELF-WEAKENING REFINEMENT
   If an actor that benefits from an operation can alter the invariant or its scope,
   the safety proof becomes circular. Critical invariant definitions therefore live
   in a separately governed authority domain and are referenced by immutable/versioned
   identifiers. Material changes trigger re-evaluation of affected prepared operations.

   Emergency changes may reduce availability but must not silently widen critical
   authority. Recovery preserves the previous invariant history and records the
   change as a new governance event.
*)


(* POLICY / INVARIANT VERSION TRANSITION FOR IN-FLIGHT OPERATIONS
   A material policy/invariant change creates a new governance boundary. Prepared
   operations are not all equivalent: their disposition depends on reversibility,
   external observability, current authority, and whether the changed rule applies
   to the operation's effect.

   Transition states:
     PREPARED_UNDER_OLD_RULE
     FENCED_FOR_REVALIDATION
     REVALIDATED_UNDER_NEW_RULE
     DRAINING_OLD_RULE
     EXECUTING_LEGACY_ALLOWED
     ABORT_REQUIRED
     RECONCILIATION_REQUIRED
     QUARANTINED

   A material rule change must identify an effective boundary (epoch/version/time
   plus ordering semantics). New admissions use the new rule. In-flight operations
   must be classified at that boundary; they cannot silently acquire new authority.

   Classification principles:
     - NOT_STARTED + affected by new restrictive rule -> re-admit or block.
     - PREPARED + not externally observable -> revalidate before dispatch.
     - IN_FLIGHT + irreversible -> cannot be assumed cancellable; enter governed
       drain/reconciliation path and do not invent rollback.
     - IN_FLIGHT + safely cancellable -> cancel only under target-supported semantics,
       then verify cancellation/world state.
     - EFFECT_ALREADY_COMMITTED -> preserve history; verify against the new rule,
       but never rewrite history as if the old rule had not existed.

   A rule change must not silently widen critical authority. Restrictive changes may
   reduce availability; expansive changes require explicit governance admission and
   do not retroactively authorize already-executed effects.

   The transition fence binds at least policy/invariant version, authority epoch,
   operation/effect identity, and world/precondition boundary. If any required
   binding is unknown, critical dispatch is blocked or quarantined.

   Schema migration is separate from policy migration: a new data/schema version
   does not itself authorize a new interpretation or operation. Historical events
   remain bound to the policy/invariant versions governing them.
*)


(* POLICY CHANGE DURING REMOTE-UNKNOWN EXECUTION
   Critical case: an operation crossed its old policy/world fence, was dispatched,
   then the local runtime lost certainty about the external outcome while policy,
   invariant, or authority changed.

   Required separation:
     OLD_AUTHORITY_FOR_EXECUTION
     NEW_AUTHORITY_FOR_RECOVERY

   The new authority does not retroactively authorize the old dispatch, but it
   governs what Nexo may do NOW: reconcile, observe, contain, compensate, or stop.

   State refinement:
     IN_FLIGHT_OLD_POLICY
       -> REMOTE_UNKNOWN_POLICY_CHANGED
       -> RECOVERY_RECONCILIATION
       ->
          EFFECT_PRESENT      -> verify under current policy, then reconcile/contain
          EFFECT_ABSENT       -> decide whether a new attempt is admissible under
                                 current policy and fresh preconditions
          EFFECT_AMBIGUOUS    -> remain UNKNOWN/BLOCKED

   Forbidden:
     - retrying merely because the old operation has no local commit;
     - using old authority to perform a new external attempt after policy expiry;
     - using new authority to claim the old effect was authorized under the new rule;
     - treating cancellation intent as proof of cancellation;
     - silently changing operation identity to bypass effect collision controls.

   Authority rule:
     OLD_AUTHORITY may explain/validate the historical dispatch only.
     NEW_AUTHORITY controls all post-transition actions.
     No authority may rewrite the historical authorization context.

   If the current policy forbids the old effect, the system may still need to
   observe/reconcile it because world state is not erased by policy change. The
   response becomes containment/reconciliation, not retroactive invalidation of fact.

   Safety invariant: when policy/authority changes during remote uncertainty,
   autonomy cannot increase. At minimum it stays equal or decreases until the
   external outcome and current admission conditions are established.
*)


(* RECONCILIATION UNDER CONTINUOUS EPOCH CHANGE / ABA REFINEMENT
   Reconciliation is itself an authorized critical process and may become stale.
   A reconciler R started under authority epoch E43 and policy/invariant version V18
   cannot commit a recovery decision after a material transition to E44/V19 unless
   the decision is explicitly revalidated under the current boundary.

   Every reconciliation attempt carries:
     reconciliation_id
     effect_key / operation_id
     authority_epoch_at_acquisition
     policy/invariant_version_at_acquisition
     world_version_observed
     dependency_graph_version
     lease/fencing_token
     observation freshness/causal metadata

   Before any external side effect or durable recovery commit:
     1. verify reconciler ownership/fencing token;
     2. verify authority epoch is current;
     3. verify policy/invariant version applicability;
     4. verify dependency graph/conflict assumptions remain valid;
     5. revalidate world/precondition version or equivalent target fence;
     6. verify evidence sufficiency/freshness;
     7. only then commit or dispatch.

   Stale reconciler rule:
     old token/epoch -> cannot commit after ownership or authority changes.
     Lease expiry transfers coordination, not knowledge and not proof of absence.

   ABA protection:
     observing state A, then B, then A does not imply that nothing changed.
     Reconciliation must bind versions/epochs/causal positions, not only raw state
     equality. A state that returns to the same value is still a different history.

   If repeated transitions prevent a stable admissible boundary, recovery enters
   RECONCILIATION_UNSTABLE / BLOCKED rather than oscillating with unbounded retries.
   Safe progress requires bounded retries, backoff, escalation, or containment.

   Recovery decisions are historical facts tied to their exact boundary; a later
   policy/epoch cannot rewrite them, but can require a new reconciliation decision.
*)


(* ATOMIC RECONCILIATION COMMIT / STALE-OWNER RACE REFINEMENT

   A lease by itself is not sufficient protection for an external or durable
   critical commit. The commit must be guarded by a fencing/ownership token that
   the authoritative state store validates atomically. etcd documents this pattern:
   transactions can compare a key revision/version atomically, and its lock/election
   ownership revision can be tested during a transaction. A lease can expire while
   a client still believes it owns the resource, so the lease is coordination/liveness
   support, not the final mutual-exclusion proof.

   Required commit predicate (conceptual):
     CommitAllowed ==
       Owner(effectKey) = reconciliation_id / fence_token
       /\\ FenceVersion = token_version
       /\\ AuthorityEpoch = current_epoch
       /\\ PolicyVersionApplicable
       /\\ EffectIdentityStillBound
       /\\ WorldPreconditionStillValid
       /\\ EvidenceSufficientAndFresh

   The predicate and the durable recovery record must be evaluated/committed as one
   atomic transition in the authoritative coordination store whenever the store
   provides that primitive. A stale owner that races with lease expiry/transfer must
   lose the conditional commit, even if it sends its request after the lease expired.

   Important boundary: atomicity of the coordination-store commit does NOT make an
   external side effect atomic with that store. The external effect remains subject
   to the existing REMOTE_UNKNOWN/reconciliation model.

   Race cases:
     R1 lease expires -> R2 acquires -> R1 commits: REJECT R1.
     R1 commits -> R2 acquires: R2 must observe R1's durable outcome and reconcile;
       ownership transfer does not erase R1 history.
     R1 and R2 commit concurrently: authoritative conditional transaction serializes;
       at most one matching ownership transition succeeds.
     ABA owner/value reuse: token must be unique/monotonic or otherwise generation-bound;
       equality of owner identity alone is insufficient.

   New safety obligations:
     INV-303 stale reconciler cannot durably commit after fencing/ownership changes.
     INV-304 lease expiry transfers coordination but does not prove effect absence.
     INV-305 ownership transfer preserves prior attempt/evidence history.
     INV-306 critical reconciliation commit validates current authority/policy/effect
              identity/world preconditions in the same authoritative transition.
     INV-307 owner identity alone cannot defeat ABA; generation/fence token is required.
     INV-308 coordination-store atomicity cannot be promoted into external-world atomicity.
     INV-309 concurrent recovery commits resolve through one authoritative serialization
              point; no last-writer-wins recovery for critical effects.
*)


(* EXTERNAL WORLD VERSION / CONDITIONAL EFFECT BOUNDARY

   A local observation such as worldVersion=100 is evidence, not by itself an
   externally enforced fence. Nexo must classify the target consistency model:
     C0: no reliable version/fence
     C1: version is observable evidence only
     C2: target supports atomic conditional/CAS mutation
     C3: transactional conflict validation / serializable semantics
     C4: stronger externally ordered transaction semantics

   A critical operation may be authorized by local state only when its guarantee
   matches the target class. In particular, C1 must not be treated as C2.

   For C2+, conceptual effect:
     PRECONDITION = observed_version
     CONDITIONAL_MUTATE only_if target_version = observed_version
   If the target rejects the condition, the operation is STALE_PRECONDITION and
   must revalidate/replan rather than blindly retry.

   For C0/C1, Nexo cannot manufacture a remote fence. A matching observed version
   cannot prove that the target remained unchanged between observation and effect.
   Critical irreversible operations therefore require an alternative target-level
   idempotency/transaction guarantee, a stronger independent observation protocol,
   or remain BLOCKED/UNKNOWN according to effect risk.

   Acknowledgement/receipt semantics remain separate from world verification.
   A successful conditional write proves the target accepted the condition and
   mutation under its own protocol; it does not automatically prove every broader
   world invariant outside that transaction.

   New obligations:
     INV-310 world version evidence cannot be promoted into a remote fence unless
              the target enforces it atomically.
     INV-311 C1 observation cannot authorize a C2-style conditional claim.
     INV-312 stale-precondition rejection invalidates the execution assumption and
              triggers revalidation/replan, not blind retry.
     INV-313 target consistency class must be recorded per critical effect class.
     INV-314 broader world verification remains distinct from successful conditional
              mutation/receipt.
*)


(* GUARANTEE BUDGET / C0-C4 TARGET CAPABILITY REFINEMENT

   Nexo must never claim a stronger end-to-end guarantee than the target protocol
   actually enforces. Separate four properties:
     authorization safety, duplicate-effect safety, outcome knowledge, and
     reversibility/compensation.

   Target classes:
     C0: no reliable conditional/version fence or deterministic reconciliation.
       Critical irreversible effect: BLOCK unless a separately governed protocol
       supplies equivalent protection.
     C1: observable version/readback but no atomic remote precondition.
       Observation can improve reconciliation, but cannot close the TOCTOU window.
       Critical irreversible effect needs another guarantee or remains BLOCKED.
     C2: atomic conditional/CAS at target.
       Can provide target-local stale-precondition rejection and, for suitable
       idempotent operations, safe retry semantics. Does not prove broader external
       invariants outside the target transaction.
     C3: transactional conflict validation / serializable semantics.
       Can coordinate multi-item invariants covered by that transaction boundary.
       Guarantees remain scoped to participating items/system.
     C4: stronger externally ordered semantics.
       May provide stronger ordering/transaction properties, but Nexo must record
       exact scope and failure model rather than map C4 to universal exactly-once.

   Alternative protection for C0/C1 can be composed only when each component's
   semantics are explicit: stable idempotency key, target-side deduplication,
   deterministic readback, compensating action, durable intent, and reconciliation.
   Composition cannot manufacture atomicity when an irreversible external effect
   occurs outside every authoritative transaction/fence.

   Compensation is not rollback: compensation is a new effect that can itself fail,
   be delayed, be unauthorized under current policy, or have different semantics.
   If neither safe retry nor reliable reconciliation nor acceptable compensation is
   available, the correct state is UNKNOWN/BLOCKED, not guessed success/failure.

   New obligations:
     INV-315 guarantee claims are bounded by target protocol scope/failure model.
     INV-316 C0/C1 cannot receive C2-style safety merely from local orchestration.
     INV-317 idempotency + reconciliation + compensation is not equivalent to atomicity.
     INV-318 compensation requires fresh authority, effect identity, preconditions,
              verification, and its own retry/reconciliation state.
     INV-319 critical unknown outcomes without a safe resolution path remain blocked.
*)


(* RISK / REVERSIBILITY / OBSERVABILITY / TARGET-CAPABILITY ADMISSION REFINEMENT

   Guarantee selection must be policy-driven by effect characteristics, not by model
   confidence. Risk is treated as consequence magnitude x likelihood, consistent with
   NIST AI RMF framing; the architecture additionally tracks reversibility,
   observability, target consistency class, duplicate-effect risk, blast radius,
   authority criticality, and compensation quality.

   Conceptual effect profile:
     risk_class
     consequence_class
     likelihood_class
     reversibility_class
     observability_class
     target_consistency_class (C0-C4)
     duplicate_hazard
     blast_radius
     authority_criticality
     compensation_class

   Admission levels:
     ADMIT: required guarantees demonstrably satisfied.
     RESTRICTED: allowed only with bounded scope/limits and stronger monitoring.
     HUMAN_REQUIRED: autonomous execution lacks sufficient assurance but a governed
                     human decision path may satisfy the required authority.
     BLOCKED: required guarantee unavailable or outcome remains critically unknown.

   The admission function must be monotonic with uncertainty: increasing uncertainty,
   risk, blast radius, or loss of reversibility cannot silently increase autonomy.
   Conversely, lower risk does not override missing authorization or violated policy.

   Example policy shape (not a universal numeric score):
     low-risk + reversible + observable + C0/C1 -> may admit bounded low-impact work;
     high-risk + irreversible + C0/C1 -> BLOCKED unless an independent governed
       protocol supplies equivalent protection;
     high-risk + C2/C3 + idempotent + verified reconciliation -> may be restricted/admitted
       within the exact transaction/effect scope;
     critical authority-changing effects require the highest applicable governance
       and cannot be admitted solely from model confidence.

   Retry budget is part of the admission contract. Non-idempotent or uncertain effects
   cannot receive unlimited retries. Distributed retries require bounded attempts,
   elapsed-time limits, exponential backoff/jitter, and one authoritative retry layer
   to prevent retry storms.

   The policy must store why an effect was admitted, what guarantees were required,
   which target capabilities supplied them, and what uncertainty remained. A model's
   confidence score is evidence at most; it cannot substitute for authorization,
   target enforcement, or world verification.

   New obligations:
     INV-320 admission depends on effect profile and required guarantees, not model confidence.
     INV-321 increasing critical uncertainty/risk/blast radius/reversibility loss cannot increase autonomy.
     INV-322 target capability must satisfy the minimum guarantee class for the effect.
     INV-323 authorization/policy violations block regardless of low risk.
     INV-324 compensation quality cannot be assumed; it must be explicitly classified.
     INV-325 retry budgets are bounded and part of effect admission.
     INV-326 retry loops cannot multiply across layers without an explicit owner.
     INV-327 admission records required guarantees, supplied guarantees, residual uncertainty,
              and rationale/evidence for audit and later re-evaluation.
*)


(* RISK CLASSIFICATION INTEGRITY / TAINT / INDEPENDENT ADMISSION REFINEMENT

   Risk classification is security-relevant input to effect admission and therefore
   cannot be treated as an ordinary model-produced label. NIST notes that risk metrics
   can be oversimplified, gamed, or fail to capture context, and recommends independent
   review as a way to improve measurement and mitigate conflicts of interest.

   RiskProfile is a governed artifact, not a free-form model field. It binds:
     effect_key / operation_id
     mission and target scope
     consequence and likelihood assumptions
     reversibility and observability
     target consistency class
     blast-radius dimensions
     authority criticality
     evidence/provenance
     classifier version and policy version
     expiry/review time

   Taint rules:
     UNTRUSTED input -> UNTRUSTED risk classification.
     Missing/ambiguous dimensions -> UNKNOWN, never silently LOW.
     Agent/model self-assessment -> proposal only.
     Material transformation of effect semantics -> risk reclassification required.
     Scope expansion -> recompute aggregate risk/blast radius.
     Dependency or policy change -> invalidate prior admission where applicable.

   Monotone downgrade protection:
     a component without risk-authority cannot lower a risk class or reduce required
     guarantees. It may only provide evidence for a higher-authority classifier.
     Admission must be based on a canonical policy-bound risk profile and an
     independently reviewable acceptance relation.

   Compositional blast radius:
     aggregate risk must account for all declared/inferred/unknown dependencies,
     shared resources, common-mode failure domains, authority domains, and external
     systems. Unknown dependency evidence cannot be treated as independence.

   Independent assessment:
     for high/critical effects, risk classification should be produced or checked by
     a component independent from the executor and, where feasible, from the proposing
     model. The checker verifies the profile against the canonical effect contract;
     it does not grant authority by itself.

   Fail-safe classification:
     RISK_UNKNOWN -> minimum applicable safety posture (RESTRICTED/HUMAN_REQUIRED/
     BLOCKED according to policy), never an automatic LOW-risk admission.

   New obligations:
     INV-328 risk class is governed security input, not arbitrary model metadata.
     INV-329 missing/ambiguous risk dimensions cannot silently lower risk.
     INV-330 untrusted/tainted inputs cannot produce a trusted risk downgrade.
     INV-331 effect semantic/scope changes invalidate or re-evaluate risk admission.
     INV-332 unknown dependencies do not count as independence for blast-radius analysis.
     INV-333 critical risk classification is independently reviewable from execution.
     INV-334 no component lacking risk authority can reduce required guarantees.
     INV-335 risk-profile provenance/version/expiry are bound to the admission decision.
*)


(* COMPOSITIONAL / CUMULATIVE RISK AND GLOBAL-INVARIANT ADMISSION

   Individual effect admission is insufficient: a sequence of individually admissible
   operations can jointly violate a global invariant or create a larger blast radius.
   NIST AI RMF emphasizes that AI lifecycle activities are interdependent and that
   interactions among actors and later conditions can undermine otherwise reasonable
   decisions. AWS distributed-systems guidance similarly treats dependency failures
   and retry storms as emergent cross-component effects.

   Introduce a mission-window aggregate risk state over active and recently committed
   effects, with explicit bounds:
     aggregate_effect_set
     aggregate_effect_keys
     cumulative_exposure
     shared_resource_exposure
     shared_authority_exposure
     dependency_overlap
     common_mode_domains
     global_invariants_at_risk
     retry_load / outstanding_unknowns
     temporal_window

   Pairwise independence is insufficient. Admission must consider the union of
   dependency/effect footprints and global invariant deltas. If any relevant
   dependency, invariant impact, or common-mode relationship is UNKNOWN, the aggregate
   relation is UNKNOWN rather than independent.

   Define effect interaction classes:
     INDEPENDENT
     COMMUTATIVE
     ORDER_SENSITIVE
     RESOURCE_CONTENTION
     EFFECT_COLLISION
     GLOBAL_INVARIANT_INTERACTION
     COMMON_MODE
     UNKNOWN

   Aggregate controls:
     - cumulative risk/exposure budgets per mission, authority domain, resource and
       external system;
     - blast-radius ceilings;
     - concurrency limits for interacting effect classes;
     - serialization where commutativity is not proven;
     - reclassification when a new operation changes aggregate risk materially;
     - circuit breaker when aggregate unknowns or failures cross policy thresholds.

   A sequence must not bypass controls by decomposing one forbidden effect into many
   individually low-risk effects. The system therefore tracks semantic effect lineage
   and parent/child decomposition. A child operation cannot collectively exceed the
   authority/guarantee envelope of its governed parent mission/effect decomposition.

   Dynamic escalation:
     if cumulative exposure crosses a threshold, freeze new admissions in the affected
     domain, re-evaluate active operations, and require stronger governance/verification.
     Escalation cannot retroactively authorize already-forbidden effects; in-flight
     operations follow their governed transition rules and may require drain/reconcile.

   Retry traffic is included in exposure accounting because retries consume shared
   resources and can amplify a localized dependency failure into a system-wide event.
   Retry storms therefore count toward resource/blast-radius budgets.

   New obligations:
     INV-336 aggregate mission risk is not the sum of isolated labels only; interaction
              structure and global invariants must be considered.
     INV-337 pairwise independence does not prove global safety when common-mode/global
              dependencies exist.
     INV-338 UNKNOWN dependency/invariant interaction cannot be treated as independent.
     INV-339 decomposition cannot bypass a parent effect's authority/guarantee envelope.
     INV-340 cumulative exposure/blast-radius budgets can freeze new admissions.
     INV-341 material aggregate-risk change triggers reclassification before additional
              critical admission.
     INV-342 retry load contributes to shared-resource/blast-radius exposure.
     INV-343 aggregate-risk escalation cannot retroactively authorize forbidden effects.
*)


(* DYNAMIC RISK DRIFT / IN-FLIGHT ADMISSION REVALIDATION

   An admission decision is a bounded statement about a specific effect under a
   specific policy/world/dependency/risk boundary. It is not permanent authority.
   Risk may drift after admission because world state, policy, authority, dependency
   topology, cumulative exposure, target capability, or evidence freshness changes.

   Bind each admitted effect to an admission_epoch containing at least:
     risk_profile_version
     policy_version
     authority_epoch
     dependency_graph_version
     world_precondition/version
     target_consistency capability
     aggregate-risk budget version
     evidence freshness boundary
     expiry / revalidation deadline

   Drift classes:
     BENIGN_REPRESENTATION_DRIFT
     WORLD_PRECONDITION_DRIFT
     POLICY_DRIFT
     AUTHORITY_DRIFT
     DEPENDENCY_DRIFT
     TARGET_CAPABILITY_DRIFT
     EVIDENCE_FRESHNESS_DRIFT
     AGGREGATE_RISK_DRIFT
     UNKNOWN_DRIFT

   Revalidation policy must be effect-class-specific:
     reversible/low-risk operations may continue under bounded stale windows if policy
       explicitly permits;
     high/critical operations require current admission conditions before irreversible
       transitions;
     material drift fences new external effects and routes the operation to REVALIDATE,
       DRAIN, RECONCILE, ABORT, or HUMAN_REQUIRED according to its cancellation and
       observability class.

   A policy change does not retroactively erase historical authorization, but it can
   invalidate future execution under the old admission. An in-flight irreversible
   effect that already crossed the external boundary cannot be assumed cancellable.

   Revalidation must not become an infinite loop. Every effect has a revalidation budget
   and stability policy; repeated material drift leads to REVALIDATION_UNSTABLE/BLOCKED
   or governed escalation rather than unbounded autonomous cycling.

   No stale admission may be renewed merely by copying its prior decision. Renewal is
   a new decision with fresh evidence and current policy/authority/risk evaluation.

   New obligations:
     INV-344 admission is bounded by an explicit admission epoch/version set.
     INV-345 material policy/authority/world/dependency/risk drift invalidates future
              critical execution until revalidated.
     INV-346 historical authorization is preserved and is not rewritten by later policy.
     INV-347 external irreversible effects already dispatched cannot be assumed cancellable.
     INV-348 admission renewal is a new governed decision, not copied authority.
     INV-349 repeated revalidation drift has bounded progress and can enter BLOCKED/
              REVALIDATION_UNSTABLE.
     INV-350 stale admission cannot silently increase autonomy.
*)
