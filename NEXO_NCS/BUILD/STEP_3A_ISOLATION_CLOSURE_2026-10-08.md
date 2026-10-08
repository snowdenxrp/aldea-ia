# NEXO NCS — STEP 3A ISOLATION CLOSURE — 2026-10-08

## Scope
Close the concrete isolation/detachment blocker identified in the STEP 1→3A cross-verification, using the already established Nexo contracts plus targeted external verification.

## Architectural decision
No architecture rewrite.

The existing protected lifecycle remains:
INTENT → CLAIM/PROVENANCE → ISOLATED WORKING SNAPSHOT → FINAL SEMANTIC VALIDATION → CONDITIONAL COMMIT → RECONCILIATION.

Isolation is treated as a hard boundary:
- claim-critical nested inputs must not retain mutable aliases to caller-owned objects;
- candidate state must not retain mutable aliases to canonical/source state;
- freezing a shallow container is insufficient;
- failure to establish required isolation must not be converted into success.

## Implementation change
Commit 5cf144853ed3d408bb93e611aea249b8ca0aa207:
- ClaimEnvelope claim-critical arrays now use deep clone + deep freeze through detachedImmutable().
- createCandidate() now deep-clones state through detachedMutable() rather than retaining the caller reference.
- Candidate state remains mutable for CandidateExecutor; it is detached, not frozen.
- structuredClone is used deliberately as the cloning primitive.

## Adversarial tests
Commit fae2e826c7b51dee3560b28fa8736414c4f55c98:
- mutate source nested authoritativeReads/dependencies/predicateDependencies/derivedProvenance/causalInputs/sourceProvenance after claim creation;
- verify detached claim does not change;
- attempt nested mutation of detached claim and require TypeError;
- mutate candidate nested state and verify source state does not change;
- mutate source state after candidate creation and verify candidate does not change;
- retain existing ownership/non-bypass contract checks.

## External cross-check
Targeted MDN review confirms:
- structuredClone creates a deep copy and preserves circular references; it throws DataCloneError for non-serializable input.
- standard shallow-copy operations such as spread/slice/Object.assign do not detach nested references.
- Object.freeze is shallow unless applied recursively.

These sources support the chosen mechanism, but they are not treated as proof of Nexo correctness.

## Evidence status
🟢 Architectural contract: accepted.
🟢 Claim-input deep detachment implemented.
🟢 Candidate-state deep detachment implemented.
🟢 Adversarial alias tests added.
🔵 Focused runtime execution in this environment: NOT VERIFIED.
🔵 SnapshotIsolator as a distinct construction module: still pending; createCandidate currently establishes the contract-level detachment primitive, not the final pipeline adapter.
🔴 Production-safe transition: NOT CLAIMED.

## Important boundary
This closes the specific contract defect in STEP 3A; it does NOT mean STEP 3B is complete.
Do not infer final semantic validation, authority enforcement, conditional commit, external-effect safety, or reconciliation from this change.

## Next action
Verify the focused tests in an executable environment. If they pass, proceed to the smallest STEP 3B composition around the established isolation primitive. If any test exposes an architectural contradiction, STOP and revisit the design rather than patching around it.

## DO-NOT-REPEAT
No TLC rerun.
No AB105.117R.
No sequential AB104/AB105 replay.
No broad historical audit.
No legacy-orchestrator patching.
No architecture rewrite without contradictory implementation evidence.
