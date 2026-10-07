# NEXO AB105 — FINAL EVIDENCE RECONCILIATION — 2026-10-06

## Scope
Post-closure reconciliation after the bounded W1→D1 production-path audit. This document does not create an AB checkpoint and does not replace AB105.116R.

## Accepted canonical raw chain

The only authoritative raw real-broker chain for the ordering witness is:

37098764557 → job 111133973894 → artifact 11265332252
head SHA: 4026db554b617243c13de7f881b98473852aee7b
artifact SHA-256:
d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c

The historical identifier 370778 is currently unresolved through the live Actions API and must not be counted as a second execution or second artifact.

## Evidence acceptance decisions

### PR #84
Historical failed execution. Real Kafka denial was observed, but the harness did not complete the intended A1→D0→D1→D2→E witness. Not accepted as target-race evidence.

### PR #87–#91
Diagnostic/design/compile lineage. No independent accepted runtime sample that changes the epistemic boundary. Do not count separately.

### PR #92
Accepted empirical cache-identity diagnostic family. Useful behavioral evidence only; does not establish JMM happens-before.

### PR #93
Accepted source/architecture and empirical diagnostic family. Establishes the production execution domains and the bounded absence of an identified W1→D1 publication edge. Does not prove stale visibility or safety.

### PR #94 / authoritative G0 witness
Accepted real-broker temporal evidence. W1 < ENQUEUE < DEQUEUE < AUTH_ENTER < AUTH_DECISION was observed. This remains temporal evidence, not JMM HB.

### PR #95
Execution path unverified. Its claimed 100-cycle result is not promoted.

### PR #96
Implementation unverified. Its claimed prewarm result is not promoted.

## Final epistemic matrix

| Claim | Status |
|---|---|
| MetadataLoader/AclPublisher performs W1 | VERIFIED |
| RequestChannel ENQUEUE→DEQUEUE publication | VERIFIED |
| DEQUEUE→D1 program order | VERIFIED |
| W1 < ENQUEUE temporally | OBSERVED |
| W1→ENQUEUE JMM HB | UNKNOWN / NOT IDENTIFIED |
| W1→D1 JMM HB | UNKNOWN / NOT IDENTIFIED |
| stale-read execution | NOT OBSERVED / NOT DISPROVEN |
| W1→R1 exploit chain | UNKNOWN |
| security vulnerability | NOT ESTABLISHED |
| safety proof | NOT ESTABLISHED |

## Duplicate / supersession rules

- Do not count 370778 and 37098764557 as separate samples.
- Do not count artifact 11265332252 twice.
- Do not recreate AB105.117R.
- Do not rerun G0 merely to repair historical identity bookkeeping.
- Do not rerun TLC.
- Do not rerun PR92 or PR93.
- Do not add synchronization to the experimental harness.

## Branch status

The W1→D1 causal-path audit is CLOSED/BOUNDED.

Remaining work is evidence maintenance and future research only. A future experiment may reopen the question only if it asks a genuinely distinct question and provides a clean six-link acceptance chain:

trigger/path → run → job → executed head/pin → raw artifact/log → semantic interpretation.

No current evidence justifies upgrading UNKNOWN to vulnerability or safety.

## Continuity anchor

Protected research anchor: AB105.116R.
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
Previous closure commit: 0c7258fd895a31aec823c1cde0678fb66af11c19.
