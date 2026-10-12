# STEP 7 — Authority Bootstrap and Final-Effect Boundary Attack Matrix
Date: 2026-10-12
Branch: ncs-clean-architecture
Status: SOURCE-REVIEW FINDINGS + TEST PLAN — NOT IMPLEMENTED — NO PROTECTED COMMISSIONING

## Objective
Advance STEP 7 without waiting for the owner-reference PDF/print workflow. Determine what the repository proves, what the external architecture standards imply, and which concrete proof obligations must pass before any protected commissioning.

## Primary source observations

### A. Protected transition tests establish component behavior, not root legitimacy
File: `tests/nexo/protected-transition.test.mjs`
- The common test fixture supplies `authorityGate.check: () => createAuthorityResult(AUTHORITY.AUTHORIZED)`.
- Negative tests establish that `UNKNOWN` avoids isolation, candidate execution, validation, and commit.
- These tests are useful for fail-closed control-flow behavior, but their authority result is synthetic caller-controlled fixture data. They do not authenticate a Genesis verifier, establish a canonical active Constitution, or prove complete mediation in a deployed effect path.
- The test file's final missing-gate probe checks the default `NOT_IMPLEMENTED` gate throws before later operations. It does not establish the legitimacy of a production authority source.

### B. The protected transition does not invoke the declared effect boundary
Files: `src/nexo/core/ownership.mjs`, `src/nexo/core/protected-transition.mjs`
- `createCorePorts` defines `effectBoundary.prepare`, defaulting to `NOT_IMPLEMENTED`.
- `executeProtectedTransition` performs claim construction, injected authority check, isolated candidate execution, final semantic validation, then `conditionalCommit.commit(candidate)`.
- No `effectBoundary.prepare` invocation appears in this transition.
- Therefore, adding a call mechanically is not yet a justified fix: the repository does not establish the real protected sink, the final linearization point, or the canonical authority context that the boundary must enforce.

### C. The current policy-context resolver validates shape/status, not the truth of its inputs
File: `src/nexo/core/policy-context-resolver.mjs`
- Identity, applicability, dependencies, temporal status, and provenance status are supplied as input records.
- The resolver combines PASS/FAIL/UNKNOWN states but does not itself authenticate the producers or prove their freshness.
- Immutable output and required hash/version fields are data integrity conveniences, not a root of trust.

### D. Existing persistence tests are simulation-state tests
File: `tests/nexo/conditional-commit-persist-state.test.mjs`
- The test wires a synthetic AUTHORIZED fixture and persists a simulation snapshot.
- This is evidence for the tested conditional persistence path only. It is not evidence of a production constitutional-state owner or external effect admission.

## External architecture grounding
IETF RFC 9334 (RATS Architecture): https://www.rfc-editor.org/rfc/rfc9334.html
- Separates Attester evidence, Verifier appraisal, and Relying Party application-specific authorization.
- Distinguishes trust from trustworthiness and identifies freshness/trust relationships as architectural concerns.
- A relying party needs an established trust relationship with the verifier (for example, a trust anchor established out of band); an attestation result does not bootstrap its own trust.
- RATS is an architecture model, not a drop-in implementation or proof that Nexo is secure.

Reference-monitor principle: complete mediation requires every security-sensitive access to the protected resource to pass through the enforcement mechanism; the mechanism must resist bypass and be sufficiently verifiable. A central function/test cannot prove this without a bounded inventory of real sinks and all reachable entry points.

## Adversarial matrix required before any protected commissioning

| Case | Expected result | Evidence needed |
|---|---|---|
| Caller supplies a fabricated AUTHORIZED result | UNKNOWN/STOP; no protected effect | Test uses untrusted caller input and verifies it cannot instantiate trusted authority |
| Genesis verifier absent or unrecognized | UNKNOWN/STOP | Independent root/reference provenance and explicit unavailable-path test |
| Constitution bytes, rendering, version, or scope differ from owner-recognized proposal | HOLD/STOP; no activation | Exact-content/scope binding and mismatch test |
| Replayed or stale approval/challenge | UNKNOWN/STOP | Freshness semantics, one-time/context binding, replay test |
| Authority revoked or currentness cannot be established | UNKNOWN/STOP | Canonical current authority source and revocation/freshness tests |
| Conflicting active Constitution revisions or recovery snapshot | UNKNOWN/STOP | Single canonical state-owner contract and fork/rollback/recovery tests |
| Semantic validator returns UNKNOWN or FAIL | No commit/effect | Existing unit coverage plus final-sink assertions |
| Direct caller bypasses Core and invokes a sink | Denied at sink | Reachable entrypoint/sink inventory and negative bypass tests |
| Crash before, during, or after external effect | Reconcile before retry; no false claim of no effect | Actual sink's durable intent/receipt semantics and interruption tests |
| Effect target/provider differs from the approved scope | Denied | Target identity/incarnation and scope binding at the final enforcement point |

Synthetic fixtures may validate component semantics, but must be labeled synthetic and must never be reported as Genesis trust evidence.

## The smallest defensible path forward

1. Keep the owner's proposed PDF as a workflow aid only until exact content/scope is frozen and the owner recognizes it through a genuinely independent reference path. Printing later is acceptable; delay of printing does not block code review or synthetic tests.
2. Establish an explicit, replaceable Genesis trust basis before implementing a Constitution Authority Context. Do not let a constructor, hash, Git commit, local key, caller flag, model output, or recovered snapshot authenticate itself.
3. Identify the actual protected operation(s) and deployed effect sink(s) before designing the final boundary. If the reviewed branch only has simulation effects, record that scope limit rather than inventing a production sink.
4. Specify and attack the authority gate using the matrix above. Do not change production control flow until the verifier's trust basis, active Constitution owner, and sink/linearization point are concrete.
5. Prove complete mediation across every reachable entry point. If any relevant sink or deployment identity is unknown, commissioning remains STOP.
6. Keep authority, policy decision, state commit, and external effect as distinct semantics. A successful state commit does not prove an external effect was safely authorized; a prepared intent does not prove whether an external effect occurred.

## Current disposition
- Genesis trust foundation: UNKNOWN / NOT ESTABLISHED.
- Constitution Authority Context: NOT ESTABLISHED.
- Production AuthorityGate composition: NOT ESTABLISHED in the reviewed branch.
- Canonical active-Constitution state owner: NOT ESTABLISHED in the reviewed branch.
- Final effect boundary and bypass closure: UNKNOWN.
- Protected commissioning: STOP.
- Safe work that continues now: bounded source tracing, adversarial test design, and synthetic component tests.
- No production code, tests, workflow, APK, key, Constitution artifact, or runtime state was changed by this report.

## Source links
- Core transition: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/protected-transition.mjs
- Core ports: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/ownership.mjs
- Transition tests: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/protected-transition.test.mjs
- Persistence integration test: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/tests/nexo/conditional-commit-persist-state.test.mjs
- Policy-context resolver: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/src/nexo/core/policy-context-resolver.mjs
- Genesis trust contract: https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md
