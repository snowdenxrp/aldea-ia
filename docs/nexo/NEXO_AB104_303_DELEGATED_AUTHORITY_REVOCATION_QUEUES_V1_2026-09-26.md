# NEXO AB104.303 — Delegated authority, queues, and revocation
Date: 2026-09-26
Status: RESEARCH-ONLY

## Findings
1. Revocation can be authoritative at the authorization server while already-issued credentials may remain observable/accepted elsewhere during propagation. RFC 7009 explicitly notes propagation delay and requires clients not to keep using a revoked token after successful revocation. citeturn0search0
2. Therefore a queued operation carrying a previously valid delegation cannot be assumed executable merely because its credential was valid when queued.
3. The execution boundary must revalidate current authority/fence before producing an external effect when revocation can race with execution.
4. A queued item may remain valid as historical evidence of an earlier authorization while being forbidden from execution under the current authority epoch.
5. If a provider/resource cannot observe revocation synchronously, Nexo must model the provider's revocation-lag window explicitly rather than claiming instantaneous global revocation.
6. Delegation should therefore bind authority generation/epoch, target identity/incarnation, operation identity, and contract lineage. Revalidation compares the queued authority against the current authoritative state.
7. A crash between authorization validation and effect execution creates three distinct possibilities: effect-before-revocation, revocation-before-effect, or UNKNOWN ordering. Local timestamps cannot safely resolve the third case without authoritative evidence.

## Candidate invariant
`QUEUED_AUTHORITY_VALID_AT_ENQUEUE != AUTHORITY_VALID_AT_EXECUTION`.

`REVOCATION_OBSERVED_BEFORE_EFFECT => EFFECT_MUST_NOT_EXECUTE` (within a domain that enforces the same authority boundary).

`UNKNOWN_REVOCATION_ORDER => DO_NOT_CLAIM_EFFECT_AUTHORIZED`.

## Explicit non-claims
No architecture selected; no implementation; no formal verification; no semantic freeze.

## Next exact step
AB104.304 — study fencing/token epochs and compare-and-swap style authorization checks for closing the revocation-vs-execution race.
