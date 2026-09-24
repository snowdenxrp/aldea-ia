# NEXO CLEAN ARCHITECTURE — A11 FAILURE/INTERLEAVING ADVERSARIAL AUDIT V1 — 2026-09-24

Status: ARCHITECTURE DESIGN / ADVERSARIAL ANALYSIS
Implementation: NOT STARTED
Formal verification: NOT STARTED

## Research basis

NIST SP 800-160 frames trustworthy-system engineering across the lifecycle and includes verification, validation, resilience and system-of-systems concerns. NIST SP 800-160 Vol. 2 Rev. 1 specifically targets systems that can anticipate, withstand, recover from and adapt to adverse conditions. Lamport's TLA+ guidance emphasizes checking invariants over all possible model behaviors and distinguishes safety from liveness; refinement is the relation between a lower-level implementation and a higher-level state-machine specification. citeturn0search0turn0search1turn0search9

## A11 — Adversarial failure/interleaving audit

The purpose of A11 is not to claim that the architecture is already proven safe. It is to attempt to produce a violating execution against every protected boundary.

Each scenario is tested conceptually with:
A→B
B→A
crash before linearization
crash after linearization
stale actor
retry
partition
delayed evidence
context change

A scenario is marked:
PASS = architecture specifies a blocking/ordering rule;
OPEN = required implementation mechanism is still unspecified;
FAIL = a legal sequence currently permits an unsafe semantic outcome.

## A11.1 Authorization ↔ Revocation

A→B:
authorization linearizes first; the historical authorization remains valid for that transition, subject to later protected checks.

B→A:
revocation linearizes first; stale authorization is rejected.

Crash:
uncertain ordering cannot grant a new effect.

Result: PASS at semantic level; exact store protocol OPEN.

## A11.2 Authorization ↔ Policy/Invariant change

If policy/invariant context changes before authorization linearization, admission fails or re-evaluates.

If authorization linearizes first, the committed transition retains its historical context; subsequent work uses the new context.

Result: PASS; implementation version fencing OPEN.

## A11.3 Reservation ↔ Reservation

Two actors cannot simultaneously own the same protected reservation generation.

One wins the protected transition; the other receives a stale/conflict result and must not continue using the failed reservation.

Result: PASS; atomic ownership mechanism OPEN.

## A11.4 Execution ↔ STOP

STOP before execution admission:
execution is rejected.

Execution admission before STOP:
the effect may already have crossed the protected boundary; STOP then blocks further locally controllable execution and triggers reconciliation.

Crash between STOP request and enforcement:
system remains in blocking state; no assumption of external cancellation.

Result: PASS semantically; external cancellation remains OPEN.

## A11.5 Execution ↔ Recovery

Recovery fence before final execution admission:
execution rejected.

Execution admission before recovery quarantine:
that operation retains its protected historical admission but unresolved external state prevents unsafe recovery release.

Recovery cannot reinterpret historical authorization.

Result: PASS.

## A11.6 Execution ↔ Decommission

Decommission linearizes first:
new execution is rejected.

Execution linearizes first:
historical effect remains part of lifecycle closure and must be reconciled before decommission closure.

Restart cannot resurrect a decommissioned identity.

Result: PASS.

## A11.7 Evidence ↔ Invalidation

Evidence accepted first:
later context change marks it stale/invalid for affected claims.

Invalidation first:
stale evidence cannot satisfy the protected gate.

Race cannot result in old evidence being accepted after the invalidation linearization point.

Result: PASS semantically; propagation implementation OPEN.

## A11.8 Verification ↔ VersionSet change

Verification must bind the exact VersionSet context.

A version change before verification:
old verification cannot authorize the new context.

A version change after a committed historical claim:
the historical claim remains historical; current release requires current-context verification where required.

Result: PASS.

## A11.9 Recovery ↔ UNKNOWN

UNKNOWN exists:
recovery cannot release merely because the process restarted or a checkpoint was restored.

Recovery may perform reconciliation.

UNKNOWN becomes resolved only through valid effect-specific evidence.

Result: PASS.

## A11.10 Retry ↔ External effect

Same intended effect:
retry uses the same EffectBinding/effect identity and idempotency semantics.

New semantic effect:
requires a new EffectBinding and fresh admission.

Result: PASS.

## A11.11 Timeout ↔ Response

Response after timeout does not prove that the effect did or did not occur.

The state remains protocol-defined pending/UNKNOWN until valid outcome evidence exists.

Result: PASS.

## A11.12 Restart ↔ Authorization

Restart does not restore authority.

Restored checkpoint state is treated as state requiring current identity, authority, STOP, recovery fence and VersionSet validation.

Result: PASS.

## A11.13 Restart ↔ STOP

If STOP state cannot be confidently reconstructed, execution remains blocked.

A restart cannot clear STOP implicitly.

Result: PASS.

## A11.14 Update ↔ Execute

Execution cannot use a VersionSet that is not admitted.

Activation requires fencing/ordering against affected protected execution paths.

An update must not silently change safety semantics while an old execution is relying on the previous context.

Result: PASS semantically; concrete rollout protocol OPEN.

## A11.15 Rollback ↔ UNKNOWN

Rollback image availability does not resolve an external UNKNOWN.

Rollback requires compatibility and recovery analysis.

Automatic rollback is forbidden when it would erase or reinterpret unresolved external effects.

Result: PASS.

## A11.16 Decommission ↔ Restart

Once decommission closure linearizes, restart of old workers cannot regain authority.

Old identity/fence must remain rejected.

Result: PASS semantically; durable anti-resurrection mechanism OPEN.

## A11.17 Delegation ↔ Revocation

Delegated authority is bound to parent scope and context.

Parent revocation invalidates affected child authority.

Child cannot exceed parent scope.

Result: PASS; delegation graph persistence/propagation OPEN.

## A11.18 Migration ↔ Concurrent write

Migration must define compatibility/version context and ordering.

Concurrent writes cannot be interpreted under two incompatible schemas without explicit protocol.

Migration failure must leave the system fenced or in a known compatibility state.

Result: OPEN pending migration architecture.

## A11.19 Storage rollback ↔ Epoch

Rollback of authoritative state to an older snapshot must be detected or made impossible from the protected protocol perspective.

An older epoch cannot regain authority.

Result: PASS requirement; implementation mechanism OPEN.

## A11.20 Snapshot restore ↔ Delegation

Restoring an older delegation snapshot cannot resurrect revoked authority.

Current delegation epoch/context must dominate restored historical state.

Result: PASS requirement; implementation mechanism OPEN.

## A11.21 Network partition ↔ Cached authority

Cached authority cannot be treated as indefinitely current.

If freshness/epoch cannot be established, protected execution becomes HOLD/RESTRICT.

Result: PASS.

## A11.22 Clock manipulation ↔ Lease expiry

Clock values cannot independently prove authority or world truth.

Lease/fence semantics must rely on an authority mechanism robust to the relevant clock failure model.

Result: OPEN pending trusted-time design.

## A11.23 Evidence ↔ Compromised observer

Compromise of an observer invalidates or reduces assurance for evidence dependent on that observer.

The architecture cannot assume a compromised producer remains trustworthy because its message is cryptographically authenticated.

Result: PASS.

## A11.24 Competing reconciliation

Two reconciliation actors cannot independently rewrite the same effect's verified state.

Reconciliation must be effect-specific, generation-aware and protected.

Conflicting observations produce CONFLICT/QUARANTINE rather than arbitrary winner selection.

Result: PASS; concrete reconciliation authority OPEN.

## A11.25 Audit write ↔ State commit

Audit history cannot be the sole source of authority.

Failure to write a non-authoritative audit replica must not retroactively change a protected commit, but failure to durably record required protected evidence must block a claim whose contract requires it.

Result: PASS.

## A11.26 Proof cache ↔ Model change

Cached proof/proof-status cannot authorize a changed model, implementation, VersionSet or proof context.

Context fingerprint mismatch invalidates the cached status.

Result: PASS.

## A11.27 Formal model ↔ Implementation change

A formal result remains evidence for its exact model/specification/configuration.

Implementation changes require correspondence impact analysis and re-verification as required.

Result: PASS.

## A11.28 Human approval ↔ Context change

Approval is bound to exact target, scope, operation/effect and relevant context.

If a material context changes before protected admission, approval cannot silently transfer to the changed effect.

Result: PASS.

## A11.29 Human approval ↔ Wrong target

Approval must not be inferred from broad intent.

Exact target/effect binding is required for protected operations.

Result: PASS.

## A11.30 STOP ↔ External cancellation

Local STOP and external cancellation are separate claims.

STOP may be verified locally while external cancellation remains UNKNOWN.

Result: PASS.

## A11.31 Unknown failure composition

The architecture must preserve UNKNOWN across:
restart,
timeout,
retry,
new operation ID,
rollback,
checkpoint restore,
lease expiry,
network recovery,
provider reconnect.

Result: PASS.

## A11.32 Common-mode collapse

If trust root, identity, policy, verifier, recovery, or protected store share a common compromised dependency, redundancy must not be counted as independence.

Result: PASS requirement; quantitative/common-mode analysis remains OPEN.

## A11.33 Resource exhaustion

Resource exhaustion must not allow:
- bypass of protected transitions;
- arbitrary authority escalation;
- deletion of critical UNKNOWN;
- STOP clearance;
- decommission resurrection.

Degraded resource state may force HOLD/RESTRICT.

Result: OPEN pending resource architecture.

## A11.34 Recovery-of-recovery

A recovery process crash leaves recovery fenced/quarantined until current recovery state is re-established.

Restart does not promote an intermediate recovery state to RELEASED.

Result: PASS.

## A11.35 A11 result

No semantic FAIL was found in the defined protected transition rules.

However, this is NOT a proof of correctness.

The following remain OPEN because the architecture has not yet selected concrete mechanisms:

- authoritative storage failure semantics;
- trusted-time model;
- migration;
- resource exhaustion controls;
- external reconciliation contracts;
- large-scale evidence invalidation;
- exact common-mode measurement;
- concrete fencing implementation;
- actual model checking;
- implementation refinement;
- fault injection.

## A11.36 New invariants extracted from the attack

INV-A11-01: No stale authority may create a new protected effect.
INV-A11-02: No stale coordination owner may pass a protected fence.
INV-A11-03: STOP cannot be cleared by restart.
INV-A11-04: Recovery cannot grant itself normal authority.
INV-A11-05: UNKNOWN cannot be erased by timeout, retry, rollback or new operation identity.
INV-A11-06: Evidence invalidated by current context cannot satisfy a current release.
INV-A11-07: Historical commit does not imply current authority.
INV-A11-08: Local STOP does not imply external cancellation.
INV-A11-09: External observation does not imply verified world truth.
INV-A11-10: Process/service/model diversity does not imply independent assurance.
INV-A11-11: Decommissioned identity cannot be resurrected from stale state.
INV-A11-12: Checkpoint restore cannot restore authority.
INV-A11-13: TCB changes invalidate affected assurance until re-evaluated.
INV-A11-14: Human approval is exact-effect and context-bound.
INV-A11-15: A failed protected transition cannot be interpreted as successful from an incomplete response.

## Gate

A11 adversarial semantic audit: PASSED WITH OPEN IMPLEMENTATION MECHANISMS
Semantic FAILS: 0
Implementation proof: NOT DONE
Formal model checking: NOT DONE

Next:
A12 formal boundary and canonical model variables
→ A13 technology-independent deployment mapping
→ A14 full architecture completeness/self-audit.
