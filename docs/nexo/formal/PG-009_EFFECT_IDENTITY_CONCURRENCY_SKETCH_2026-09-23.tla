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
