# NEXO — LÚMINA CRASH-CUT RECOVERY EVIDENCE V1
Date: 2026-09-25
Status: RESEARCH ONLY / PRE-IMPLEMENTATION

## Result
Current Lúmina must keep CONTROL_ADMITTED and LOCAL_EFFECT_COMMITTED as separate states. The current handler/persistState split cannot prove atomic local commit.

## State machine
PREPARED -> CONTROL_ADMITTED -> LOCAL_COMMITTING -> LOCAL_EFFECT_COMMITTED -> OUTCOME_CONFIRMED.

CONTROL_ADMITTED proves protected admission only. LOCAL_EFFECT_COMMITTED requires durable state plus matching durable effect/history identity. OUTCOME_CONFIRMED requires evidence sufficient for the specific claimed property.

## Crash cuts
C0 before admission: reject or leave prepared; no effect occurrence inferred.
C1 after admission before mutation: admission survives, but execution is not proven; retry requires current authority.
C2 during durable commit: recovery must distinguish pre-state from post-state using an explicit journal/transaction protocol. Without that evidence the result is UNKNOWN/HOLD.
C3 after durable commit before response: local commit can be reconstructed by durable identity; response loss is not a second effect.
C4 STOP/owner transfer: old admission cannot authorize a later retry.
C5 recovery restart: new recovery_incarnation; checkpoint does not restore authority.
C6 resource replacement: old resource_incarnation invalid unless continuity is proven.
C7 stale writer: stateRevision can reject stale persistence, but authority must be checked at the protected mutation boundary.
C8 multi-resource local transition: atomic only when all participants share one transaction boundary; otherwise preserve participant-level outcomes.

## Evidence rule
A version number, filesystem lock, or temp-file rename is not sufficient by itself to prove atomic crash recovery. SQLite documents explicit transaction/recovery mechanisms and crash testing for this property; etcd documents atomic guarded transactions. These are reference models, not Nexo proof.

## Next architecture consequence
Do not patch the current split to simulate atomicity. Future implementation must select or define a transactional/journal boundary with explicit atomicity, isolation, durability and recovery semantics, then fault-inject every crash cut.

Verification: no formal verification; no implementation; no current CI PASS claimed.
