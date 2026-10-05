# AB105 CONTINUITY — SECOND CLOSURE RECONCILIATION — 2026-10-04

## Verified contradiction

The repository contains a direct, immutable record proving AB105.117R exists:

- commit: 604a692b753bfac69a88819c58e95d92f594e881
- file: docs/nexo/AB105.117R_G0_REAL_BROKER_ORDERING_WITNESS_V2_2026-10-03.md
- run: 37098764557
- job: 111133973894
- artifact: 11265332252
- artifact SHA-256: d8a9e021e02871a3158b1ce0e88e7fae34b33ba5a804f9375a5fd8b20f878a7c
- head SHA: 4026db554b617243c13de7f881b98473852aee7b

The later closure commit f2b8298e1fb1aec9044df6ad048b3fe6d7b877ce incorrectly stated “AB105.117R: NOT CREATED”. That statement is superseded.

## Scientific content of AB105.117R

AB105.117R is genuine raw real-broker evidence. It records 10 completed cycles with W1 observations, D0_RETURN, denied D1, and request-path events. It explicitly records:

- no R1 marker/downstream append-or-replication witness in the artifact;
- W1→R1 ordering: UNKNOWN;
- JMM HB from ACL write observation to later authorization: UNKNOWN.

Therefore AB105.117R strengthens the evidence inventory but does NOT close the JMM question.

## Important reconciliation

The existence of AB105.117R and the later production-source audit are compatible:

1. AB105.117R proves the real-broker witness executed and produced raw temporal evidence.
2. The later source audit establishes that ENQUEUE→DEQUEUE and handler program order are real synchronization/order edges.
3. Neither establishes a cross-domain W1→D1 happens-before edge.
4. PR93's diagnostic observation remains empirical diagnostic evidence, not a JMM theorem.
5. No stale authorization was observed in the accepted diagnostic, but stale visibility is not formally excluded.

## Canonical state after reconciliation

AB105.117R: EXISTS / VERIFIED_RAW_EVIDENCE

W1→D1 JMM HB: UNKNOWN / NOT IDENTIFIED

W1→R1: UNKNOWN

Stale-read: NOT OBSERVED / NOT DISPROVEN

Security vulnerability: NOT ESTABLISHED

## DO-NOT-REPEAT

Do not recreate AB105.117R.
Do not rerun PR92/PR93/PR94 merely to repair documentation.
Do not rerun TLC.
Do not add synchronization that would manufacture W1→D1 HB.
Do not treat timestamps or temporal ordering as JMM causality.

## Next frontier

The investigation should now be treated as an epistemic closure problem: maintain the raw AB105.117R witness, reconcile all later continuity notes against it, and only pursue a new R1/downstream instrumentation path if that path is scientifically necessary and can be added without creating the very happens-before edge under investigation.
