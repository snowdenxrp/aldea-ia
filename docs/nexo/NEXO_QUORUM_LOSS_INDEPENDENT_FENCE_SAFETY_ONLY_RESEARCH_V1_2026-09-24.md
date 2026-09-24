# NEXO - QUORUM LOSS / INDEPENDENT FENCING / SAFETY WITHOUT ARBITRATION RESEARCH - 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN ONLY. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question

If the AuthorityArbitrationDomain loses quorum while two previously valid authorities may still be able to produce protected effects, what minimum mechanism can preserve safety without requiring an unavailable global authority?

## External cross-checks

etcd documents that when quorum is lost, the cluster cannot accept writes; after majority failure it cannot continue consensus until a majority is restored. During network partition the minority side becomes unavailable and the majority side remains the available cluster. This demonstrates an important safety/liveness tradeoff: loss of authoritative order can intentionally reduce availability rather than permit multiple writers. citeturn0search0turn0search4

etcd also explicitly warns that bypassing the normal consensus committing phase during recovery is unsafe and can create a divergent cluster with the same cluster ID. citeturn0search2

TLA+ distinguishes safety from liveness: safety means no bad behavior occurs; liveness concerns eventual progress. A specification can remain safe while stuttering or halting indefinitely, so Nexo can intentionally sacrifice progress when required for safety. citeturn0search24turn0search26

## Core result

The minimum safety mechanism is not a replacement global authority.

It is a protected non-action condition at the effect boundary.

Candidate principle:

NO CURRENT AUTHORITATIVE ORDER
+
MULTIPLE POTENTIALLY ACTIVE AUTHORITIES
+
PROTECTED EFFECT CAPABLE
→
EFFECT EXECUTION MUST NOT BE ADMISSIBLE

This produces:

AUTHORITY_UNKNOWN → EFFECT_FENCE_REQUIRED → FENCE_ENFORCEMENT → QUARANTINE

not:

AUTHORITY_UNKNOWN → PICK_A_WINNER.

## Safety does not require liveness

The crucial separation is:

SAFETY = no forbidden protected effect

versus:

LIVENESS = system eventually performs useful work.

Under quorum loss, Nexo may preserve safety by refusing protected work indefinitely.

That is not a failure of the safety specification.

TLA+ explicitly treats safety and liveness as separate classes of properties; a halted behavior can satisfy a safety property even while failing liveness. citeturn0search24

Therefore candidate invariant:

LOSS_OF_AUTHORITY_ORDER MUST NOT CREATE NEW PROTECTED_EFFECT_CAPABILITY.

## New concept: Safety-Only Continuity Mode

Candidate state:

NORMAL_AUTHORITY
AUTHORITY_DEGRADED
ARBITRATION_UNAVAILABLE
SAFETY_ONLY
QUARANTINED
RECOVERY_REQUIRES_ARBITRATION

Safety-Only means:
- no new protected effects;
- no authority promotion;
- no release;
- no recovery that grants execution;
- no compensation unless independently proven safe;
- existing external effects remain subject to fencing/reconciliation;
- observation may continue if it cannot itself create protected effects;
- local diagnostics may continue;
- durable history may continue where safe;
- claims can degrade rather than silently disappear.

## Critical distinction

ARBITRATION_UNAVAILABLE != WORLD_STOPPED

Loss of quorum tells us that Nexo cannot establish current authority.

It does not prove:
- external resources stopped;
- providers stopped;
- old processes stopped;
- queued effects disappeared;
- prior effects did not happen.

Therefore:

AUTHORITY_UNKNOWN != EXTERNAL_QUIESCENCE.

## Minimum independent mechanism

For a strong safety claim during arbitration loss, every path capable of producing a protected effect must be blocked by an enforcement boundary whose validity does not depend on the unavailable arbitration domain.

Candidate:

Independent Effect Fence (IEF).

It can be:
- resource-side fence;
- hardware interlock;
- external fencing service;
- capability validation anchored outside the failed authority domain;
- provider-side revocation;
- physical isolation.

Semantic requirement:

STALE_OR_UNAUTHORIZED_CONTEXT → EFFECT_REJECTED.

## Important qualification

An IEF is only independent if its claim-relevant failure closure is sufficiently disjoint from the failed arbitration domain.

If:
Arbitration → Storage S
and
Fence → Storage S

then losing S may invalidate both.

Thus:

FENCE_EXISTS != FENCE_INDEPENDENT.

## Candidate Safety Fence Contract

SafetyFenceContract:
- protected effect classes;
- effect boundary;
- protected targets;
- current fence generation;
- stale-token rejection semantics;
- authority dependency;
- continuity dependency;
- resource incarnation;
- crash semantics;
- restore semantics;
- partition semantics;
- failover semantics;
- update semantics;
- bypass paths;
- child/queue paths;
- enforcement evidence;
- verification method;
- failure-domain closure;
- invalidation conditions.

## Three cases

### Case A: independent fence remains enforceable

Arbitration lost
→ IEF remains current
→ stale authorities rejected
→ new effects blocked
→ safety can continue

Liveness may be lost.

### Case B: fence state is uncertain

Arbitration lost
→ fence state UNKNOWN
→ strong effect claim unavailable
→ QUARANTINE

Do not assume the fence is active.

### Case C: fence is known absent

Arbitration lost
→ resource accepts old authority
→ QUARANTINE / PHYSICAL ISOLATION / FAIL-SAFE

If no enforceable mechanism prevents protected effects, Nexo cannot claim safety merely because its own controller stopped.

## Existing external effects

Suppose A and B both previously admitted effects.

Arbitration disappears.

The system must not claim NO_EFFECT.

Instead:

EXTERNAL_EFFECT_STATE = UNKNOWN / IN_FLIGHT / CONFIRMED / REJECTED

according to evidence.

Safety-only mode blocks additional effects but does not retroactively classify history.

## Queues and autonomous providers

A major attack:

Nexo stops
but:
provider queue still contains E1.

Therefore:

LOCAL_STOP != PROVIDER_STOP.

Safety-only mode needs effect-path closure.

If the provider queue can still produce the protected effect, it is inside the safety boundary.

## Compensation

Under arbitration loss:

UNKNOWN original effect
+
compensation candidate

must not automatically trigger compensation.

Compensation requires a current protected authority and a contract proving it safe under the remaining uncertainty.

Otherwise:

HOLD / QUARANTINE.

## Recovery

Recovery cannot simply replace the unavailable quorum.

Candidate:

ARBITRATION_UNAVAILABLE
→ SAFETY_ONLY
→ REESTABLISH_ARBITRATION
→ RECONCILE_CONTINUITY
→ REESTABLISH_FENCES
→ VERIFY_LOSER_REJECTION
→ CREATE_CURRENT_CONTEXT
→ EXPLICIT_RELEASE

No:

ARBITRATION_UNAVAILABLE → LOCAL_RECOVERY_SELF_AUTHORIZES.

## Dangerous emergency-majority shortcut

Suppose A and B are partitioned.

A says:
“Quorum unavailable, but I have 1/2 nodes, so I will become authority.”

B can make the same argument.

Therefore a locally chosen emergency majority is not safe unless the membership/authority transition itself is governed by an independent, current coordination rule.

Otherwise:

EMERGENCY_AUTHORITY = NEW_SPLIT_BRAIN.

## Break-glass

Break-glass does not eliminate the safety floor.

It needs:
- explicit authority;
- exact scope;
- effect class;
- current fence;
- current resource incarnation;
- bounded duration;
- audit;
- reconciliation;
- conflict semantics;
- independent enforcement where required.

If those cannot be established:

BREAK_GLASS = DENIED.

## Candidate object: SafetyOnlyState

Fields:
- state_id;
- arbitration_domain;
- reason;
- lost authority context;
- protected effect classes;
- required fences;
- fence verification;
- blocked admission classes;
- allowed observation classes;
- unresolved effects;
- dependency closure;
- failure-domain closure;
- recovery conditions;
- exit linearization;
- expiry/review;
- invalidation triggers.

## Candidate object: IndependentEffectFence

Fields:
- fence_id;
- target;
- effect classes;
- continuity domain;
- generation;
- issuer;
- enforcement owner;
- stale-token rejection rule;
- resource incarnation;
- bypass closure;
- failure-domain closure;
- recovery semantics;
- restore semantics;
- verification evidence;
- currentness;
- invalidation conditions.

## Safety-only admission rule

ADMIT_PROTECTED_EFFECT(E,C) requires:
1. current authority;
2. current arbitration order where the claim needs it;
3. current safety fence;
4. current resource incarnation;
5. current dependency closure;
6. current claim/assurance context;
7. no unresolved conflict capable of invalidating the effect.

If arbitration is unavailable:

ADMIT = FALSE

unless the effect is independently proven safe without that arbitration dependency.

## Important exception

Not every operation must stop.

Operations whose safety claim is provably independent of the lost arbitration domain may continue.

Examples conceptually:
- read-only observation;
- local diagnostics;
- non-authoritative telemetry;
- evidence preservation;
- safe local shutdown.

But the closure must prove they cannot create or enable protected effects.

Thus:

ARBITRATION_LOST != EVERYTHING_STOPPED

and:

ARBITRATION_LOST != NOTHING_STOPPED.

The affected claim/effect closure determines the boundary.

## Candidate invariant family INV-SOF-01..32

01 Loss of authoritative order cannot grant new authority.
02 Loss of arbitration cannot create new protected effect capability.
03 Authority UNKNOWN is not external quiescence.
04 Local stop is not provider stop.
05 Local stop is not resource stop.
06 Quorum loss may safely reduce liveness.
07 Safety must not depend on eventual arbitration recovery.
08 Independent fence must be claim-specific.
09 Fence independence requires failure-domain closure.
10 Fence existence is not fence enforcement.
11 Fence enforcement is not fence verification.
12 Fence verification does not classify historical UNKNOWN.
13 Safety-only mode cannot self-authorize normal execution.
14 Safety-only mode cannot self-authorize recovery release.
15 Existing external effects remain separate from current authority.
16 Unknown queued work remains inside effect-path closure.
17 Autonomous provider continuation remains relevant.
18 Compensation requires fresh protected authority.
19 Break-glass cannot bypass the external contract floor.
20 Local emergency majority cannot create authority without valid coordination.
21 Unavailable quorum is not evidence that other authorities stopped.
22 Independent observation may continue only if non-actuating.
23 Durable history preservation may continue only if non-authoritative.
24 Safety-only exit requires protected linearization.
25 Re-establishing quorum does not automatically restore authority.
26 Rejoining domain requires fresh continuity context.
27 Reconciliation precedes release where required.
28 Resource incarnation changes invalidate old safety fences.
29 Common-mode dependencies can invalidate apparently independent fences.
30 Unknown fence state blocks strong protected-effect claims.
31 Safe non-convergence is preferable to dual authority.
32 Safety may remain provable while liveness is unavailable.

## Candidate theorem

Not formally proven:

If all protected-effect paths from potentially stale authorities cross an independently enforceable safety boundary that rejects stale or unauthorized contexts, then loss of the arbitration domain need not compromise safety, although it may eliminate liveness.

Required assumptions:
PATH_CLOSURE_COMPLETE
FENCE_ENFORCEMENT_VALID
FENCE_CURRENT
STALE_REJECTION_SOUND
NO_BYPASS
RESOURCE_INCARNATION_CURRENT

If any required premise becomes UNKNOWN:

STRONG_SAFETY_CLAIM = UNKNOWN/HOLD

unless the claim explicitly tolerates that uncertainty.

## Deep conclusion

Three mechanisms remain separate:

ARBITRATION
answers: “Who is currently authorized?”

FENCING
answers: “Can an old authority still produce the protected effect?”

RECONCILIATION
answers: “What actually happened in the external world?”

They cannot substitute for each other.

The minimum safety architecture during authority loss is therefore not “find another leader.”

It is:

REMOVE THE ABILITY TO PRODUCE FORBIDDEN EFFECTS

and remain there until authoritative continuity can be re-established.

## Architectural update

NORMAL
→ ARBITRATION LOSS
→ SAFETY-ONLY
→ INDEPENDENT FENCE
→ NO NEW PROTECTED EFFECTS
→ PRESERVE/RECONCILE HISTORY
→ REESTABLISH AUTHORITY
→ REVALIDATE CONTEXT
→ EXPLICIT RELEASE

This is a candidate safety pattern, not yet a formally proven protocol.

## Next attack

INDEPENDENT FENCE FAILURE + STALE AUTHORITY + PHYSICAL RESOURCE STILL ACTIVE + NO QUORUM

Question: if the arbitration domain is unavailable AND the independent fence itself is unavailable or uncertain, is there any purely software-level mechanism left that can honestly guarantee safety, or does Nexo reach a hard enforcement boundary beyond which it must explicitly downgrade the claim rather than pretend control exists?