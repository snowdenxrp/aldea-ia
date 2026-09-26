# NEXO — CURRENT EFFECT PATH CAPABILITY MAP V1
Date: 2026-09-25
Status: RESEARCH / PRE-IMPLEMENTATION AUDIT. No V21.

## Path map
1. executeNexoStep → createEffectAdapter → handler → postcondition.
Control: idempotency key and optional prepared-intent hook exist. Missing: protected owner_generation, authority_epoch, STOP binding, resource_incarnation and capability class. Classification: not yet eligible for R2 claims.

2. executeLuminaNexoStep → createLuminaEffectAdapter → local Lúmina mutation.
The current handler directly mutates simulation state and bumps nexoEffectRevision. This is a local control/effect revision, not an externally enforced fence. Classification: bounded local mechanism only; no external R2 claim.

3. persistState → world-state.json.
The filesystem lock and stateRevision protect the persistence path against concurrent state writers and stale expectedRevision. They do not fence an already-running effect handler and are not a resource-side effect fence. PostgreSQL's advisory-lock model illustrates the same distinction: advisory locks have application-defined meaning and the system does not enforce that all mutation paths honor them. Official etcd documentation likewise says external resources need their own version-validation mechanism; an etcd lock alone cannot protect them. 

4. scripts/assistants.mjs.
It builds and persists a Nexo mission but currently does not execute it. Therefore this path is a planning/control persistence path, not an effect path. No execution-owner guarantee can be inferred from its stateRevision write.

## Concrete bypass / defect findings
B1 HIGH: no capability-class field is carried by current effect request/binding. Strong effect guarantees therefore cannot be declared.
B2 HIGH: no owner_generation/resource_incarnation/STOP epoch is checked by createEffectAdapter immediately before handler dispatch. A prior precondition/stateVersion check is not an external fence.
B3 HIGH: handlers in simulation-adapter mutate simulation directly. Any future alternate caller can bypass the intended protected admission unless every mutation entry point is routed through the same contract.
B4 HIGH: persistState lock serializes file persistence, not effect execution. A process can hold an in-memory effect decision while another actor changes the state before persistence.
B5 HIGH: nexoEffectRevision is in-memory only. persistState serializes world, agents and nexoMemory but does not serialize nexoEffectRevision. After restart, simulation-adapter initializes it from zero. Therefore it cannot serve as a durable cross-restart fence or monotonic resource incarnation.
B6 MEDIUM: executionJournal is capped at 200 entries. Old effect identities can disappear from local memory, so long-lived reconciliation cannot assume journal retention is sufficient.
B7 MEDIUM: handler exception returns UNKNOWN semantics but does not persist a terminal result, which is correct for uncertainty; however the prepared entry itself is only durably safe if persistPreparedIntent is actually connected to the authoritative persistence boundary. Current production callers do not provide that hook.
B8 MEDIUM: postcondition evidence is local simulation evidence. It cannot establish external-world truth for a resource outside the simulation boundary.

## RC mapping
RC1 capability claim: FAIL/OPEN — no explicit capability class.
RC2 all mutation paths fenced: FAIL/OPEN — direct handlers are callable inside adapter without owner/fence contract.
RC3 fence scope: OPEN — no resource fence exists.
RC4 incarnation: FAIL/OPEN — no durable resource incarnation binding.
RC5 STOP binding: FAIL/OPEN — no final STOP validation.
RC6 UNKNOWN on ambiguous dispatch: PRESENT locally — exception/uncertain reconciliation preserves uncertainty, but external applicability is unproven.
RC7 R1 idempotency ≠ stale-owner exclusion: RESPECTED.
RC8 R2 fence ≠ multi-resource atomicity: RESPECTED.
RC9 R3 transaction scope: NOT CLAIMED.
RC10 bypass inventory: FOUND — direct simulation handlers and separate persistence boundary.
RC11 recovery reacquisition/reconciliation: PARTIAL — journal reconciliation exists, current authority reacquisition does not.
RC12 retry/compensation distinct: PRESERVED by prior research; no compensation implementation.

## Repair decision
Do not patch these gaps by adding another local lock or by treating nexoEffectRevision/stateRevision as owner_generation. The next clean-architecture artifact must define a protected authority/effect binding boundary first, then determine which local Lúmina transitions can legitimately instantiate that contract.

## Historical residuals preserved
AB50→AB58 unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED.

## DO-NOT-REPEAT
Do not promote stateRevision or nexoEffectRevision into fencing.
Do not call the filesystem lock an external fence.
Do not infer execution-owner safety from the prepared journal alone.
Do not silently persist nexoEffectRevision as a claimed solution; its semantics must first be defined.
Do not implement V21.
Do not claim CI/test PASS without fresh evidence.

## EXACT NEXT ACTION
Research and formalize the minimum protected local Lúmina transition boundary: owner/fence record, effect binding, resource incarnation, STOP epoch, prepared intent durability, and final admission point. Then compare it against the current stateRevision/file-lock topology without implementation.