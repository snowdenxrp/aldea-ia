NEXO - PARTIAL MULTI-RESOURCE FENCING / WEAKER CLAIMS / LOCAL-TO-GLOBAL CONTAINMENT RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

QUESTION
If a protected multi-resource effect is only partially fenced, can Nexo retain a weaker but useful claim without incorrectly promoting local containment to transaction or mission safety?

WEB CROSS-CHECKS
Kubernetes resourceVersion provides a concrete example of stale-write rejection at the API/resource boundary: an outdated resourceVersion can cause a 409 conflict. This is useful as a reference for resource-side stale-context rejection, but it does not establish multi-resource atomicity or external-world containment. cite: turn0search0.
NIST SP 800-193 separates protection, detection and recovery roots and explicitly notes that a security function may rely on another device, creating a trust relationship between the components. This reinforces that the enforcement boundary and its dependency closure must be part of the claim. cite: turn0search2, turn0search36.

CORE RESULT
Partial fencing does not automatically imply failure of every claim, but it also cannot be promoted to global containment.
Required distinction:
LOCAL_CONTAINMENT != GROUP_CONTAINMENT != TRANSACTION_CONTAINMENT != MISSION_CONTAINMENT.
Partial enforcement can support a weaker claim only if the weaker claim's scope is completely covered by the verified fenced subset.

CLAIM DEGRADATION
Candidate claim lattice:
C0 NO_PROTECTED_CLAIM
C1 LOCAL_ADMISSION_BLOCKED
C2 EFFECT_PATH_PARTIALLY_CONTAINED
C3 RESOURCE_SET_CONTAINED
C4 EFFECT_GROUP_CONTAINED
C5 TRANSACTION_CONTAINED
C6 MISSION_INVARIANT_PRESERVED
C7 GLOBAL_EXTERNAL_PREVENTION.
These are not automatic levels. Promotion requires a claim-specific proof/closure contract.

PARTIAL FENCE EXAMPLE
Effect E touches R1, R2 and R3.
R1 fence = VERIFIED.
R2 fence = VERIFIED.
R3 fence = UNKNOWN.
Then:
R1_CONTAINED = potentially valid.
R2_CONTAINED = potentially valid.
E_TRANSACTION_CONTAINED = UNKNOWN if R3 can affect the transaction claim.
MISSION_SAFE = UNKNOWN if R3 can affect the mission invariant.
R1/R2 containment must not be silently promoted.

THE KEY CONDITION
A weaker claim is valid only if every behavior capable of violating that weaker claim is inside the verified closure.
Thus:
CLAIM_SCOPE <= VERIFIED_ENFORCEMENT_SCOPE.
If the claim is only 'R1 will reject stale controller A', R1's verified boundary may be enough.
If the claim is 'E cannot violate the transaction invariant', R3 may be mandatory.

UNKNOWN PARTICIPANT
An unfenced participant can be:
- actively executing;
- queued;
- retrying;
- autonomous;
- disconnected;
- compromised;
- replaced;
- using an alternate API.
Therefore UNFENCED != INACTIVE.
UNKNOWN_FENCE != FENCED.

PARTIAL FENCE + MISSION INVARIANT
Suppose mission invariant is A+B+C <= 100.
R1/A and R2/B are fenced, but R3/C is not.
Even if A and B are locally contained, C may still consume capacity.
Therefore local containment does not establish the aggregate mission invariant.

SAFE SUBCLAIM
A useful degraded claim can still exist:
'Within R1, under current resource incarnation and verified fence generation, stale contexts matching the defined rejection class cannot execute protected effect E.'
This is materially different from:
'Transaction E is safe.'
The second requires the complete relevant transaction closure.

CLAIM BOUNDARY OBJECT
Candidate PublicationClaim:
- claim_id;
- claim_strength;
- protected scope;
- excluded scope;
- effect class;
- required effect-path closure;
- enforcement boundary set;
- resource incarnations;
- fence generations;
- dependency/common-mode closure;
- assumptions;
- temporal/causal constraints;
- evidence;
- verification method;
- invalidation triggers;
- validity state.

EXCLUDED SCOPE MUST BE EXPLICIT
A degraded claim should state what it does NOT cover.
Example:
C3_RESOURCE_CONTAINMENT(R1,R2)
EXCLUDES R3, provider queue Q3, autonomous continuation P3.
This prevents consumers from interpreting a local claim as global safety.

NO SILENT CLAIM PROMOTION
Forbidden:
R1 VERIFIED + R2 VERIFIED + R3 UNKNOWN -> TRANSACTION_VERIFIED.
Also forbidden:
LOCAL_STOP + PARTIAL_FENCE -> GLOBAL_QUIESCENCE.
Or:
ALL_LOCAL_RESOURCES_SAFE -> MISSION_SAFE.

COMPOSITION OF VERIFIED SUBSETS
Two contained subsets may compose only if their interaction closure proves that excluded domains cannot invalidate the target claim.
Conditions include:
- no shared physical resource;
- no shared queue/worker capable of cross-effect execution;
- no shared conservation budget;
- no cross-domain causal ordering requirement;
- no coupled compensation;
- no shared trust/recovery path capable of bypass;
- no common mission invariant dependency;
- no unresolved UNKNOWN_ORDER.
If any required condition is UNKNOWN, strong composition is blocked.

PARTIAL FENCE AS ABSORBING STATE
Partial fencing can sometimes establish a bounded absorbing safe state for the fenced subset.
However, absorption is claim-specific.
If the unfenced participant can still affect the target claim, the combined state is not absorbing for that claim.

FENCE FAILURE MATRIX
Case F1: one resource fence unavailable, effect decomposition proven -> weaker resource claim may survive.
Case F2: unavailable participant shares mission budget -> mission claim blocked.
Case F3: participant has autonomous continuation but excluded from local claim -> local claim may survive if exclusion is explicit.
Case F4: participant can bypass another resource's fence -> both may require joint containment analysis.
Case F5: common provider controls fenced and unfenced resources -> independence may fail.
Case F6: resource incarnation unknown -> strong resource claim blocked.
Case F7: fence state rolled back -> continuity broken; quarantine/re-establish.
Case F8: partial fence + UNKNOWN_ORDER affecting invariant -> strong temporal claim blocked.

MULTI-RESOURCE EFFECT STATE
Scalar status is inadequate.
Candidate vector:
E = {R1: VERIFIED, R2: VERIFIED, R3: UNKNOWN}.
Transaction state is derived from the claim's decomposition rules.
Do not infer:
ALL_COMPONENTS != UNKNOWN -> TRANSACTION_VERIFIED.

DECOMPOSITION CONTRACT
Candidate MultiResourceContainmentContract:
- effect_id;
- resource set;
- effect class;
- transaction invariant;
- interaction graph/hypergraph;
- temporal constraints;
- shared physical dependencies;
- shared provider/queue closure;
- fence requirements;
- resource incarnations;
- decomposition assumptions;
- excluded interactions;
- claim strength;
- verification evidence;
- invalidation conditions.

PARTIAL COMMIT VS PARTIAL CONTAINMENT
These must remain distinct.
PARTIAL_COMMIT describes what may have happened externally.
PARTIAL_CONTAINMENT describes what future effects are currently prevented.
Neither implies the other.

CRASH/RESTORE
After crash, the vector must be reconstructed from current resource identities/fences, not from the previous snapshot.
Example:
R1 fence CURRENT; R2 fence UNKNOWN after restore; R3 fence CURRENT.
Previous bundle remains historical.
Current transaction containment becomes UNKNOWN until R2 is revalidated.

RECOVERY
Recovery can preserve local subclaims while rebuilding global claims.
Required sequence:
IDENTIFY CURRENT RESOURCES
-> IDENTIFY CURRENT INCARNATIONS
-> VERIFY EACH FENCE
-> COMPUTE EFFECT/TRANSACTION CLOSURE
-> CHECK MISSION INTERACTIONS
-> RECONCILE HISTORICAL UNKNOWN
-> REBUILD CLAIM VECTOR
-> PUBLISH ONLY JUSTIFIED CLAIM STRENGTH.

MISSION ACCOUNTING
Fencing future effects does not erase unresolved past consumption.
Therefore:
CONTAINMENT != ACCOUNTING.
CONTAINMENT != RECONCILIATION.
CONTAINMENT != MISSION_TRUTH.

CLAIM DEGRADATION IS NOT FAILURE OF THE SYSTEM
A safe architecture should deliberately permit:
GLOBAL_CLAIM -> GROUP_CLAIM -> RESOURCE_CLAIM -> LOCAL_CLAIM -> UNKNOWN
when evidence/enforcement deteriorates.
The degradation must be monotonic in assurance strength and must never create new authority.

DEGRADATION MUST BE ATOMIC AT THE PUBLICATION BOUNDARY
If a global claim is invalidated, consumers must not continue reading a stale global claim while the local degraded claim is already current.
Candidate publication state:
CURRENT_GLOBAL
DEGRADING
CURRENT_DEGRADED
INVALIDATED
REVALIDATING.
Publication currentness needs the same authoritative ordering principles established for AssuranceCommit.

PARTIAL FENCE + BREAK-GLASS
Break-glass cannot use the degraded claim as if it were a stronger one.
If break-glass is allowed, it must specify exactly which claim strength it operates under and which resources remain uncontained.

PARTIAL FENCE + AUTONOMOUS PROVIDER
Provider continuation is included in the effect-path closure.
If the provider can continue affecting R3, R3 remains part of the transaction/mission closure even if Nexo cannot currently observe it.

PARTIAL FENCE + COMMON MODE
If R1 and R2 fences share a compromised enforcement root, local verification may not provide independent assurance.
Thus resource count is not assurance count.
Three fenced resources can still be one failure domain.

NEW OBJECT: ContainmentClaim
Candidate fields:
claim_id; claim_strength; scope; excluded_scope; effect_id; resource set; fence set; fence generations; resource incarnations; provider/queue closure; dependency/common-mode closure; interaction graph; temporal constraints; assumptions; evidence; verification; invalidation; continuity context.

NEW OBJECT: ContainmentVector
Candidate mapping:
resource/effect participant -> {FENCED, VERIFIED, UNKNOWN, BYPASSED, LOST, REESTABLISHING}.
Aggregate claim is derived through a claim-specific composition function.

NEW OBJECT: DegradedClaimPublication
Fields:
- previous_claim;
- degraded_claim;
- degradation_reason;
- impacted obligations;
- excluded scope;
- invalidation generation;
- publication linearization;
- consumers/authority consequences;
- recovery/revalidation conditions.

CANDIDATE INVARIANTS INV-PFC-01..40
01 partial fence is not global containment.
02 local containment is claim-scoped.
03 unknown participant is not inactive participant.
04 unknown fence blocks claims requiring that fence.
05 resource containment does not imply transaction containment.
06 transaction containment does not imply mission truth.
07 containment does not classify historical effect outcome.
08 containment does not erase UNKNOWN consumption.
09 partial commit and partial containment are distinct.
10 claim strength must match verified enforcement scope.
11 excluded scope must be explicit for degraded claims.
12 no silent claim promotion.
13 composition requires complete interaction closure.
14 unknown interaction blocks strong composition.
15 shared physical resource prevents naive decomposition.
16 shared queue prevents naive decomposition.
17 shared provider may defeat independence.
18 shared trust root may defeat independence.
19 shared recovery path may defeat independence.
20 shared mission budget prevents local-to-global promotion.
21 unknown causal order blocks temporal mission claims.
22 resource incarnation is part of containment context.
23 fence generation is part of containment context.
24 fence rollback breaks continuity.
25 crash recovery recomputes current containment.
26 checkpoints do not restore current containment.
27 claim degradation cannot create authority.
28 degraded claim publication requires protected ordering.
29 stale global claim must not survive current invalidation.
30 local claims may survive global degradation only with complete disjointness.
31 absorbing state is claim-specific.
32 autonomous provider paths remain in closure.
33 break-glass cannot exceed current claim strength.
34 resource count is not independence count.
35 enforcement evidence is claim-specific.
36 evidence of fence receipt is not evidence of enforcement.
37 mission accounting remains separate from containment.
38 reconciliation remains separate from containment.
39 formal refinement is required before implementation assurance.
40 formal/runtime/deployment correctness remains unproven.

CANDIDATE THEOREM
Not formally proven: If a degraded claim C' has a fully closed protected scope, every claim-relevant path that could violate C' crosses a currently verified enforcement boundary, excluded participants cannot affect C', and all required temporal/causal/dependency assumptions are current, then C' may remain valid even when a stronger claim C is unavailable. This does not justify C.

ARCHITECTURE CONSEQUENCE
Nexo needs an explicit Claim Degradation / Containment Composition mechanism rather than a binary SAFE/UNSAFE flag.
Canonical relation:
ENFORCEMENT STATE -> CONTAINMENT VECTOR -> CLAIM COMPOSITION -> CLAIM STRENGTH -> AUTHORITY CONSEQUENCE.
Authority must consume only the exact claim strength required by the protected transition.

DEEP RULE
WEAKER CLAIMS MAY SURVIVE PARTIAL FAILURE, BUT THEY MUST NEVER BE USED AS IF THEY WERE STRONGER CLAIMS.

NEXT ATTACK
DEGRADED CLAIM CONSUMER / AUTHORITY BINDING / STALE CLAIM CACHE / CONCURRENT CLAIM DEGRADATION / RECOVERY / MISSION EFFECT. Question: how does Nexo prevent an old stronger claim from remaining usable by an authority consumer after the system has correctly degraded to a weaker claim?