# STEP 7 — Genesis AuthorityGate Control-Path Map — 2026-10-11

Status: SOURCE-BASED MAP — IMPLEMENTATION GAP — NO GENESIS WIRING

## Purpose

Map the existing generic AuthorityGate port to the Genesis Trust Foundation and actual enforcement requirement without inventing a new abstraction.

## Concrete source evidence

- `src/nexo/core/ownership.mjs`: `createCorePorts()` accepts an injected `authorityGate` and defaults its `check` method to a `NOT_IMPLEMENTED` error. This is a port, not an authority implementation.
- `src/nexo/core/protected-transition.mjs`: calls `ports.authorityGate.check(claim)`; accepts AUTHORIZED/STOP/UNKNOWN and fails closed for STOP/UNKNOWN before candidate work. The behavior depends on the injected port's truthfulness and provenance.
- `src/nexo/core/contracts.mjs`: `createAuthorityResult(status, {reasons,evidence})` checks shape/state values and freezes the resulting object; it does not establish the source or legitimacy of authority.
- `tests/nexo/protected-transition.test.mjs`: focused tests inject test functions that return AUTHORIZED, STOP or UNKNOWN. These tests exercise composition behavior, not a production Genesis Trust Foundation or independent recognition.
- `src/nexo/adapters/conditional-commit-persist-state.mjs`: adapts a conditional persistence call and returns COMMITTED/CONDITIONAL_CONFLICT/UNKNOWN. This is an application-state persistence adapter, not proof of the final constitutional commissioning/effect boundary.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`: constitutional context must come from an already-recognized trust foundation.
- `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`: explicitly stops implementation while that foundation is absent.

## Minimal path map

| Edge | Required meaning | Existing evidence | Status |
|---|---|---|---|
| A. Owner decision → exact approval intent | Kevin intentionally approves one exact Constitution/version/context and one transition | Governance owner is recorded; no implemented approval protocol or exact-content binding evidenced | UNKNOWN |
| B. Exact approval intent → verified approval evidence | Presentation and submitted context are identical; approval cannot be fabricated/replayed within the accepted threat model | No genesis-specific presentation/approval verifier identified | UNKNOWN |
| C. Verified approval → recognized genesis basis | Basis and verifier legitimacy are grounded outside candidate self-assertion; provenance/dependencies/currentness are evaluated | Genesis contracts specify obligations; no implemented basis/verifier evidenced | UNKNOWN |
| D. Genesis basis → AuthorityGate result | AuthorityGate derives AUTHORIZED/STOP/UNKNOWN from the recognized basis and exact claim, not caller labels | Generic port exists; no genesis-specific implementation located in reviewed source search | UNKNOWN |
| E. AuthorityGate result → protected transition | STOP/UNKNOWN cannot reach candidate/commit | Generic composition implements these branches; tests inject mocked results | Composition behavior exists; input legitimacy remains UNKNOWN |
| F. Validated candidate → committed state | Semantic validation precedes conditional state commit | Generic composition and persistState adapter exist for the application's state boundary | Implemented boundary, but not shown to be constitutional commissioning boundary |
| G. Constitutional transition → last protected effect boundary | No bypass can install/activate protected constitutional authority without the recognized decision | No deployment-specific last boundary or bypass-closure evidence identified in current records | UNKNOWN |
| H. Currentness/revocation/recovery → continued authority | Stale/revoked/superseded or recovered authority cannot become current by snapshot/version alone | Existing semantic contracts and historical evidence state the invariant; concrete current enforcement not evidenced | UNKNOWN |

## Interpretation

The existing generic path can safely handle an explicitly supplied STOP/UNKNOWN and can compose candidate validation with application-state persistence. It does not supply the missing trust basis that determines whether AUTHORIZED is legitimate. A shape-valid `AuthorityResult` and a successful local commit are insufficient to establish the Genesis Trust Foundation or constitutional commissioning.

Do not solve this by:
- treating the port name as a security property;
- adding a constructor, registry or wrapper that only moves the trust assertion;
- changing the generic transition to assume that any injected AUTHORIZED result is genuine;
- equating application-state persistence with the last protected effect boundary;
- claiming runtime proof from tests whose AuthorityGate is an injected test double.

## Decision and next gate

The present source evidence does not identify an implemented genesis-specific AuthorityGate or actual last enforcement boundary. Thus the human-supervised assumption set is not yet ready for owner acceptance: even an explicitly accepted host assumption would not ground these missing components.

Next work should identify the first concrete Nexo deployment effect that initial commissioning must control and its actual last controllable boundary. If no concrete target exists yet, record that as a deployment-scope decision rather than inventing a generic enforcement layer. Only after the target is concrete should we define the smallest AuthorityGate evidence contract for that transition and attack it before code.

## Disposition

Genesis Trust Foundation: UNKNOWN. IR-1: NOT ESTABLISHED. AuthorityGate implementation for genesis: NOT EVIDENCED. Final commissioning effect boundary: NOT IDENTIFIED/UNKNOWN. Constitution Authority Context and protected commissioning remain STOP. Non-protected work may continue.
