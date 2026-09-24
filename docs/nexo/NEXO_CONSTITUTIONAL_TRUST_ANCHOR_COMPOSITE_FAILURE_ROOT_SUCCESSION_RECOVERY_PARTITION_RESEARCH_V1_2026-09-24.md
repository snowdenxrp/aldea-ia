# NEXO CONSTITUTIONAL TRUST ANCHOR COMPOSITE FAILURE ROOT SUCCESSION RECOVERY PARTITION RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## 1. Composite adversarial scenario
Consider simultaneously:
- Root A and Root B;
- two valid succession certificates;
- Byzantine members;
- membership change;
- contract change;
- emergency recovery;
- common-mode compromise;
- network partition and healing;
- stale snapshot;
- disagreement about external fencing.

The objective is not to find a clever winner. It is to determine which conditions permit a unique current constitutional context and which conditions require authority-unavailable.

## 2. External cross-check
BFT protocols can obtain safety from quorum intersection under explicit fault assumptions; HotStuff is an example where quorum certificates and intersection are part of the safety argument. This does not establish Nexo's broader trust claims because Nexo additionally requires common-mode, root, membership, external enforcement, and claim-specific closure. citeturn0academia25turn0search0
Recent work on heterogeneous and reconfigurable Byzantine quorum systems shows that reconfiguration itself can be formally treated as part of the protocol and that its safety depends on the specific trust structure and transition rules. citeturn0academia26turn0search9
TLA+ safety checking explores reachable states and looks for invariant-violating traces; refinement requires concrete behavior to map to allowed abstract behavior. This supports making the entire composite scenario explicit in the future model. citeturn0search3turn0search4

## 3. First reduction: separate the five questions
The composite case must not be reduced to one boolean.

1. Is the constitutional root current?
2. Is the contract transition current?
3. Is recovery authority current?
4. Is enforcement actually established?
5. What is true in the external world?

These remain distinct:
CONSTITUTIONAL_CURRENTNESS
!= CONTRACT_CURRENTNESS
!= RECOVERY_AUTHORITY
!= ENFORCEMENT_TRUTH
!= WORLD_TRUTH

## 4. Root A / Root B
Suppose A and B each have valid credentials.

Credential validity alone does not establish currentness.

Candidate root state:
- ROOT_A_CURRENT
- ROOT_B_CURRENT
- ROOT_TRANSITION_ORDERED
- ROOT_CONFLICT
- ROOT_UNRESOLVED

If both roots can authorize incompatible transitions and no authoritative succession relation orders them, current root is unresolved.

## 5. Two valid succession certificates
Let:
S1 = A -> B
S2 = B -> A

Even if each certificate is individually valid under the rules it references, they can form a succession cycle.

Candidate:
ROOT_SUCCESSION_GRAPH

Safety condition:
NO_CYCLIC_SUCCESSION_CAN_ESTABLISH_CURRENT_ROOT

unless an independent constitutional rule explicitly defines an ordering/break condition.

A cycle of valid credentials is not a proof of unique succession.

## 6. Byzantine member inside both roots
A member X signs S1 and S2.

Then:
VALID_SIGNATURE(S1)
AND
VALID_SIGNATURE(S2)
does not imply:
COMPATIBLE_SUCCESSION.

Equivocation must be linked to the exact root transition scope and invalidation closure.

Candidate:
RootEquivocationClosure

## 7. Membership change
Membership M1 -> M2 can alter:
- quorum intersection;
- fault tolerance;
- failure-domain diversity;
- root dependencies;
- contract trust formula.

Therefore membership transition must be ordered before the new configuration is allowed to establish constitutional currentness.

Research literature confirms that dynamic BFT membership is itself a protocol problem, not merely a metadata edit. citeturn0search11turn0search12

## 8. Contract change
Suppose C1 -> C2 changes the quorum formula.

Then a certificate produced under C2 cannot be used to justify that C2 is current unless the transition to C2 was already authorized by a valid predecessor/constitutional transition rule.

Otherwise:
C2 defines the rule that validates C2.

Circularity.

## 9. Emergency recovery
Emergency root E may be allowed to preserve safety under bounded preauthorization.

But if E is used to create a new constitutional root or contract outside its preauthorized envelope, it becomes a self-expanding authority path.

Therefore:
EMERGENCY_SCOPE <= PREAUTHORIZED_SCOPE

and:
EMERGENCY_SCOPE cannot be widened by emergency execution itself.

## 10. Common-mode compromise
Suppose A, B, E, membership authority, and evidence observers all depend on one compromised KMS/update source.

Their signatures and certificates may remain cryptographically valid while the trust basis is compromised.

Therefore:
CRYPTOGRAPHIC_VALIDITY != TRUST_INDEPENDENCE

The dependency closure must include common administrative and supply-chain dependencies.

## 11. Partition
During partition:
side A has A/C1/M1;
side B has B/C2/M2.

Each may remain internally consistent.

That does not imply global currentness.

Candidate mode:
CONSTITUTIONAL_PARTITIONED

Allowed:
- preserve;
- fence;
- observe;
- prepare;
- reconcile.

Forbidden:
- silently publish incompatible global currentness.

## 12. Stale snapshot
After healing, a node restores a snapshot containing old root/contract/membership.

Snapshot validity does not restore current constitutional authority.

Therefore:
SNAPSHOT_VALID != CURRENT_CONSTITUTIONAL_CONTEXT

The restored node must re-enter:
QUARANTINED
→ CURRENT_CONTEXT_ATTESTED
→ ROOT/CONTRACT/MEMBERSHIP REVALIDATED
→ RECOVERY AUTHORITY REVALIDATED
→ RELEASE ELIGIBILITY

## 13. External fence disagreement
Side A says fence active.
Side B says fence absent.
Provider says unknown.
Observer says active.

Do not majority-vote these statements into world truth.

Use the existing assurance ladder:
state
→ observation
→ evidence
→ verified claim
→ independent assurance
while retaining common-mode dependencies.

If the protected claim requires fence truth and the conflict cannot be resolved:
EFFECT_PATH_NOT_ASSURED
→ HOLD/QUARANTINE.

## 14. Healing protocol
Candidate:
PARTITION_HEAL_DETECTED
→ FREEZE_CONSTITUTIONAL_ADMISSION
→ COLLECT_ROOT_CONTEXTS
→ COLLECT_CONTRACT_CONTEXTS
→ COLLECT_MEMBERSHIP_CONTEXTS
→ COLLECT_RECOVERY_CERTIFICATES
→ DETECT_EQUIVOCATION
→ BUILD_CONSTITUTIONAL_CONFLICT_CLOSURE
→ BUILD_COMMON_MODE CLOSURE
→ ESTABLISH AUTHORITATIVE ORDER
→ SELECT CURRENT ROOT
→ FENCE STALE DESCENDANTS
→ REVALIDATE CONTRACT
→ RECOMPUTE MEMBERSHIP/QUORUM TRUST
→ REVALIDATE RECOVERY AUTHORITY
→ RECONCILE EXTERNAL EFFECTS
→ RECOMPUTE ASSURANCE
→ PUBLISH CURRENT OR AUTHORITY_UNRESOLVED

No shortcut from connectivity restoration to authority restoration.

## 15. Important result: healing is not convergence by itself
Network reachability after partition does not tell us which side's authority is current.

Therefore:
PARTITION_HEALED != AUTHORITY_CONVERGED

Likewise:
LOCAL_REACHABILITY != GLOBAL_CONSTITUTIONAL_ORDER.

## 16. Composite authority context
Candidate:
ConstitutionalContinuityContext {
  constitutional_anchor_generation,
  root_generation,
  root_transition_id,
  contract_generation,
  contract_transition_id,
  membership_generation,
  recovery_epoch,
  ordering_domain,
  ordering_position,
  common_mode_fingerprint,
  dependency_closure,
  capability_lineage,
  fence_generation,
  enforcement_assurance_generation,
  partition/reconciliation generation,
  stale_snapshot boundary,
  invalidation generation
}

This context is not itself authority. It is a binding identity for evaluating currentness.

## 17. Currentness predicate
Candidate:
CURRENT_CONSTITUTIONAL_CONTEXT(C) iff:
- anchor is current;
- root transition is ordered;
- root is current;
- contract transition is ordered;
- membership transition is valid;
- trust formula is satisfied;
- no unresolved equivocation;
- common-mode closure satisfies the claim;
- stale predecessors are fenced/invalidated;
- recovery authority is separately current;
- required enforcement is verified;
- publication occurs at the protected boundary.

If any mandatory condition is UNKNOWN:
the affected claim cannot be promoted to CURRENT.

## 18. Minimal safety theorem candidate
Candidate theorem:
If two contexts C1 and C2 are both published CURRENT for the same protected scope, then either:
A) they are semantically compatible under the exact claim contract, or
B) the architecture is unsafe.

Therefore the target invariant is:
NO_INCOMPATIBLE_CURRENT_CONSTITUTIONAL_CONTEXTS.

This is a candidate theorem/invariant, not proved.

## 19. Constitutional trust anchor composition
The trust anchor can be:
- immutable constitutional artifact;
- externally governed root set;
- hardware-backed root plus explicit governance;
- independent organizational quorum;
- formally specified trust root.

But the composition must itself have a non-circular foundation.

Candidate:
ConstitutionalTrustAnchorContract

Fields:
anchor_id,
generation,
succession_rule,
membership_rule,
fault_model,
failure_domain_rules,
root_dependency_rules,
contract_transition_rules,
emergency_scope,
equivocation_rules,
ordering authority,
invalidation rules,
external governance boundary,
revalidation rules.

## 20. Important boundary: no universal independence
Even a constitutional anchor with multiple organizations is not automatically independent.

Independence remains claim-specific and must account for:
- shared operators;
- common KMS;
- common software supply chain;
- common update channel;
- common network;
- common identity provider;
- common legal/governance control.

This preserves the earlier:
MULTI_WITNESS != INDEPENDENT_ASSURANCE.

## 21. What the architecture can guarantee structurally
At the design level, we can require:
- no self-authorized root transition;
- no incompatible current contexts;
- no currentness without ordered activation;
- no authority from stale snapshot;
- no emergency self-expansion;
- no quorum-only independence claim;
- no unresolved Byzantine conflict promoted to currentness;
- no external effect claim from internal state alone.

These are architectural requirements, not verified guarantees.

## 22. What it cannot guarantee internally
The architecture cannot manufacture:
- honesty of an external governance root;
- absence of compromise outside its trust boundary;
- truth of an uncontrolled external world;
- external causal control where no enforcement boundary exists;
- unique constitutional authority if all roots/orderers are inside the unresolved conflict.

In the last case:
CONSTITUTIONAL_AUTHORITY_UNAVAILABLE is the correct terminal state.

## 23. Formal model target
The next abstract model should be decomposed into modules:
A. ConstitutionalTrustAnchor
B. RootSuccession
C. ContractTransition
D. MembershipTransition
E. ByzantineEquivocation
F. ConstitutionalOrdering
G. RecoveryAuthority
H. Enforcement
I. ExternalEffect/Reconciliation

The composition must preserve the distinction between safety claims and liveness.

## 24. Verification target
Future model-checking should deliberately include:
- two roots;
- conflicting succession;
- Byzantine equivocation;
- membership overlap/non-overlap;
- contract quorum changes;
- emergency root;
- common-mode compromise;
- partitions;
- healing;
- stale snapshot;
- conflicting fence evidence.

The desired result is not simply PASS. Counterexample traces are especially valuable because they can reveal missing transition guards. TLA+ safety checking is explicitly based on finding reachable states that violate invariants and returning a trace to the violating state. citeturn0search3

## 25. New invariants
CTC-01: Root credential validity does not imply root currentness.
CTC-02: Two valid succession certificates may still be incompatible.
CTC-03: Succession cycles cannot establish currentness without an external ordering rule.
CTC-04: Membership changes are constitutional transitions.
CTC-05: Contract changes are constitutional transitions.
CTC-06: Emergency recovery cannot exceed its preauthorized constitutional scope.
CTC-07: Common-mode compromise can invalidate apparent quorum independence.
CTC-08: Partition healing does not itself restore authority.
CTC-09: Snapshot restoration cannot restore current constitutional context.
CTC-10: Conflicting enforcement evidence cannot be majority-voted into world truth.
CTC-11: Currentness requires a coherent ConstitutionalContinuityContext.
CTC-12: Unknown mandatory dependency prevents promotion to currentness.
CTC-13: No incompatible current constitutional contexts may coexist for the same protected scope.
CTC-14: Constitutional trust-anchor composition must have an external/non-circular foundation.
CTC-15: If no authoritative ordering remains, constitutional authority is unavailable.
CTC-16: Constitutional currentness does not imply external effect success.
CTC-17: Concrete implementation must refine the abstract composite transition system.

## 26. Architectural consequence
The top-level design is now more precise:

CONSTITUTIONAL TRUST ANCHOR
  └── ConstitutionalTrustAnchorContract
        ↓
CONSTITUTIONAL ORDERING DOMAIN
        ↓
CONTRACT TRANSITION AUTHORITY
        ↓
RECOVERY TRUST CONTRACT
        ↓
RECOVERY AUTHORITY
        ↓
ASSURANCE / ENFORCEMENT
        ↓
EXTERNAL EFFECT + RECONCILIATION

Cross-cutting:
- STOP
- RECOVERY FENCE
- INVALIDATION
- DEPENDENCY CLOSURE
- COMMON-MODE ANALYSIS
- EVIDENCE/PROVENANCE
- FORMAL ASSURANCE

## 27. Next research gate
The remaining question is no longer merely whether the architecture can detect conflicts.

It is whether the proposed ConstitutionalTrustAnchorContract can itself be represented as a finite, explicit, auditable trust boundary without hiding an undeclared authority assumption.

Next attack:
ANCHOR SUCCESSION + ANCHOR COMPROMISE + MULTI-ANCHOR COMPOSITION + GOVERNANCE DISPUTE + RECOVERY UNDER LOSS OF ALL NORMAL ORDERERS.

The target is to distinguish:
ANCHOR_FAILURE
ANCHOR_CONFLICT
ANCHOR_COMPROMISE
ANCHOR_SUCCESSION_PENDING
AUTHORITY_UNAVAILABLE
and determine which, if any, permit a bounded emergency safety mode.

## Verification status
No SANY/TLC execution.
No TLAPS proof.
No implementation refinement.
No runtime/fault-injection verification.
No correctness guarantee.
