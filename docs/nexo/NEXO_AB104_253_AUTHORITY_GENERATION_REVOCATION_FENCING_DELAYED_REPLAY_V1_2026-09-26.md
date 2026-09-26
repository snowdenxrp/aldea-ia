# NEXO AB104.253 — AUTHORITY-GENERATION TRANSITION, REVOCATION, FENCING AND DELAYED REPLAY V1 — 2026-09-26

## Status
Research/study only. No architecture implementation or semantic freeze.

## Core finding
Authority generation must be treated as a state transition with its own authenticated lineage. A higher generation can fence prior permissions without rewriting historical records. Delayed messages and cached evidence must be checked against the current admissibility window before they can affect execution.

## Candidate transition record
`AUTHORITY_TRANSITION = {root_prev, root_next, epoch_prev, epoch_next, config_prev, config_next, predecessor_digest, transition_policy, effective_boundary, freshness, signer/threshold evidence, incarnation_scope}`

The transition itself needs durable evidence and must not be inferred from a larger integer. Root rotation therefore binds predecessor and successor roots/configurations; emergency revocation advances a generation/fence and explicitly states which prior authority is no longer admissible.

## Revocation vs history
Revocation changes current authority, not historical truth. An old signed decision can remain an authentic historical artifact while becoming unusable for a new effect. Recovery should preserve both the historical record and the current fenced status.

## Delayed messages / replay
A delayed message carrying epoch G must not execute merely because its signature is valid. The receiver checks current generation, scope, target incarnation, operation identity and freshness. If G is fenced, classify as STALE/FENCED; do not reinterpret it as proof that the original event never happened.

RATS provides a useful external model: freshness can be bound to timestamps, nonces, or epoch IDs; epoch transitions require handling races, and an epoch window can prevent false negatives during propagation. citeturn0search0turn0search21 This supports treating freshness as a policy/evidence dimension rather than a property implied by signature validity.

## Root rotation
Candidate safe sequence:
1. authenticate transition under currently trusted authority;
2. bind predecessor and successor root/configuration;
3. persist transition/fence before accepting successor-only authority;
4. establish effective epoch/boundary;
5. reject or quarantine messages below the fence for current execution;
6. preserve old evidence for audit/reconstruction.

This is a candidate protocol sequence, not a selected architecture.

## Emergency revocation
Emergency revocation should create an explicit generation/fence event rather than deleting old credentials or records. It should bind scope and effective boundary, and define treatment of in-flight operations. An operation already externally committed cannot be made historically uncommitted by revocation; its current admissibility and possible compensation are separate decisions.

## Replay after fencing
Replay of an old authorized message after revocation can be cryptographically valid yet operationally inadmissible. This is the key distinction:
`AUTHENTIC != CURRENTLY_AUTHORIZED`.
Likewise:
`SIGNED_EVIDENCE != FRESH_EVIDENCE`.
TUF's security model explicitly addresses rollback, freeze and key-compromise risks and treats trust as scoped/renewable rather than permanent. citeturn0search2

## Transition crash cases
- crash before transition durable: successor authority must not be assumed from partial local state;
- transition durable but local cache stale: reconstruct from trusted transition;
- old message arrives after transition: fence check rejects current execution;
- transition accepted but target did not receive fence: target-side fence is required for external effect safety;
- restore to pre-transition snapshot: anti-rollback must prevent resurrection of old authority.

## Evidence implications
A historical negative claim from epoch G can become stale after transition to G+1, but G+1 does not automatically prove the operation happened. The new epoch must provide its own coverage/authority evidence. Conversely, revocation alone does not prove `NOT_COMMITTED`.

## Code study
Indexed GitHub searches did not surface operation-registry implementation in this pass. This is not evidence of absence. No implementation changed.

## Persistent AB50->AB58 residuals
UNCHANGED: TERNARY_MATH_GAP=FOUND; TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION=UNKNOWN; EVENTDAG_CLOSURE=PARTIAL; RECONSTRUCTION=BOUNDED_ONLY; SEMANTIC_FREEZE=NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION=NOT_PERFORMED.

## DO-NOT-REPEAT
higher integer != authority; valid signature != current authorization; revocation != historical erasure; revocation != NOT_COMMITTED; delayed signed message != fresh message; root rotation != arbitrary key replacement; no V21; no implementation; no unsupported verification.

## Exact next mission
AB104.254: investigate target-side fencing during authority transitions — how a stale worker is rejected at the actual effect boundary, fence token/resource version binding, in-flight operations, lease expiry, and crash ordering between authority transition and external effect.