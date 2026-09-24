NEXO - TCB COMPOSITION / MULTIPLE TRUST FOUNDATIONS / COMMON-MODE / ASSURANCE-AUTHORITY CROSSING RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
If strong claims use different Trust Foundations, can Nexo compose them without creating a hidden common root or silently promoting a weaker foundation into stronger authority?

EXTERNAL CROSS-CHECKS
NIST describes Roots of Trust as highly reliable components performing specific critical security functions and notes that stronger assurances may require roots of trust. Its firmware resiliency guidance also notes that complex platforms may require multiple independent roots/chains for comprehensive coverage. cite: turn0search1, turn0search30.
TUF separates responsibilities and trust scopes through roles, supports threshold signatures, and treats key compromise as a condition to recover from rather than an impossible event. This supports explicit trust-scope and common-mode analysis, but is not a direct Nexo protocol requirement. cite: turn0search2, turn0search3, turn0search7.
TLA+ composition/refinement requires the composed implementation to satisfy the higher-level specification under explicit mappings and assumptions; conjunction alone does not justify arbitrary cross-claim composition. cite: turn0search25, turn0search26, turn0search28.

CORE RESULT
Different trust foundations can be composed only at the level justified by their shared dependencies, interaction closure, and claim contracts.
FOUNDATION_A_VALID + FOUNDATION_B_VALID != COMPOSITE_FOUNDATION_VALID.
Likewise:
CLAIM_A_VERIFIED + CLAIM_B_VERIFIED != MISSION_C_VERIFIED.

TRUST FOUNDATION LATTICE
Candidate relation:
FOUNDATION -> CLAIM_SCOPE -> PROTECTED PROPERTY -> TCB CLOSURE -> ENFORCEMENT BOUNDARY -> AUTHORITY CONSEQUENCES.
A foundation is not globally strong or weak; its assurance is claim-relative.
Candidate strengths: FOUNDATION_LOCAL, FOUNDATION_EFFECT, FOUNDATION_RESOURCE, FOUNDATION_BOUNDARY, FOUNDATION_MISSION, FOUNDATION_GLOBAL.
A weaker foundation must not silently satisfy a stronger claim.

COMMON ROOT HAZARD
Suppose Claim A uses Root A and Claim B uses Root B.
If both depend on Root X for update, identity, policy, recovery, storage, or enforcement, Root X is a common-mode dependency.
Therefore:
MULTIPLE ROOTS != INDEPENDENT ROOTS.
Independence requires failure-domain closure, not merely different keys, processes, hosts or vendors.

COMPOSITION CATEGORIES
C0 DISJOINT: no claim-relevant dependency/interaction.
C1 SHARED-BUT-IRRELEVANT: shared dependency exists but cannot affect the composed claim.
C2 SHARED-COORDINATED: shared dependency requires an explicit common safety order.
C3 INTERLOCKED: foundations jointly determine a safety invariant.
C4 UNKNOWN: closure or interaction is incomplete.
C3 requires an explicit composition contract; C4 blocks strong composition.

ASSURANCE-AUTHORITY CROSSING
A proof or assurance result may support an admission decision, but it does not become authority merely by being valid.
Required chain:
PROOF_VALID_FOR_CONTEXT -> ASSURANCE_CURRENT -> OPERATIONALLY_ADMISSIBLE -> CURRENT_AUTHORITY -> PROTECTED_ADMISSION.
No step may be skipped.
Therefore:
PROOF != AUTHORITY
ASSURANCE != AUTHORITY
AUTHORITY != EFFECT_SUCCESS
FENCE != PROOF

WEAK FOUNDATION PROMOTION ATTACK
Foundation A supports a RESOURCE claim.
Foundation B supports a MISSION claim.
If B imports A's resource claim without checking A's claim strength, context, dependency closure and assumptions, A may be silently promoted into a mission authority.
Forbidden rule:
LOWER_CLAIM_ASSURANCE -> AUTOMATIC_HIGHER_CLAIM_AUTHORITY.
Promotion requires a refinement/composition contract proving that the lower claim is sufficient for the higher obligation.

CLAIM-SPECIFIC COMPOSITION
For composite claim C = A AND B:
Required closure includes TCB(A), TCB(B), and all shared dependencies capable of changing either claim or their interaction.
Then evaluate:
1 claim compatibility;
2 assumption compatibility;
3 shared dependency closure;
4 interaction/hypergraph closure;
5 common-mode failures;
6 boundary coverage;
7 current continuity;
8 policy/invariant compatibility;
9 recovery/rollback/update paths;
10 refinement/composition proof obligations.

ASSUMPTION COMPOSITION
Assumptions cannot simply be unioned if they conflict.
Candidate:
EffectiveAssumptions(C) = compatible intersection/constraint composition of all assumptions relevant to C.
If one foundation assumes dependency D is trusted while another claim explicitly models D as potentially compromised, the composite context is not automatically valid.
Contradictory assumptions -> UNKNOWN/HOLD unless a higher-level contract resolves them.

FOUNDATION DEPENDENCY GRAPH
Nodes: claims, foundations, trust roots, authorities, boundaries, resources, policies, proofs, update/recovery mechanisms.
Edges: TRUSTS, DEPENDS_ON, ENFORCES, AUTHORIZES, VERIFIES, UPDATES, RECOVERS, SHARES_ROOT, SHARES_FAILURE_DOMAIN, REFINES, COMPOSES.
Composite TCB is a transitive closure over safety-relevant edges.

HIDDEN COMMON ROOT ATTACKS
Common identity provider can make supposedly independent roots share failure.
Common update channel can make both roots updateable by one compromised path.
Common recovery key can defeat separation.
Common policy store can alter both claims simultaneously.
Common hypervisor/runtime can compromise both enforcement paths.
Common clock can affect both expiry/freshness assumptions.
Common storage rollback can resurrect stale authority in both foundations.
Common operator/break-glass can bypass both.
Common resource/provider can couple supposedly independent claims.

PARTIAL COMPROMISE
If Root A is compromised but Root B remains sound, do not globally mark the entire architecture safe or unsafe.
Compute impacted closure:
Root A -> dependent claims -> authorities -> boundaries -> effects.
Unaffected claims may remain current only if complete disjointness is established.
Unknown overlap -> conservative joint invalidation for the affected composition.
This reuses the selective-invalidation principle but applies it at TCB/foundation level.

FOUNDATION FAILURE STATES
CURRENT
DEGRADED
COMPROMISED
UNKNOWN
QUARANTINED
REVALIDATING
SUPERSEDED
FOUNDATION_RETIRED
A composite claim is CURRENT only if every required foundation and shared dependency is current enough for that claim.

NO AUTOMATIC FAIL-CLOSED GLOBALIZATION
One foundation failure does not necessarily require all Nexo functions to stop.
But it must stop every protected effect whose claim depends on that foundation unless another independently sufficient boundary covers the same claim.
This is claim-scoped fail-closed behavior.

ASSURANCE COMPOSITION CONTRACT
Candidate fields:
composition_id; composite_claim; component_claims; foundations; effective TCB; shared dependencies; common-mode closure; assumptions; interaction closure; temporal/causal constraints; boundary set; resource incarnations; policy/invariant versions; proof contexts; refinement mappings; invalidation triggers; recovery semantics; verification method; claim strength.

FOUNDATION PROMOTION CONTRACT
Candidate fields:
source_claim; target_claim; source_foundation; target_foundation; refinement mapping; required invariants; required evidence; dependency closure; assumption transformation; boundary compatibility; effect class; context compatibility; failure-domain closure; invalidation conditions; verification status.

SAFE COMPOSITION RULE
A component assurance result can be imported into another claim only if:
1 the source claim is current;
2 source context is compatible;
3 target obligation explicitly depends on source property;
4 source claim strength is sufficient;
5 assumptions are compatible;
6 all shared dependencies are closed;
7 no unresolved common-mode interaction exists;
8 refinement/composition relation is verified for the target property;
9 update/recovery/rollback paths are included;
10 current authority is independently established.
Otherwise RECHECK / RECOMPUTE / HOLD.

COMPOSITION AND TEMPORAL ORDER
Two individually verified foundations can still fail as a composition if their actions interact temporally.
Therefore composition closure includes:
CONCURRENT EFFECTS, INVALIDATION, STOP, RECOVERY, COMPENSATION, RETRY, REDRIVE, RESOURCE REPLACEMENT, UPDATE, ROLLBACK, KEY ROTATION and DECOMMISSION.
PAIRWISE FOUNDATION VALIDITY does not imply COMPOSITE TEMPORAL SAFETY.

ASSURANCE DOES NOT CROSS EFFECT BOUNDARY AUTOMATICALLY
A foundation may verify an internal control property while the external effect remains UNKNOWN.
To promote it to an external claim, the external effect contract, enforcement boundary, resource incarnation, reconciliation and environment assumptions must be included.

MINIMAL SOUND COMPOSITION DOMAIN
The correct unit is not 'all foundations' and not 'each foundation independently'.
It is the smallest sound closure of all foundations and dependencies capable of changing the target claim.
Candidate name: COMPOSITIONAL TCB DOMAIN (CTD).
CTD(C) = foundations + shared dependencies + interacting boundaries + relevant authority + recovery/update paths + environment assumptions required to establish C.
Underapproximation is safety-dangerous; overapproximation reduces liveness.

FOUNDATION COMPOSITION STATE MACHINE
DISCOVER CLAIM
-> DISCOVER REQUIRED FOUNDATIONS
-> COMPUTE TCB CLOSURE
-> COMPUTE COMMON-MODE CLOSURE
-> CHECK ASSUMPTION COMPATIBILITY
-> CHECK INTERACTION/HYPERGRAPH
-> CHECK CLAIM-STRENGTH COMPATIBILITY
-> CHECK REFINEMENT/COMPOSITION
-> FREEZE CONTEXT
-> VERIFY
-> PUBLISH ASSURANCE
-> SEPARATELY ESTABLISH AUTHORITY
-> PROTECTED ADMISSION.

INVALIDATION
Change to one foundation can invalidate only the claims whose closure is affected, provided impact closure is complete.
Changes to shared roots, policy, update channel, recovery mechanism or common environment can invalidate multiple foundations simultaneously.
Unknown overlap -> UNKNOWN, not unaffected.

RECOVERY
Foundation recovery is itself a protected composition transition.
Recovering Root A does not automatically restore composite claim C.
After recovery:
REBUILD CURRENT CONTEXT -> RECOMPUTE TCB -> RECHECK COMMON-MODE -> REVALIDATE ASSUMPTIONS -> REVERIFY COMPOSITION -> RECOMPUTE CLAIM -> EXPLICIT RELEASE.

FORMALIZATION TARGET
Finite model candidates: foundations A/B; shared root X; claim strengths; dependency graph; compromise A; compromise X; update A; recovery B; common policy; common recovery key; independent fences; composite claims; temporal interactions; invalidation generation; proof context; authority state.
Candidate safety properties:
1 composite claim never CURRENT when a required foundation is COMPROMISED/UNKNOWN;
2 no weak source claim silently grants stronger target authority;
3 common-root compromise invalidates every dependent composition;
4 disjoint claims may remain current after unrelated compromise only when disjointness is established;
5 composition requires current context and valid refinement/assumption closure;
6 assurance publication never directly creates authority.
No TLC/SANY result claimed.

CANDIDATE INVARIANTS INV-TCBC-01..40
01 foundation assurance is claim-specific.
02 composite assurance requires TCB closure.
03 multiple roots do not imply independence.
04 shared root creates common-mode dependency.
05 unknown shared dependency blocks strong composition.
06 lower claim strength cannot silently promote to higher claim strength.
07 proof validity does not grant authority.
08 assurance currentness does not grant authority.
09 authority does not imply external success.
10 composition requires compatible assumptions.
11 contradictory assumptions block strong composition.
12 shared recovery path can couple foundations.
13 shared update path can couple foundations.
14 shared policy source can couple foundations.
15 shared identity source can couple foundations.
16 shared storage/rollback can couple foundations.
17 shared runtime/hypervisor can couple foundations.
18 shared clock can couple freshness claims.
19 shared operator/break-glass can couple boundaries.
20 shared resource/provider can couple effects.
21 partial compromise invalidates dependent closure.
22 unrelated claims may remain current only with complete disjointness.
23 unknown overlap causes conservative impact classification.
24 composite claim includes temporal interaction closure.
25 composite claim includes recovery/update/rollback closure.
26 foundation promotion requires refinement/composition contract.
27 source claim must remain current during import.
28 source context must be compatible.
29 target claim must explicitly depend on source property.
30 assurance publication cannot self-authorize.
31 foundation recovery does not automatically restore composite claims.
32 trust-root generation is part of context.
33 resource incarnation is part of context where relevant.
34 common-mode closure is part of TCB closure.
35 composition context must be frozen before verification.
36 invalidation generation binds currentness.
37 false-stale is preferred to false-current.
38 strong composition cannot cross unresolved boundary closure.
39 formal refinement is required for implementation assurance.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If each component claim is current for its own context, the compositional TCB domain is soundly closed, shared/common-mode dependencies are fully characterized, assumptions are compatible, the interaction/temporal closure is complete, the source claims are sufficient for the target obligation, and a valid refinement/composition relation exists, then the component assurances may support a composite claim at the justified strength. Removing any required premise may invalidate the composition.

ARCHITECTURE CONSEQUENCE
Nexo should not have a single universal 'trust score'.
It needs claim-scoped assurance composition.
Each strong claim carries its own TCB/foundation closure.
Composition creates a new proof context rather than merely copying component statuses.
Authority remains a separate plane and must be established independently after assurance.

DEEP RULE
NO CLAIM MAY INHERIT MORE AUTHORITY OR ASSURANCE STRENGTH THAN THE INTERSECTION OF ITS VERIFIED FOUNDATIONS, DEPENDENCIES, BOUNDARIES, ASSUMPTIONS AND REFINEMENT CONTRACTS JUSTIFIES.

NEXT ATTACK
TCB COMPOSITION + ASSURANCE/EFFECT CROSSING + MISSION INVARIANT + PARTIAL COMPROMISE + RECOVERY + DYNAMIC FOUNDATION DISCOVERY. Question: can a newly discovered dependency or foundation join a live composite claim without creating an authority gap, or must foundation expansion be treated exactly like protected scope widening?