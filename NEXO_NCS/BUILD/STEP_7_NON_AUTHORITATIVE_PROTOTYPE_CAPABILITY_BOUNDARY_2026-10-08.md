# STEP 7 — Non-Authoritative Prototype Capability Boundary
Date: 2026-10-08
Status: DESIGN CANDIDATE; NOT IMPLEMENTED; DOES NOT AUTHORIZE ROOT/CONSTITUTION ACTIVATION

## Purpose
Define what research and prototype work may continue while the initial verifier/root basis remains unresolved, without letting prototype convenience silently create authority or external effects.

This boundary follows existing MASTER/NCS semantics: unresolved legitimacy blocks dependent transitions, but does not necessarily stop unrelated safe work. It is not an implementation or runtime-security claim.

## Capability classes

### P0 — Pure design and analysis (permitted)
- Read and compare existing architecture/research artifacts.
- Draft specifications, invariants, threat models, state machines and tests.
- Use synthetic data and simulated environments.
- Produce deterministic outputs with provenance labels and explicit uncertainty.
- Record proposals/decisions in the research branch with review status.
No external effects, protected state mutation or authority claims.

### P1 — Isolated local simulation (conditionally permitted)
- Run tests against disposable local state and synthetic identities/credentials.
- Simulate policy, revocation, recovery, commissioning and external providers without real credentials or live endpoints.
- Verify invariants within the stated test model; label results as simulation/test evidence only.
- Reset the sandbox without affecting any real Nexo identity, memory, authority or external system.
Conditions: environment isolation, no production secrets, no network egress by default, explicit test fixtures and evidence provenance. If isolation is not established, remain P0.

### P2 — Non-authoritative local prototype (not yet approved)
Potentially includes UI, voice interaction, local memory or model/provider adapters only after a separate capability-specific contract proves that the component cannot claim root authority or trigger protected effects.
Must not be inferred permitted just because the component is called “prototype.” Requires explicit review of data sensitivity, persistence, egress, update path, tool access and privilege boundaries.

### P3 — Protected commissioning/authority operations (blocked)
- Establish Trust Foundation or Constitution Authority Context.
- Bind, replace, revoke or rotate root credentials.
- Commission or amend the Constitution.
- Authorize recovery, succession, delegation or root replacement.
- Convert recognition into general authority.
- Treat any self-reported “trusted/commissioned” state as authoritative.
Blocked until an independently recognized root/verifier basis and future-countereffects gate pass.

### P4 — Consequential external effects (blocked unless separately authorized by already established authority)
- Spend/transfer money, send messages or publish data, delete/modify external resources, control physical devices, change access permissions, or cause other nontrivial effects.
- Store or use production secrets/credentials, or enroll a live authenticator as Nexo's root.
No P0/P1 artifact or prototype result grants P4 capability.

## Non-escalation invariants
1. Capability level is explicit, scoped and bound to the actual process/environment; a label or config string cannot self-elevate it.
2. Model/provider output, successful tests, signatures, hashes, local metadata and restored snapshots do not grant authority.
3. P0/P1 outputs are proposals/evidence, never authorization.
4. Simulated credentials and identities cannot be accepted by production paths; production credentials cannot enter a simulation path.
5. No network egress or external tool invocation is assumed safe by default. Each connector/effect needs an explicit boundary and current authority.
6. Unavailable root/currentness/revocation cannot be replaced by a “development mode” that retains protected effects.
7. P0/P1 cannot write production memory, Vault, Constitution, authority state or real credential lifecycle.
8. Promotion from P0/P1 to P2/P3/P4 requires a new explicit review/decision; no implicit inheritance.
9. A crash, restore, fork, clone or device migration cannot increase capability.
10. If the environment cannot prove the required isolation, the capability is downgraded to P0 or held.

## Minimum evidence for any P1 simulation claim
- Exact source/build/test revision and environment.
- Declared model assumptions, synthetic fixtures and disabled external effects.
- Evidence that credentials/secrets are absent and network/effect paths are blocked or mocked.
- Expected versus observed outcomes, including failures and UNKNOWN.
- Test scope and blind spots; no claim beyond the modeled environment.
- Reproducible test invocation or raw logs where feasible.

## Adversarial review required
1. A model output asks the prototype to activate a root or run a real tool.
2. A config flag named development_mode bypasses authorization.
3. A simulated credential or state file is loaded into a production path.
4. A sandbox process has hidden network egress or inherited host credentials.
5. A test passes and is misreported as proof of production enforcement.
6. A snapshot/clone/fork changes its own capability label.
7. A prototype UI records approval and reuses it for protected commissioning.
8. A provider adapter changes from mock to live endpoint without a new authority gate.
9. A local memory or log write leaks sensitive data to an external provider.
10. A recovery/update path promotes a test root to a live root.
11. An isolated process has access to a shared clipboard/file/IPC path that can cause real effects.
12. A capability check is performed once but a privileged operation executes after the context changes.

## Decision
P0 is permitted as continued design/research. P1 is permitted only where isolation and absence of real effects are evidenced. P2 needs a separate capability-specific review. P3 remains blocked. P4 requires independently established authority and effect-boundary enforcement.

This is a design boundary, not proof that any current runtime meets P1 isolation. No implementation or root activation is authorized.

## Next exact action
Adversarially attack the capability boundary for implicit escalation, shared host credentials, egress, persistence, clone/restore and mock-to-live transitions. If a boundary cannot be enforced independently, restrict the permitted class rather than adding an override.
