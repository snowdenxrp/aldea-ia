# NEXO AB104.342 — Claim-specific retention horizons

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
Distributed checkpoint GC research derives collection from future recovery usefulness and dependency/recovery lines rather than simple age. citeturn0search3turn0search22 Practical checkpoint systems also retain checkpoints according to explicit recovery policy and only delete when restoration is no longer intended. citeturn0search0turn0search1

## Finding
Nexo should not use one global TTL as the semantic basis for evidence retention. Retention horizon should be derived per claim/effect contract from the latest frontier at which the retained evidence may still be required.

Candidate `RetentionHorizon`:
`claim_id + contract_version + dependency_closure + earliest_required_frontier + latest_required_frontier + authority/epoch + target_incarnation + coverage_requirements + revalidation_policy`

The horizon ends only when one of these is proven:
1. the claim is permanently resolved and no future recovery path can reopen it;
2. a retained authenticated summary fully subsumes the discarded evidence for that claim;
3. policy explicitly retires the claim and records the retirement boundary.

Expiry by wall-clock age alone is insufficient when recovery can occur later or when evidence is needed to prove a historical negative. If the required horizon cannot be established, retain or downgrade to `UNKNOWN`; do not delete merely because a TTL elapsed.

## Critical distinction
`TTL_EXPIRED != GC_ELIGIBLE`
`CLAIM_RESOLVED != EVIDENCE_DISPOSABLE` unless reopen/recovery is impossible or covered by an authenticated summary.

## Status
Exact horizon calculation and policy schema remain UNSELECTED. No implementation/formal verification performed.

## Next
AB104.343 — study claim retirement/finality: what evidence is required to prove a claim can never be reopened, and how retirement interacts with authority epochs and UNKNOWN.
