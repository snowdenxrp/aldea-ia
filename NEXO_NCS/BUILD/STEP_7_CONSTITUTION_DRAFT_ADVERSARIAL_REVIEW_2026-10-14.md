# STEP 7 — Adversarial review of the human-readable Constitution draft
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: SOURCE REVIEW / DRAFT NOT FROZEN / NO COMMISSIONING

## Scope

Reviewed the complete human-readable draft against the MASTER's constitutional requirements, the clause traceability map, the artifact-readiness audit, the Genesis Trust Foundation contract, the Core authority-source composition gate, and the concrete execution-path crosswalk. This is a bounded document review, not a full re-audit of historical AB/P/P112 findings and not runtime verification.

## Finding 1 — dual control was at risk of being treated as merely undefined

The MASTER explicitly lists “control dual para cambios constitucionales” as a required property of the Constitution/System Transition Gate. The draft previously said that it would not invent a “dual-control implementation” while leaving the amendment procedure OPEN. Although this avoided inventing details, it did not explicitly preserve the MASTER's requirement as a non-optional invariant; readers could interpret dual control itself as undecided.

### Correction applied

Updated section 7.1 of `STEP_7_CONSTITUTION_HUMAN_READABLE_DRAFT_2026-10-14.md`:
- dual control for constitutional changes is now explicitly preserved as a design invariant;
- the concrete roles, failure-domain separation, approval threshold, key arrangement and implementation remain OPEN;
- two keys/devices/processes are not presumed independent solely because they differ.

Draft update commit: `bcba741ae25cc76467b95c4ba79e4b567035b0b5`.

## Finding 2 — currentness/revocation invariant needed a direct clause

The traceability map labels C-11 `RECOVERED / OPEN`: the principle that a once-valid or correctly signed Constitution is not necessarily current is recovered, while the canonical current-state owner and enforcement mechanism remain OPEN. The draft covered related ideas across technical-metadata and conflict clauses, but did not state this principle directly in its operative section.

### Correction applied

Added section 3.4, “Currentness, revocation and rollback,” to the human-readable draft. It explicitly preserves the recovered invariant while keeping the current-state owner and ordering mechanism OPEN. No currentness implementation or active Constitution is inferred.

Draft update commit: `6f60ea8fbec35359d9cdd8d29c89c95c9a2fbe6f`.

## Finding 3 — traceability label lagged behind a recorded decision reconciliation

The clause map still labeled C-19 as a source-status conflict even though STATUS and the bounded-premise decision record had already reconciled the earlier threat-model wording as stale. Updated C-19 to `RECOVERED / BOUNDED ASSUMPTION ACCEPTED`, retaining the strict limit to the first recognition ceremony and the requirement for a new explicit decision before any expansion.

Traceability-map update commit: `ed01187616b1f27c0c30f6886969e48d08efa1b3`.

## Cross-check of other major boundaries

- **Genesis vs Constitution vs identity/policy/recovery/execution:** separation is preserved; the draft does not let a candidate bootstrap itself.
- **Owner intent and honest-device premise:** the premise remains bounded to the first recognition ceremony and is not promoted into technical proof or permanent platform trust.
- **UNKNOWN/CONFLICT/currentness:** uncertainty remains fail-closed; no timestamp, hash, signature or technical recency is made constitutional authority.
- **Emergency containment, succession and recovery:** unresolved concrete procedures remain explicitly OPEN; no successor or recovery root is invented.
- **Protected sink and runtime composition:** the draft does not claim implementation. Existing source crosswalk still finds no evidenced canonical Constitution state owner or suitable final protected-effect sink.
- **Content-to-review binding and amendment activation:** remain OPEN prerequisites; no digest/signature or commissioning is appropriate while the draft is changing.

No additional direct contradiction was established in this bounded review. That is not proof that all MASTER/AB/P/P112 semantics are exhausted; traceability remains necessary and unresolved items remain visible rather than silently closed.

## Disposition

The correction improves fidelity to the MASTER without choosing a concrete dual-control mechanism. Do not create keys, compute a commissioning digest, freeze the Constitution, wire a sink, or claim any gate passed from this review.

No source code or tests changed or ran. No keys, signatures, device, APK, deployment, or runtime authority changed.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
