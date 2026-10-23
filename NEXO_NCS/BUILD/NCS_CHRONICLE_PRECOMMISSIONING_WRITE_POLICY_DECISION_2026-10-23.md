# NCS — Architectural ruling proposal: pre-commissioning Chronicle writes

Date: 2026-10-23
Status: **DESIGN DECISION PROPOSED — RUNTIME NOT CHANGED**

## Question

May the independent Nexo CLI append to local Chronicle files while owner authority is still `NOT_EVALUATED` and the legitimate root is `PENDING/UNKNOWN`?

## Governing master constraints inspected

Current branch `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md` establishes:
- `COGNITION ≠ AUTHORITY ≠ EXECUTION ≠ VERIFICATION`.
- The base chain is `TRUST ANCHOR → IDENTITY → AUTHORITY → CAPABILITY → POLICY → WORLD REVALIDATION → EXECUTION → VERIFICATION → DURABLE HISTORY → CHECKPOINT`.
- `UNKNOWN/CONFLICT/UNTRUSTED` in a critical gate must fail closed, not fall back permissively.
- Every transition's applicable gates include identity, authority, capability, policy, evidence/trust, world freshness, resource/version and invariant checks.
- Human approval, where applicable, binds to the exact operation, normalized parameters, target, scope, evidence, policy, epoch, risk, expiry, nonce and UI version.
- Memory access is a capability (`READ/WRITE/SHARE/DELETE/EXPORT`) with purpose, mission, scope and expiry. Purpose binding must prevent silent reuse.

The current branch `docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md` also describes Chronicle as durable history subject to privacy/data-governance rules, distinct from ordinary memory and not universal truth.

These are master architecture requirements, not proof that a complete immutable Constitution implementation already exists.

## Exact implementation facts

The current source `src/nexo/application/chronicle-append.mjs`:
1. Accepts caller-provided continuity and Chronicle paths, mission/step IDs, and content.
2. Opens/initializes local stores according to explicit options.
3. Constructs Chronicle effect contracts, opens the continuity owner, admits a one-step mission, builds the effect adapter and invokes `executeNexoStepWithContinuityOwner`.
4. Can call the local Chronicle store's append method and return a completed result.
5. Explicitly preserves `authorization: "NOT_EVALUATED"`; the Chronicle handler reports `verified: false` for the local write.

The independent CLI intentionally allows `chronicle-append` and rejects generic effect/execute/repair commands. `tests/nexo/entrypoint.test.mjs` confirms the public application API is narrow and executes the append flow against temporary files.

Therefore, the current CLI has a real, narrow local mutation path even while owner authority is not evaluated. The existing M0 Option A repair gate does not globally disable that path.

## Architectural analysis

A local append is lower risk than an arbitrary external effect, but it remains a state transition: it changes a durable record and may initialize files. “Local” and “narrow” reduce the effect scope; they do not establish authorization, data purpose, provenance, or integrity.

The master model does not say that all local writes are forbidden forever before commissioning. It does require applicable authority/capability/policy gates and defines memory WRITE as a scoped capability. At present, the Chronicle result says authorization was not evaluated, and the inspected path does not establish a separately authenticated, pre-authorized bootstrap write capability.

Thus neither of these claims is justified:
- “The local append is harmless, so authority is unnecessary.”
- “The product repair gate means every mutating route is already blocked.”

## Recommended decision

**Until a legitimate root is established, do not treat a successful Chronicle append as an authorized Nexo state transition.** Preserve `authorization: NOT_EVALUATED` and keep protected effects stopped.

For implementation policy, choose the fail-closed default:
- Gate mutating Chronicle CLI operations unless they present a narrowly defined, verifiable local-write capability whose authority is explicitly permitted by the master Constitution/commissioning policy; or
- if the governing policy allows a bootstrap Chronicle write, specify that capability explicitly (purpose, allowed path/root, operation, scope, expiry, provenance, integrity and revocation), then verify it before mutation.

Do not invent a bootstrap capability or silently infer it from CLI access, local filesystem access, mission admission, successful PREPARED settlement, or the fact that the user can launch the process. No capability has been proven merely by this review.

My default recommendation is the first option—fail closed—until the second can be specified and tied to a verified root. This is a design recommendation, **not an implemented block**.

## Migration and verification requirements before changing runtime

If the fail-closed decision is adopted:
1. Define exact public error/status mapping, preserving `INVALID` versus `UNRESOLVED`/ `UNKNOWN` and never returning a false success.
2. Gate at the application use-case boundary before store initialization, lock acquisition, or append dispatch; do not scatter guards through lower-level code.
3. Keep read-only status/mission queries operational if their own contracts permit it.
4. Add tests proving the denied path creates no files, does not initialize stores, does not acquire mutation locks, and never calls the append handler.
5. Keep a positive test for the explicitly authorized path only after the capability contract is implemented and verified.
6. Run the relevant focused workflow plus deterministic `npm test` on the exact code-and-test commit; read back source, tests, logs, and final STATUS.
7. Do not alter `authorization: NOT_EVALUATED` to `AUTHORIZED` until a real authority evaluator and evidence are wired.

## Decision boundary

This document does not claim the entire application has a verified Constitution evaluator. It does not establish user identity or legitimate root, does not prove an exploit, and does not enable any external effect.

No runtime change was made. Current constitutional state remains:
- M0: `INCOMPLETO`
- Authorization: `NOT_EVALUATED`
- Legitimate root: `PENDING/UNKNOWN`
- Protected effects: `STOP`
