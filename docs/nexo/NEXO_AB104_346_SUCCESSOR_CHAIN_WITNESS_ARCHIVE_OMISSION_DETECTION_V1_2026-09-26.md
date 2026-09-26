# NEXO AB104.346 — Successor-chain witnesses and omission detection

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 9162 defines inclusion proofs and consistency proofs for append-only Merkle logs and describes auditing of successive signed tree heads to detect inconsistent views. citeturn0search0turn0search1 The transparency-dev witness project applies this pattern: witnesses verify append-only evolution and countersign checkpoints, helping detect split views. citeturn0search5turn0search6 RFC 9943 similarly describes transparent statements and receipts as independently verifiable evidence, while noting transparency does not itself prevent dishonest issuers. citeturn0search3

## Finding
For Nexo successor/reopen chains, an independent witness/archive can strengthen **lineage continuity and omission detection**, but cannot by itself prove semantic truth or completeness. The witness must have an independent acquisition/storage/operator dependency where the claim requires independence.

Candidate witness statement:
`witness_id + observed_checkpoint + predecessor_checkpoint + consistency_proof + observation_frontier + dependency_domain + authority + signature`

Candidate outcomes:
`LINEAGE_CORROBORATED | EQUIVOCATION_DETECTED | WITNESS_CORRELATED | COVERAGE_INSUFFICIENT | UNKNOWN | CONFLICT`.

An omitted predecessor link can be detected when an independent witness holds a prior checkpoint and the presented successor cannot produce a valid append-only consistency relation. If the witness starts after the suspected omission, it cannot prove the omitted event never existed. Thus witness coverage must include the relevant predecessor frontier.

## Invariants
`WITNESS_CORROBORATION != SEMANTIC_TRUTH`
`CONSISTENCY_PROOF != COMPLETENESS_PROOF`
`WITNESS_AFTER_GAP != PROOF_NO_OMISSION`
`EQUIVOCATION_DETECTED => CONFLICT/STOP`, not automatic repair.

## Status
Exact independence model, archive quorum, witness retention horizon, and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.347 — study the minimum witness/archive coverage needed to prove non-omission across a retirement→reopen chain and how correlated witnesses affect the result.
