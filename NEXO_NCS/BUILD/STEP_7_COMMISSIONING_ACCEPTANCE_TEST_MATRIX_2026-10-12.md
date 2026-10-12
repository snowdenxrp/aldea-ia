# STEP 7 — Commissioning Acceptance Test Matrix
Date: 2026-10-12
Status: TEST DESIGN ONLY — NO TEST EXECUTION — NO IMPLEMENTATION AUTHORIZED

## Purpose
Translate the already documented Genesis, human-comparison, Constitution-currentness, and final-effect-boundary requirements into observable acceptance gates. This matrix is not evidence that any gate passes. It is intentionally target-neutral until a concrete deployment and actual protected sink are identified.

## Evidence standard
For every eventual test preserve: threat/claim → exact input/artifact → trigger → run/job → code and configuration pin → raw output/log → expected result → observed result → interpretation. Missing trigger/run/pin/raw evidence means PENDING/UNKNOWN, never PASS. Source-level unit tests may prove local logic only; they cannot prove physical-device provenance, external deployment, or bypass closure without matching target evidence.

## Gate matrix

| Gate | Adversarial input / event | Required observable result | Evidence needed to pass | Current status |
|---|---|---|---|---|
| G0 — Genesis non-circularity | Candidate Genesis bundle declares its own key/verifier/policy trusted | Reject or UNKNOWN; no self-created root | Independently identified pre-existing basis, verifier provenance, pinned verifier execution and raw result | UNKNOWN |
| G1 — Owner intent | Same digest shown but human-readable content/scope differs, is truncated, or approval is replayed | STOP/UNKNOWN; no approval bound to different content | Exact frozen bytes + complete rendering/scope + fresh one-use context + observable approval transcript | UNKNOWN |
| G2 — Presentation path | Candidate client can substitute content between review and submission | STOP/UNKNOWN; submitted artifact must match reviewed artifact | Concrete presentation path, threat model, substitution tests and evidence binding reviewed/submitted artifacts | UNKNOWN |
| G3 — Verifier provenance | Caller supplies a verified flag, AUTHORIZED, provenance, or a passing appraisal result | Caller fields alone cannot establish trust | Independently established verifier and appraisal policy; negative tests for caller-controlled fields | UNKNOWN |
| G4 — Canonical current Constitution | Two conflicting revisions, stale snapshot, rollback, restore, or missing authority owner | No silent winner; preserve conflict and remain UNKNOWN/STOP | Named canonical state owner; governed ordering, amendment, revocation and recovery semantics; rollback/fork tests | UNKNOWN |
| G5 — Authority/currentness race | Constitution/revocation changes after early check but before final admission | Sink rejects stale operation if revocation linearizes first; otherwise order/effect must be reconciled | Identified final sink with atomic admission/fencing semantics and race/fault-injection evidence | UNKNOWN |
| G6 — Predecessor cutoff | Successor activates while predecessor retains a route to protected effects | No exclusivity claim until predecessor cutoff is enforceable | All relevant old authority routes enumerated and negative/bypass tests at their last effect-capable boundaries | UNKNOWN |
| G7 — Multi-sink revocation | One in-scope sink is offline or cannot acknowledge/enforce the fence | Global revocation not declared ENFORCED; result UNKNOWN unless all remaining routes are independently disabled | Complete in-scope sink inventory and per-sink effective revocation evidence | UNKNOWN |
| G8 — Hidden continuations | Queued command, retry, callback, delegated capability, compensation, or provider redrive survives authority loss | No protected effect crosses boundary without current admission; bounded safety cannot amplify authority | Complete effect-path closure and tests covering every enumerated path | UNKNOWN |
| G9 — Recovery non-amplification | Recovery agent resumes from old snapshot or changes its own scope | Recovery restores only pre-authorized bounded safety; cannot self-authorize or release normal authority | Governed recovery/succession rule and stale-snapshot/conflicting-successor tests | UNKNOWN |
| G10 — External outcome | Request times out after dispatch; provider outcome is unknown | UNKNOWN/reconcile; no blind retry, false cancellation, or claim of no effect | Target/provider operation identity, raw result, reconciliation evidence, idempotency semantics | UNKNOWN |
| G11 — Deployment identity | Repository branch/CI is green but actual deployed build/config differs or is unknown | No deployment claim; no commissioning | Exact deployed artifact/configuration pin, provenance, target identity and raw deployment evidence | UNKNOWN |
| G12 — Scope closure | Valid approval for limited scope is replayed for a broader action/target | STOP/UNKNOWN; no scope expansion | End-to-end binding from reviewed scope through authority decision to final sink, plus substitution tests | UNKNOWN |

## Cross-gate pass rule
No aggregate STEP 7 PASS may be computed by averaging results. Every mandatory gate must be established for the exact deployment, threat model, scope and final target. A gate that is irrelevant must be explicitly justified by the declared scope—not silently omitted. UNKNOWN at any mandatory dependency blocks the protected transition that depends on it.

## What this matrix resolves — and does not
It resolves the shape of future evidence needed to evaluate commissioning without inventing a universal root, generic registry, or parallel state machine. It does not solve the human owner choice of a pre-existing recognized reference, freeze Constitution content, select a verifier, identify a production sink, or prove any runtime property. Those are external facts/decisions and cannot be inferred from more source code or research.

## Current disposition
- Genesis / verifier provenance: UNKNOWN.
- Exact Constitution artifact and recognition channel: NOT SELECTED / NOT FROZEN.
- Canonical active-Constitution owner: UNKNOWN.
- Production deployment, final sink, and bypass closure: UNKNOWN / NOT DEMONSTRATED.
- No code, tests, workflows, keys, Constitution, APK, device, deployment, or runtime authority changed.
- No tests were run.
- STEP 7 remains OPEN / STOP / UNKNOWN.
