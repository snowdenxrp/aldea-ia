# STEP 7 — Minimum PolicyContext Resolver Contract — 2026-10-08

Status: DESIGN CANDIDATE — NOT IMPLEMENTED

Boundary:
governed policyRef + required claim/mission context + authoritative evidence
→ context status VALID | FAIL | UNKNOWN + reasons/evidence/provenance.

VALID means policy context established only. It is not Claim PASS, admission, authority, SAFE_COMMIT, execution, or commit.

Required checks:
- policy id/version/hash bind to governed content; they do not establish authority;
- scope applicability must be evaluated against actual claim/mission context;
- claim-critical dependencies must be complete, current and compatible or result UNKNOWN;
- policy-specific expiry rules apply; missing required expiry never implies currentness;
- provenance must be established by the protected resolution boundary, not self-asserted by a provider;
- material changes require revalidation before protected transition.

Resolver cannot authorize, enforce STOP/revocation, admit/select candidates, execute, commit, declare SAFE_COMMIT, resolve external effects, or convert UNKNOWN to success.

Dependency expansion must be governed by required dependency roots/closure; no unbounded graph walk.

No new IDs, queues, retries, tombstones, effect protocols, selector authority, or compatibility wrappers.

STOP if implementation needs a mechanism whose purpose is to manufacture missing provenance, dependency identity, current authority, or external-effect certainty.
