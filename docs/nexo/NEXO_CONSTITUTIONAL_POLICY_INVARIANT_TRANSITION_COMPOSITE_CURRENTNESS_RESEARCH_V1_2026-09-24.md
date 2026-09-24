# NEXO — Policy/Invariant Transition Concurrent with Root Membership Quorum Succession V1 — 2026-09-24

Status: RESEARCH ONLY. No V21 implementation. No SANY/TLC/TLAPS/runtime/deployment verification claimed.

## 1. Objective
Attack the composite succession boundary when constitutional root, ordering, membership, quorum, policy, and invariants change concurrently or are observed in mixed generations.

## 2. Central finding
Policy and invariant generations are not passive metadata. If they determine whether a succession transition is authorized or safe, their transition belongs inside the protected succession context.

`ROOT + MEMBERSHIP + QUORUM + POLICY VALID` independently does not imply a valid composite transition.

## 3. New object: ConstitutionalTransitionContext
Candidate fields:
- transition_id
- constitutional_generation
- root/trust generation
- ordering generation
- membership generation
- key generation
- quorum contract generation
- policy generation
- invariant generation
- semantic/protocol domain
- predecessor/successor
- branch context
- causal bridge
- dependency/common-mode closure
- invalidation set
- effect/enforcement closure
- evidence/assurance context
- publication state.

## 4. Mixed-policy attack
Suppose:
- R1 is current under constitutional generation C2;
- membership M3 is valid;
- quorum Q3 is valid;
- policy P4 exists;
- invariant set I4 exists.

A certificate produced under P3/I3 cannot automatically authorize a transition requiring P4/I4.

`POLICY_VALID != POLICY_CURRENT`.
`INVARIANT_VALID != INVARIANT_CURRENT`.

## 5. Policy transition is itself a protected transition
A policy update that changes:
- allowed effects;
- quorum thresholds;
- delegation limits;
- recovery permissions;
- root succession;
- enforcement requirements;
- claim publication rules

can change authority semantics.

Therefore:
`POLICY_CHANGE != CONFIG_CHANGE`
when the policy affects protected authority.

## 6. Invariant transition is stronger than version change
A new invariant generation may strengthen, weaken, replace, or reinterpret a safety condition.

Version number alone cannot establish compatibility.

Candidate compatibility classes:
I0 exact same semantics
I1 explicitly equivalent
I2 stronger for this claim
I3 weaker but explicitly permitted degraded claim
I4 incompatible
I5 unknown.

Unknown compatibility must not be treated as I2.

## 7. Stronger-policy migration race
Suppose:
P0 permits effect E.
P1 forbids E.

Race:
A admits E under P0.
P1 becomes current.
A has not yet crossed the protected effect boundary.

The system must define the exact cutoff between:
- admission;
- durable intent;
- fence;
- execution;
- external attempt.

`VALID_AT_ADMISSION != VALID_AT_EXECUTION`.

A policy transition must invalidate or revalidate protected pending work according to the contract.

## 8. Weaker-policy migration race
Suppose:
P0 requires 4/7.
P1 requires 3/5.

If a branch adopts P1 during quorum loss, it cannot silently use P1 to authorize transitions that the predecessor context forbade.

Policy downgrade requires an explicit constitutional transition and scope.

`POLICY_DOWNGRADE != AVAILABILITY_FALLBACK`.

## 9. Invariant strengthening
If I1 strengthens I0, old assurance may remain historically true but insufficient for current claims.

`OLD_PROOF_VALID != CURRENT_ASSURANCE`.

A claim can be preserved only if the proof/refinement context demonstrates the stronger invariant.

## 10. Invariant weakening
If I1 weakens I0, old evidence does not automatically gain new authority.

A weaker invariant cannot retroactively authorize an effect that was not authorized under the previous constitution unless the new policy explicitly defines such transition semantics.

## 11. Policy/root circularity
Danger:
candidate root R1 changes policy P1,
P1 declares R1 authorized,
R1 then cites P1 as proof of succession.

This is another self-supporting SCC.

`CANDIDATE_SUCCESSOR ightarrow POLICY_CHANGE ightarrow CANDIDATE_SUCCESSOR`
requires an independent constitutional root/order basis.

## 12. Policy/membership circularity
Danger:
new membership M1 approves policy P1,
P1 declares M1 the valid membership,
M1 is then used to prove P1 valid.

No currentness can be derived from this cycle without an external/protected predecessor basis.

## 13. Quorum-policy race
A quorum certificate under Q0 cannot be interpreted using Q1 merely because Q1 is now current.

The certificate must carry its quorum contract and generation.

If Q1 is incompatible, the certificate may remain historical but cannot support the new claim.

## 14. Root-policy race
Root R1 may be valid under P0 but P1 may change the rules for successor activation.

Therefore R1 currentness requires:
- correct root;
- correct policy context;
- correct ordering;
- required invariant context;
- current membership/quorum;
- enforcement.

No individual component can substitute for the composite context.

## 15. Policy semantic translation
When migrating P0 → P1 through an adapter/translation:
`REPRESENTATION_COMPATIBILITY != AUTHORIZATION_COMPATIBILITY`.

Security-relevant meanings must be preserved or the claim must degrade.

Unknown security fields/defaults cannot silently widen authority.

## 16. Parser/schema consequence
A policy certificate can be cryptographically valid while being interpreted differently by two components.

Therefore the policy context must bind:
- schema version;
- parser profile;
- canonicalization;
- algorithm profile;
- protocol domain;
- security-relevant field closure;
- extension handling;
- downgrade rules.

This preserves the earlier rule:
`CRYPTOGRAPHIC_VALIDITY != SEMANTIC_VALIDITY`.

## 17. Policy transition and compaction
Compaction must retain the policy/invariant generations needed to interpret historical authorization.

If P0 context is deleted and only "approved" remains, later P1 code may misinterpret the historical approval.

Thus:
`APPROVED != APPROVED_UNDER_CURRENT_POLICY`.

## 18. Recovery after policy transition
A restored snapshot may contain:
R1 + M2 + Q2 + P2 + I2.

But current state may be:
R2 + M3 + Q3 + P4 + I4.

Recovery must not treat the snapshot tuple as current merely because each artifact is internally valid.

It must establish a current transition context and revalidate all components.

## 19. Composite currentness predicate
Candidate abstract predicate:
`CURRENT_COMPOSITE_CONTEXT(T)` iff:
- root context current;
- ordering current;
- membership current;
- quorum contract current;
- policy current;
- invariant context compatible/current;
- dependency closure current;
- invalidations absent;
- branch/order resolved;
- resource/effect/enforcement context compatible;
- evidence/assurance current for exact claim;
- protected publication boundary crossed.

This is a predicate, not a single integer generation.

## 20. Compatibility matrix
The architecture should eventually compute pairwise and setwise compatibility among:
- root;
- ordering;
- membership;
- quorum;
- policy;
- invariant;
- protocol/schema;
- trust;
- dependencies;
- resource;
- effect;
- enforcement.

Pairwise compatibility is not sufficient if a higher-order interaction exists.

`PAIRWISE_COMPATIBLE != SETWISE_COMPATIBLE`.

## 21. Higher-order counterexample
A may be compatible with B.
B compatible with C.
A compatible with C.

Yet:
A+B+C can be unsafe because their combined assumptions conflict.

Therefore composite succession requires a setwise composition contract, not only pairwise checks.

## 22. Temporal overlap
Transitions may have valid intervals that do not overlap.

A policy P1 may be valid after root R1 becomes current, while quorum Q2 was valid only before R1.

Historical validity cannot create current composite validity across a temporal gap.

Candidate:
`ContextOverlapContract`.

## 23. Causal bridge
Even if versions appear compatible, we need a protected causal bridge:
- predecessor transition;
- successor transition;
- ordering;
- policy migration;
- membership migration;
- invariant migration;
- dependency transition.

No causal bridge:
`CURRENTNESS = UNKNOWN`.

## 24. Degraded mode
If one component is unknown, the system can publish only a claim whose scope is proven safe under that uncertainty.

Examples:
- safety fence maintained;
- no new constitutional transitions;
- no new mission authority;
- historical attribution only;
- quarantine.

Unknown policy compatibility cannot become normal authority.

## 25. Policy emergency path
Emergency policy changes must themselves be effect paths and authority transitions.

They require:
- exact scope;
- expiry;
- successor policy;
- protected root/order basis;
- audit/provenance;
- anti-amplification;
- rollback/reconciliation semantics.

Emergency mode cannot become a second constitution.

## 26. Formal model implications
Future model must include:
- policy generations;
- invariant generations;
- root/membership/order/quorum generations;
- policy transitions;
- invariant transitions;
- mixed-generation bundles;
- policy downgrade/upgrade;
- concurrent admission;
- compaction/restore;
- schema/parser context;
- emergency policy.

Candidate invariants:
PCI-01 NO_MIXED_CONSTITUTIONAL_CONTEXT
PCI-02 POLICY_CURRENTNESS_REQUIRED_FOR_CURRENT_AUTHORITY
PCI-03 INVARIANT_COMPATIBILITY_REQUIRED
PCI-04 POLICY_CHANGE_IS_PROTECTED_WHEN_AUTHORITY_RELEVANT
PCI-05 POLICY_DOWNGRADE_REQUIRES_EXPLICIT_AUTHORIZATION
PCI-06 OLD_PROOF_CANNOT_AUTOMATICALLY_SUPPORT_STRONGER_CURRENT_INVARIANT
PCI-07 WEAKER_POLICY_CANNOT_RETROACTIVELY_AMPLIFY_OLD_AUTHORITY
PCI-08 POLICY_ROOT_CYCLE_CANNOT_SELF_AUTHORIZE
PCI-09 POLICY_MEMBERSHIP_CYCLE_CANNOT_SELF_AUTHORIZE
PCI-10 QUORUM_CERTIFICATE_BINDS_QUORUM_POLICY_GENERATION
PCI-11 PAIRWISE_COMPATIBILITY_CANNOT_ESTABLISH_SETWISE_COMPATIBILITY
PCI-12 TEMPORAL_GAPS_BLOCK_CURRENT_COMPOSITE_CLAIM
PCI-13 MISSING_CAUSAL_BRIDGE_BLOCKS_CURRENTNESS
PCI-14 RESTORE_CANNOT_CREATE_CURRENT_COMPOSITE_CONTEXT
PCI-15 EMERGENCY_POLICY_CANNOT_AMPLIFY_CONSTITUTIONAL_SCOPE
PCI-16 SECURITY_SEMANTICS_MUST_BE_PRESERVED_ACROSS_POLICY_TRANSLATION.

NIST SP 800-193 explicitly treats protection, detection, and recovery as separate resiliency functions and places Roots of Trust/Chains of Trust as foundational to those functions, supporting the architectural decision that policy/update/recovery changes affecting the trust foundation must be treated as protected security transitions rather than ordinary configuration edits. citeturn0search24turn0search0

TLA+ can later model these concurrent transitions as state-machine behavior and check invariants; refinement mappings can then relate the implementation-level transition system to the abstract constitutional transition. citeturn0search3turn0search25

## 27. New synthesis
The protected object has expanded from:
`SUCCESSION_TRANSITION_CONTEXT`
to:
`CONSTITUTIONAL_TRANSITION_CONTEXT`.

Current authority is now conceptually:

`CURRENTNESS = f(root, order, membership, quorum, policy, invariant, trust, dependency, branch, invalidation, effect, enforcement, time/causal compatibility)`.

No single generation number can represent this safely.

## 28. Open gaps
PCI-G1 Formal compatibility algebra for constitutional dimensions.
PCI-G2 Setwise/higher-order compatibility.
PCI-G3 Policy/invariant transition ordering.
PCI-G4 Policy downgrade/upgrade formal semantics.
PCI-G5 Emergency policy anti-amplification.
PCI-G6 Schema/parser policy migration refinement.
PCI-G7 Compaction of constitutional transition context.
PCI-G8 Permanent policy/order uncertainty.
PCI-G9 Implementation refinement.
PCI-G10 SANY/TLC/TLAPS validation.

## 29. Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement proof. No runtime/fault-injection/deployment correctness claim.