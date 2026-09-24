# V8 Immediate Audit — 2026-09-23

V8 is the first deliberately minimal bounded canonical kernel. It has concrete singleton domains, explicit records, Init, Next, Spec, and a small set of invariants.

## Static audit

### V8-P01 — TLA+ toolchain availability is not established
No TLC/SANY executable is present in the current working environment. Therefore this artifact cannot honestly be reported as syntax-checked or model-checked yet.

### V8-P02 — `STRING` has been eliminated from the bounded model
Fingerprints use the finite value `fp1`; this removes one source of unbounded configuration.

### V8-P03 — Concrete record construction is now explicit
Init constructs the singleton operation/effect/target binding, authority, leases, evidence records and release record. This removes the V6/V7 abstract-record initialization defect.

### V8-P04 — Main success path is reachable in principle
The transition chain now includes Admit → AcquireExecution → StartExecution → MarkUnknown → AcquireReconciliation → Observe → VerifyEvidence → ReconcileApplied → VerifyOperation → AcquireRecovery → AuthorizeRelease → Commit.

### V8-P05 — Evidence carries observed effect state
`observedEffect = APPLIED` is required by VerifyEvidence and ReconcileApplied. This closes the direct observation-to-truth compression identified in V6, although the model still abstracts how the observation was independently obtained.

### V8-P06 — Context changes explicitly invalidate evidence/authorization
Policy change, dependency compromise and authority revocation invalidate valid evidence and release authorization. Freshness is handled by logical time.

### V8-P07 — Remaining semantic hole: policy/graph version is global
This is acceptable for the minimal kernel only if interpreted as a global safety-context version. A production model needs operation-scoped materiality and dependency closure.

### V8-P08 — Remaining semantic hole: STOP does not yet change effect state
STOP revokes the execution lease and invalidates release authorization, but the external effect remains potentially UNKNOWN. This is intentional: STOP is not being treated as proof of external cancellation.

### V8-P09 — Remaining semantic hole: lease expiry/takeover is absent
The bounded kernel tests mutual exclusion but not stale-owner takeover. That must be a separate extension after baseline model checking.

### V8-P10 — Potential invariant weakness
`ExactEvidenceBinding` is singleton-specific. It is suitable for the minimal kernel but must become a general relation when the model is expanded.

## Status

V8 is the first candidate for actual SANY/TLC execution, but execution has **not** occurred in this environment. No passing invariant result is claimed.

Next: establish a TLC/SANY toolchain if available; run the bounded V8 model; record every counterexample; then add lease takeover and STOP/effect race scenarios only after the baseline passes.
