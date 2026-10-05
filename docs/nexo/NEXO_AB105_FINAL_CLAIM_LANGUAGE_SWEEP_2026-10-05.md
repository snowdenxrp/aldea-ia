# NEXO AB105 — Final Claim-Language Sweep — 2026-10-05

## Purpose

Final epistemic reconciliation after the W1→D1 production source audit. This is a documentation audit, not a new experiment.

## Authoritative boundary

The current evidence supports:

- MetadataLoader → AclPublisher → W1: 🟢 identified.
- ENQUEUE → DEQUEUE: 🟢 identified through RequestChannel/ArrayBlockingQueue publication.
- DEQUEUE → D1: 🟢 identified by handler program order.
- W1 → ENQUEUE: 🔴 not identified.
- W1 → D1 JMM happens-before: UNKNOWN / NOT IDENTIFIED.
- Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- Security vulnerability: NOT ESTABLISHED.
- W1 → R1: UNKNOWN because AB105.117R contains no R1/downstream append-or-replication witness.

The Java Language Specification defines happens-before from program order and synchronizes-with edges and their transitive closure; temporal timestamp order alone is not a JMM proof.

## Claim audit

### Claims that must remain allowed

1. “Real-broker temporal ordering was observed.”
2. “W1 was observed before the later request-path authorization markers in the accepted witness.”
3. “RequestChannel provides publication between enqueue and dequeue.”
4. “The inspected production source did not identify a per-update synchronization edge from W1 to request admission/D1.”
5. “The nested aclCache update is not automatically published merely because StandardAuthorizer.data is volatile when the same StandardAuthorizerData instance remains in use.”

### Claims that must NOT be promoted

1. “W1 happens-before D1 is proven.”
2. “The stale ACL read was reproduced.”
3. “The vulnerability is proven.”
4. “D0_RETURN proves the target broker has applied W1.”
5. “W1 < ENQUEUE proves W1 HB ENQUEUE.”
6. “D1 DENIED proves stale visibility is impossible.”
7. “The successful G0 witness establishes a general Java Memory Model guarantee.”

### Evidence-family separation

- PR92: in-process cache-identity diagnostic; not JMM proof.
- PR93: production source/publication-boundary audit; not runtime stale-read proof.
- PR94/G0 and AB105.117R: real-broker temporal witness; not JMM proof.
- TLC: historical finite model; do not rerun merely because G0 succeeded.

These families answer different questions and must not be merged into a stronger claim.

## AB105.117R correction

AB105.117R EXISTS and is VERIFIED_RAW_EVIDENCE:

- commit: 604a692b753bfac69a88819c58e95d92f594e881
- run: 37098764557
- job: 111133973894
- artifact: 11265332252
- artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c

Do not recreate it and do not count artifact 11265332252 twice.

The historical association of run 370778 with artifact 11265332252 remains unresolved and is not treated as an independent sample.

## Search limitation

Repository code-search returned no matches for several claim phrases during this sweep. This is not treated as proof of repository-wide absence because the search index has previously demonstrated incomplete coverage. Known canonical documents were fetched directly and reconciled.

## Final epistemic state

HB(W1→D1) = UNKNOWN / NOT IDENTIFIED

Stale-read execution = NOT OBSERVED / NOT DISPROVEN

Security vulnerability = NOT ESTABLISHED

## DO-NOT-REPEAT

- Do not rerun PR92.
- Do not rerun PR93.
- Do not rerun PR94/G0 solely to answer the already-audited source question.
- Do not rerun TLC.
- Do not add volatile/latch/barrier/Future solely to force W1→D1 ordering.
- Do not recreate AB105.117R.

## Next frontier

AB105 documentation claim language is now bounded by the above epistemic state. Any future work must introduce genuinely new evidence, not another restatement of temporal ordering as JMM happens-before.
