# STEP 7 — Scope A existing persistence and verifier feasibility review — 2026-10-15

Branch: `ncs-clean-architecture`
Status: RESEARCH / SOURCE INSPECTION / NO IMPLEMENTATION

## 1. Question

Can an existing project persistence path safely serve as the record owner for a non-authoritative Scope A acknowledgement that a specific constitutional draft was reviewed, without implying constitutional legitimacy/currentness or authorizing effects?

## 2. Existing Scope A contract reused

This review extends, and does not replace, `STEP_7_SCOPE_A_REVIEW_EVIDENCE_MINIMUM_ACCEPTANCE_CONTRACT_2026-10-15.md` (blob `a5b751be5aad0ab7db9a76c44adb13b584644f40`).

That contract requires independent claims for candidate location, exact content/scope binding, evidence of the owner's actual narrow decision, durable persistence under a named host contract, verifier provenance, replay/freshness policy where applicable, a no-effect proof, and an explicit boundary that constitutional legitimacy/currentness remains UNKNOWN. It explicitly says not to reuse simulation state, mission memory, or effect journals as the constitutional-reference owner.

## 3. Concrete source findings

### 3.1 Conditional commit adapter

Inspected `src/nexo/adapters/conditional-commit-persist-state.mjs`, blob `9a707677c99d226f87f9b8b0d9e7673e7a1a100e`.

- The adapter forwards a candidate state to a supplied `persistState` function with a state path, clock value, expected revision and next revision.
- It maps a revision conflict to conditional conflict and other persistence exceptions to UNKNOWN.
- It does not identify or establish the legitimacy of a constitutional candidate, owner decision, verifier provenance, or an independent trust root.
- Its commit result is about the persistence operation, not about whether the persisted content was legitimately reviewed or is constitutionally current.

### 3.2 Core ownership and protected transition

Inspected `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`, and `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`.

- `effectBoundary.prepare` defaults to `NOT_IMPLEMENTED`.
- `executeProtectedTransition()` validates caller-provided port results and, after semantic PASS, calls `conditionalCommit.commit(candidate)`; the inspected function does not invoke `effectBoundary.prepare`.
- These modules are not a Scope A review-record service, and their passing unit tests would not by themselves establish an independently justified verifier or a no-effect boundary.

### 3.3 Runtime persistence separation

Inspected `src/nexo/runtime.js`, blob `1b4096bd6868fd9086ba6740f07d6a104a258651`, and `src/nexo/simulation-adapter.js`, blob `291ef4d43ca1af2dad29503d8c15f5cdd05aa114`.

- The runtime records mission execution/outcome in supplied in-memory Nexo memory.
- The inspected runtime does not call the canonical `persistState()` primitive itself.
- The simulation adapter's effect journal is supplied in memory; this is not a separate constitutional reference store.
- This finding is bounded to the inspected paths and does not claim an exhaustive repository-wide or deployed-runtime proof.

### 3.4 Existing canonical state storage is not sufficient as a trust boundary

The repository has an established simulation-state persistence path with revision/lock semantics, but its domain is the simulation snapshot. Historical P112 research already documents that the persistence lock is not an execution/effect fence, writers must honor its contract, and no storage `fsync`/directory-durability barrier was demonstrated. Those limitations matter if the claim includes crash/power-loss durability; they do not negate ordinary successful serialization, but they prevent stronger durability claims.

Reusing `world-state.json`, `simulation.nexoMemory`, assistant memory, or `effectJournal` for Scope A would conflate operational state with constitutional review evidence and violate the existing Scope A contract. Adding a separate file alone would not fix same-host compromise, trusted-presentation, decision-binding, or verifier-independence gaps.

## 4. Feasibility matrix

| Candidate already in the project | What it can support | Why it cannot currently satisfy Scope A |
|---|---|---|
| Git repository path/commit/blob | Locate a draft revision | Locator is not proof the owner saw the exact content or made a decision; repository metadata is not the review event |
| Simulation `persistState()` | Persist simulation snapshots with revision/lock checks | Wrong semantic owner/domain; no owner-review event protocol, no independent verifier, no trusted presentation binding |
| Nexo mission/outcome memory | Record operational execution claims | Runtime path leaves it in memory unless an external caller persists; not a constitutional reference owner |
| Effect journal / prepared-intent hook | Track operational effect lifecycle claims | Not a constitutional review store; existing persistence hook is not shown as an integrated durable review-record path |
| Protected-transition ports/tests | Exercise supplied contracts and classifications | Caller-injected ports/results do not establish their own provenance; effect boundary is not wired in the inspected composition |
| CI workflow / test result | Evidence about a particular source/build/test run | Does not establish owner intent, current constitutional authority, or deployed final-sink enforcement |

## 5. Finding

**No existing candidate inspected meets the Scope A acceptance contract.** This is not a proof that no conceivable solution exists; it is a bounded finding against the actual existing candidates and source paths reviewed.

The smallest missing capability is not “another database” or a generic boot framework. It is a **justified review-evidence boundary** that can bind the exact complete candidate and narrow decision, preserve the distinction between acknowledgement and ratification, report persistence uncertainty honestly, and be verified under an explicit threat model without letting the record authorize effects.

The present project has not selected:
- a host/write owner for this record;
- a trusted presentation/decision-binding mechanism;
- a verifier and independently justified provenance;
- a persistence durability claim appropriate to the threat model; or
- a demonstrated no-effect boundary for the record path.

Do not infer these from GitHub, a local file, Android biometric success, a passing test, or a successful write.

## 6. Next bounded research

1. Reuse the existing trust-domain inventory and compare only candidate domains already evidenced there; do not count a separate process/device/workflow as independent without dependency/failure-domain evidence.
2. State the threat model explicitly: if the ordinary Android host and its app are compromised, what surviving component can prove both the presented content and the owner's narrow acknowledgement?
3. If no existing component can do that, record the minimum missing capability rather than inventing a signer/service/store or relaxing L2.
4. Keep implementation STOP until the missing trust boundary is justified. After that, design one bounded Scope A record path and prove it cannot reach any protected effect sink.
5. Do not freeze/hash/sign the Constitution or record an owner-review event in the absence of an actual owner review and a valid content-to-decision protocol.

## 7. Non-actions and status

No code, tests, workflows, host, store, signer, key, digest, nonce, APK, device configuration, owner-review event, constitutional ratification, or protected effect was created or changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
