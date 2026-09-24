# NEXO CONSTITUTIONAL TRUST ANCHOR FAILURE SUCCESSION MULTI-ANCHOR GOVERNANCE EMERGENCY RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## 1. Research question
What happens when the ConstitutionalTrustAnchor itself fails, is compromised, disputed, or undergoing succession, while normal constitutional orderers are unavailable?

External cross-checks:
- Generalized Byzantine quorum research supports expressing trust as richer structures than a single threshold and emphasizes that trust assumptions determine safety. citeturn0academia2turn0academia0
- Byzantine reconfiguration research shows that replacing compromised replicas/configurations is itself a protocol problem and can require explicit mechanisms to prevent superseded configurations from regaining authority. citeturn0academia1
These sources support the architectural direction but do not prove Nexo's design.

## 2. First distinction
Anchor conditions must be separated:
ANCHOR_HEALTHY
ANCHOR_DEGRADED
ANCHOR_UNAVAILABLE
ANCHOR_CONFLICT
ANCHOR_COMPROMISED
ANCHOR_SUCCESSION_PENDING
ANCHOR_SUCCESSION_COMMITTED
ANCHOR_REVOKED

These states have different semantics.

## 3. Anchor failure
If the constitutional anchor becomes unavailable but there is no evidence of compromise or conflicting successor:
- freeze new constitutional transitions;
- preserve existing independently enforceable safety fences;
- permit observation/reconciliation;
- do not create new current constitutional authority.

This is an availability failure, not permission to self-promote recovery.

## 4. Anchor conflict
If two anchor contexts are simultaneously presented:
A_anchor
B_anchor

and neither has authoritative precedence:
ANCHOR_CONFLICT
→ CONSTITUTIONAL_AUTHORITY_UNAVAILABLE.

Neither side may promote itself merely because it has local quorum.

## 5. Anchor compromise
If the anchor itself is suspected compromised:
- do not automatically trust certificates produced after the compromise boundary;
- establish compromise cutoff;
- invalidate descendants whose safety depends on compromised anchor context;
- preserve historical provenance separately;
- require successor trust context;
- revalidate current claims.

Important:
ANCHOR_SIGNATURE_VALIDITY != ANCHOR_TRUSTWORTHINESS.

## 6. Anchor succession
Succession must be distinct from ordinary recovery.

Candidate:
AnchorSuccessionContract {
  predecessor_anchor,
  successor_anchor,
  succession_rule,
  transition_id,
  ordering_domain,
  cutoff,
  descendant_invalidation,
  enforcement requirements,
  emergency semantics,
  governance boundary
}

The successor cannot establish its own succession solely by asserting itself as successor.

## 7. Multi-anchor composition
Multiple anchors may be composed using an explicit trust formula.

Candidate:
AnchorCompositionContract

Possible forms:
- AND;
- OR;
- threshold;
- weighted;
- mandatory anchor plus quorum;
- independent organizational classes;
- conditional composition.

Generalized Byzantine quorum research supports explicit composition of heterogeneous trust assumptions rather than assuming one universal threshold. citeturn0academia0turn0academia2

But:
MULTI_ANCHOR != INDEPENDENT_ANCHOR.

All anchors can share a common KMS, update source, operator, firmware, legal control, or network.

## 8. Common-mode anchor compromise
Candidate:
AnchorDependencyClosure

For each anchor, track:
- hardware;
- firmware;
- host/hypervisor;
- identity;
- KMS;
- policy;
- update source;
- administrator;
- governance;
- recovery mechanism;
- observation infrastructure.

If all anchor paths converge on a dependency capable of falsifying the protected claim, they are correlated for that failure mode.

## 9. Governance dispute
Human governance can be an external constitutional root only if its decision rule is explicit.

Candidate:
GovernanceDecisionContract {
  governing identities,
  membership,
  quorum/rule,
  failure model,
  conflict resolution,
  succession,
  scope,
  evidence,
  revocation,
  audit
}

A governance dispute is not solved by choosing the largest faction unless the constitutional rule explicitly defines that as the authoritative mechanism.

## 10. Loss of all normal orderers
If all normal COD members are unavailable:
CONSTITUTIONAL_ORDERER_LOST.

Permitted:
- safety preservation;
- fencing;
- evidence retention;
- reconciliation;
- prepare emergency transition.

Forbidden:
- declare a new root from snapshot;
- promote a local recovery node;
- create new constitutional authority without preauthorized succession.

## 11. Bounded emergency safety mode
A bounded emergency mode is possible only as a pre-existing constitutional capability.

Candidate:
EmergencySafetyMode

It may:
- enforce existing safety constraints;
- maintain STOP;
- activate preauthorized resource-side fences;
- preserve evidence;
- reconcile external state;
- block new authority-granting effects.

It may not:
- redefine constitutional rules;
- expand its own scope;
- create a new root unless succession was explicitly preauthorized;
- declare itself current constitutional authority.

Therefore:
EMERGENCY_SAFETY != EMERGENCY_CONSTITUTIONAL_AUTHORITY.

## 12. Emergency root succession
A preauthorized emergency successor can exist.

But its allowed transition must be frozen before the emergency, including:
- exact successor identity or admissible successor class;
- allowed scope;
- trigger conditions;
- required evidence;
- ordering rule;
- descendant invalidation;
- maximum duration;
- revalidation;
- return-to-normal path.

If these rules are themselves disputed:
EMERGENCY_AUTHORITY_UNRESOLVED.

## 13. Multi-anchor failure
If anchor A fails but B remains trusted:
B may continue only for claims whose trust contract explicitly permits B alone.

If A+B were previously required:
loss of A must degrade or invalidate the affected claim.

No silent:
A+B -> B

unless the contract says B-alone is sufficient.

## 14. Anchor compromise after prior certificates
If A was trusted at time t1 and compromised at t2:
certificates before t2 may retain historical validity.
certificates after t2 may require invalidation/revalidation.
Claims spanning t1-t2 need temporal context.

Therefore:
HISTORICAL_AUTHENTICITY != CURRENT_AUTHORITY.

## 15. Stale snapshot during anchor failure
A node restores:
Anchor A
Contract C1
Membership M1

while current system has:
Anchor B pending
Contract C2 pending.

Snapshot cannot decide which state is current.

Node enters:
QUARANTINED
→ CONTEXT_DISCOVERY
→ ANCHOR_STATUS_CHECK
→ SUCCESSION_CHECK
→ CONTRACT_CHECK
→ MEMBERSHIP_CHECK
→ AUTHORITY_CHECK
→ RELEASE only if currentness is independently established.

## 16. Recovery during anchor loss
Recovery authority is not constitutional authority.

Recovery may:
- preserve state;
- fence;
- reconcile;
- prepare successor transition.

Recovery may not:
- rewrite succession rules;
- manufacture a new constitutional anchor;
- convert its own recovery credential into constitutional authority.

## 17. Anchor conflict graph
Candidate:
AnchorTrustGraph

Nodes:
anchors, succession certificates, governance decisions, membership configurations, contract versions, recovery certificates, evidence, dependencies.

Edges:
AUTHORIZES
SUCCEEDS
DEPENDS_ON
INVALIDATES
CONFLICTS_WITH
SUPPORTS
PRESERVES

Current anchor requires a path to the constitutional trust boundary that does not depend circularly on the candidate anchor's own currentness.

## 18. Anti-circularity condition
For candidate anchor A:
A_CURRENT cannot be justified solely by evidence, authority, contract, or succession state whose validity depends on A_CURRENT.

Equivalent candidate:
A_CURRENT is not permitted to be justified solely by its own transitive support closure unless an explicitly external axiom/root breaks the cycle.

## 19. Anchor failure state machine
NORMAL
→ DEGRADED
→ UNAVAILABLE / COMPROMISED / CONFLICT / SUCCESSION_PENDING
→ SUCCESSION_EVALUATION
→ SUCCESSOR_PREPARED
→ PREDECESSOR_CUTOFF
→ DESCENDANT_INVALIDATION
→ ENFORCEMENT_VERIFIED
→ SUCCESSOR_ACTIVE
→ CONTRACT_REVALIDATION
→ RECOVERY_REVALIDATION
→ CURRENT

Failure at any protected step:
AUTHORITY_UNAVAILABLE or QUARANTINED.

## 20. Anchor composition safety
Candidate:
ANCHOR_COMPOSITION_VALID(Aset, claim)

requires:
- explicit composition rule;
- current membership;
- current root context;
- failure-domain closure;
- common-mode closure;
- no unresolved equivocation;
- current succession state;
- claim-specific independence;
- protected publication.

No generic count of anchors is sufficient.

## 21. Constitutional boundary
This research clarifies the ultimate boundary:

The architecture cannot prove its own foundational trust assumption from entirely inside that assumption.

Therefore Nexo must explicitly declare:
CONSTITUTIONAL_TRUST_BOUNDARY

The boundary can be:
- immutable artifact;
- external governance;
- hardware-backed root plus governance;
- multi-organization trust structure;
- another explicitly specified external assumption.

The architecture then proves properties conditional on that boundary.

## 22. Important consequence
The absence of a constitutional trust anchor does not mean the whole system must become inert.

It means authority must be partitioned.

Possible safety-only capabilities:
- STOP;
- resource-side fencing;
- observation;
- evidence preservation;
- reconciliation;
- non-authoritative simulation;
- preparation of candidate transitions.

But:
NO_NEW_CONSTITUTIONAL_AUTHORITY.

## 23. New invariants
ATA-01: Anchor availability is distinct from anchor currentness.
ATA-02: Anchor conflict yields unresolved constitutional authority unless externally ordered.
ATA-03: Anchor compromise invalidates/revalidates dependent descendants according to explicit cutoff.
ATA-04: Anchor succession is a protected constitutional transition.
ATA-05: A successor cannot self-authorize its own succession.
ATA-06: Multi-anchor composition requires explicit trust algebra.
ATA-07: Multi-anchor count does not establish independence.
ATA-08: Common-mode dependencies are part of anchor trust.
ATA-09: Loss of a required anchor cannot silently degrade a claim unless the contract permits it.
ATA-10: Emergency safety mode cannot create constitutional authority.
ATA-11: Recovery authority cannot redefine constitutional succession.
ATA-12: Snapshot restore cannot restore current anchor authority.
ATA-13: Historical anchor validity does not imply current anchor authority.
ATA-14: Governance decisions require explicit constitutional rules.
ATA-15: Loss of all orderers produces authority-unavailable, not local winner selection.
ATA-16: Constitutional trust assumptions terminate at an explicit trust boundary.
ATA-17: Anchor composition and succession must be non-circular.
ATA-18: Safety-only operation may continue without current constitutional authority only within preauthorized bounds.
ATA-19: External enforcement truth remains separate from anchor currentness.
ATA-20: Concrete implementation must refine the anchor succession abstract machine.

## 24. Architecture consequence
The top-level architecture is now:
CONSTITUTIONAL TRUST BOUNDARY
        ↓
CONSTITUTIONAL TRUST ANCHOR
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
STOP
RECOVERY FENCE
INVALIDATION
DEPENDENCY CLOSURE
COMMON-MODE ANALYSIS
EVIDENCE/PROVENANCE
FORMAL ASSURANCE

The Constitutional Trust Boundary is explicitly conditional: it is not claimed to be internally proven.

## 25. Next gate
The next attack should test whether the architecture can survive:
- total loss of all normal constitutional orderers;
- compromised predecessor anchor;
- disputed successor anchors;
- governance split;
- emergency root activation;
- simultaneous recovery;
- stale snapshots;
- external fence disagreement;
- late-arriving evidence after succession.

The target is a complete AuthorityUnavailable -> bounded safety -> constitutional succession -> revalidation -> release protocol without any step allowing safety mode to become self-authorizing constitutional power.

## Verification status
No SANY/TLC execution.
No TLAPS proof.
No implementation refinement.
No runtime/fault-injection verification.
No correctness guarantee.
