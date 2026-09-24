# NEXO — QUARANTINE CONTINUITY / ROLLBACK / RESURRECTION ATTACK V1

Date: 2026-09-24
Status: RESEARCH ONLY. No V21. No implementation.

## 1. Attack target
Previous research introduced SAFE_QUARANTINED_UNKNOWN as a possible state that contains unresolved external history without claiming NO_EFFECT. This round attacks the state itself.

Question: can quarantine remain safety-preserving across crash, rollback, restart, stale actors, delayed messages, resource resurrection, and split ownership?

## 2. Core result
A quarantine state is not intrinsically safe because it is named quarantine. Its safety is a property of the enforcement path and its continuity.

Therefore:
QUARANTINE_STATE != QUARANTINE_ENFORCEMENT.

A stored flag saying `quarantined=true` is evidence of intended state, not proof that every protected effect path is actually fenced.

This follows the same fundamental fencing lesson: correctness requires the protected resource to actively reject stale operations, not merely the controller to believe an old lock has expired. citeturn0search0

## 3. Rollback attack
Sequence:
Q1 quarantine established at generation G10
Q2 quarantine enforcement active
Q3 system snapshot captured
Q4 generation advances to G11
Q5 fence/revocation strengthened
Q6 crash
Q7 rollback restores snapshot G10
Q8 old actor/capability from G10 attempts execution

If G10 can authorize an effect that G11 had forbidden, rollback has resurrected historical authority.

Therefore restoration of a historical quarantine record must not restore historical authority or historical release state.

TUF provides a useful external analogy: authentic older metadata can still be obsolete, and freshness mechanisms are needed to prevent rollback/freeze conditions. This is an analogy, not a direct architectural proof for Nexo. citeturn0search1turn0search5

## 4. New principle
A protected quarantine needs two logically separate properties:

1. Historical quarantine intent: what the prior state says should be blocked.
2. Current enforcement continuity: what the current trusted/resource boundary will actually reject.

The second cannot be inferred solely from the first.

## 5. Restart attack
Sequence:
STOP → QUARANTINE → crash → restart.

Restart must not mean:
RESTORED_QUARANTINE → TRUSTED_EXECUTION.

It must mean:
RESTORE → CURRENT_CONTEXT → CURRENT_FENCE → ENFORCEMENT_VERIFICATION → QUARANTINED.

Only after that can any release decision exist.

## 6. Stale actor attack
Actor A held an old execution capability.
Quarantine is established.
Actor A was paused.
Actor A resumes after recovery.

A local check by A is insufficient. The resource/effect boundary must reject A's stale fencing context. Fencing tokens work precisely because the protected resource checks and rejects older tokens. citeturn0search0

Therefore quarantine must invalidate the capability at the protected boundary, not merely in the controller's local memory.

## 7. Delayed message attack
A command created before quarantine arrives after quarantine.

Message arrival time cannot determine authority.
The message must carry/bind sufficient current context, including effect identity and fencing generation, and be rejected if its context is stale.

Otherwise:
QUARANTINE + DELAYED_OLD_MESSAGE = possible escape.

## 8. Resource resurrection
Resource R7 was quarantined.
R7 crashes and loses volatile fence state.
R7 restarts accepting commands by default.

Nexo cannot claim quarantine safety unless the resource re-establishes its current fence before protected commands are accepted.

Therefore resource boot behavior becomes safety-relevant:
BOOT_WITH_UNKNOWN_FENCE → PROTECTED_COMMANDS_BLOCKED.

Only after current fence establishment may protected execution become possible.

## 9. Replacement resource
R7 is destroyed and replaced by R8.

R8 cannot inherit R7's historical world truth automatically.
It may inherit a current safety policy only through an explicit new incarnation binding:

R8 + CURRENT_FENCE + NEW_INCARNATION + CURRENT_AUTHORITY.

The old UNKNOWN remains attached to R7/effect history unless adequate evidence resolves it.

Thus:
NEW_RESOURCE_SAFETY != OLD_EFFECT_HISTORY_RESOLUTION.

## 10. Split-brain quarantine
Two recovery actors independently conclude:
A: quarantine remains required.
B: quarantine can be released.

Both cannot independently possess release authority.

The system needs one authoritative release linearization or an explicit conflict protocol whose default is safety-preserving containment.

If the authority store is unavailable or its continuity is UNKNOWN, the architecture cannot silently infer that B's release is current.

## 11. Second crash during quarantine establishment
Hard case:
E1 UNKNOWN
→ recovery begins
→ quarantine requested
→ controller crashes before confirming enforcement
→ restart

The state must distinguish:
QUARANTINE_REQUESTED
QUARANTINE_ENFORCING
QUARANTINE_VERIFIED

`REQUESTED` is not `ENFORCING`, and `ENFORCING` is not necessarily `VERIFIED`.

If verification is lost, safe default is HOLD/QUARANTINE with protected effects blocked until enforcement is re-established or independently verified.

## 12. Continuity root requirement
This attack exposes a stronger requirement:

A quarantine claim may require a continuity mechanism that is not itself completely rollback-vulnerable.

Otherwise a snapshot can contain a perfectly authentic statement that quarantine exists while restoring a world in which an older actor or resource can bypass it.

Therefore candidate dependency:
QUARANTINE_ASSURANCE → CURRENT_FENCE_CONTINUITY.

If CURRENT_FENCE_CONTINUITY is UNKNOWN, the strong claim “quarantine prevents protected execution” must be downgraded.

## 13. Quarantine is monotonic only in a defined sense
It is not necessarily monotonic in knowledge:
UNKNOWN → CONFLICT → VERIFIED_OUTCOME.

It must be monotonic in the safety boundary:

once a dangerous capability is revoked/fenced, no restoration/restart path may silently reactivate that capability without a fresh protected authorization.

Candidate invariant:

INV-QCR-01 historical restoration cannot restore historical execution authority.

## 14. Formalizable safety property
Candidate abstract invariant:

For every protected effect E and every current protected resource R:

if Quarantine(E.scope) is required in the current safety context, then no execution transition for E may linearize unless a current release context exists whose fence/context generation dominates the quarantine boundary.

This is intentionally abstract. It is NOT TLC-verified.

TLA+ models state transitions as a next-state relation and can check invariance over all behaviors of a finite model; the next step for Nexo would be to encode this quarantine invariant and adversarial rollback/restart transitions rather than merely asserting the prose rule. citeturn0search6turn0search2

## 15. Candidate state machine

QUARANTINE_REQUESTED
        ↓
QUARANTINE_ENFORCING
        ↓
QUARANTINE_VERIFIED
        ├──→ RECONCILIATION
        ├──→ DECOMMISSION_WITH_UNRESOLVED_HISTORY
        └──→ RELEASE_ELIGIBILITY_CHECK

Failure/unknown at any critical enforcement boundary:
        ↓
HOLD / QUARANTINE_REESTABLISHMENT

Forbidden shortcut:
RESTORE → RELEASE

## 16. New distinction
We now need to distinguish:

`CONTINUITY OF STATE`
from
`CONTINUITY OF ENFORCEMENT`.

A database can restore a quarantine record correctly while the actual resource fence has regressed.

Therefore:
STATE_CONTINUITY != ENFORCEMENT_CONTINUITY.

## 17. Candidate invariants
INV-QCR-01 rollback cannot resurrect superseded authority.
INV-QCR-02 quarantine intent does not prove quarantine enforcement.
INV-QCR-03 protected resources must enforce current fencing where the claim depends on stale-actor rejection.
INV-QCR-04 resource restart with unknown fence blocks protected commands.
INV-QCR-05 delayed messages are judged by current bound context, not arrival time.
INV-QCR-06 replacement resources have new incarnation identity.
INV-QCR-07 replacement does not erase historical uncertainty.
INV-QCR-08 quarantine establishment has REQUESTED/ENFORCING/VERIFIED distinctions.
INV-QCR-09 loss of enforcement verification cannot silently produce release.
INV-QCR-10 split release authority resolves to one protected linearization or safety-preserving conflict state.
INV-QCR-11 historical snapshots cannot restore historical release authority.
INV-QCR-12 state continuity and enforcement continuity are separate claims.
INV-QCR-13 quarantine cannot self-authorize release.
INV-QCR-14 current fence continuity is a dependency of strong quarantine claims.

## 18. Architecture consequence
The clean architecture should likely model quarantine as a cross-plane safety condition, not merely as an execution status.

Candidate relationships:

SafetyContainmentState
→ CurrentFence
→ ResourceIncarnation
→ EffectScope
→ DependencyClosure
→ ContinuityContext
→ ReleaseEligibility

The state must be claim-specific: “future E1-class effects are fenced” is narrower than “the entire mission is safe.”

## 19. Research conclusion
The absorbing-state idea survives the first attack only with a major qualification:

A safe absorbing state is not a durable boolean. It is a **current, enforceable safety relation whose continuity must survive rollback, restart, delayed messages, stale actors and resource resurrection**.

The historical UNKNOWN can remain unresolved while the future effect path is contained.

But if continuity of the enforcement boundary becomes UNKNOWN, the strong containment claim itself must downgrade to HOLD/QUARANTINE_REESTABLISHMENT.

## 20. Next attack
NEXT: **QUARANTINE + MULTI-RESOURCE / CROSS-DOMAIN FENCING**.

Questions:
- Can one quarantine boundary safely cover multiple resources?
- What if one resource fence advances and another does not?
- What if resource A is contained but resource B remains reachable through a hidden child effect?
- Can partial quarantine create a false global safety claim?
- What is the minimum atomicity/fencing grain for a mission-level containment claim?
- Can decommission of one participant make another participant unsafe?
- How should quarantine interact with shared queues, providers and downstream effects?

DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED.
