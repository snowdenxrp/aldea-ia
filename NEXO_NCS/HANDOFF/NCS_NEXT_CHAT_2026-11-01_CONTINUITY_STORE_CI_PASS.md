# NCS handoff — Continuity Store lock-aware publication, local suite and CI PASS

Date: 2026-11-01
Repository: `snowdenxrp/aldea-ia`
Branch: `ncs-lumina-decoupling-2026-10-29`
PR: #110 — OPEN / DRAFT / NOT MERGED
Code SHA validated: `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`
Documentation commit updating STATUS: `caa0653a649eac676b34f81733e499147e2bfd7a`

## 1. Exact state reached

The owner fast-forward merged `FETCH_HEAD` from `38990a7a` to `7a7f3ffa` in `~/ncs-m0`. Verified:
- HEAD = `7a7f3ffa56af116a4f7222d22ff7638c9b470f92`
- FETCH_HEAD = same SHA
- `git status --short` empty
- Focused command `node tests/nexo/continuity-store.test.mjs` PASS twice.
- Full `npm test` PASS; terminal returned to `~/ncs-m0 $` with all final test output, including:
  - continuity service options input guard
  - Open Loops bounded read-only projection, journal separation, privacy and UNKNOWN linkage.

Do not rerun these tests absent a code change or concrete contradiction.

## 2. Implementation and failure resolved

### Root cause
In Termux/Android, the original exclusive initialization attempted `fs.link(tempPath, filePath)`; it failed with `EACCES: permission denied, link`. Both concurrent initialization attempts failed. This was reproduced in an isolated temp directory; no real Continuity/bootstrap was executed.

Filesystem probes in Termux:
- symlink creation + no-overwrite: PASS
- `copyFile(..., COPYFILE_EXCL)`: PASS
- `open(..., 'wx')`: PASS
- hardlink: EACCES (not usable in this environment).

Do not switch to symlink: it creates path-resolution/escape questions and D3 remains unresolved. `COPYFILE_EXCL` and `open('wx')` are no-overwrite but not atomic-visibility publication mechanisms for uncooperative readers.

### Commits
- `38990a7a`: `src/nexo/core/continuity-store.mjs` changed exclusive initial publication from hardlink to `copyFile(..., COPYFILE_EXCL)`; `loadCurrent()` now acquires the per-store lock so cooperating readers do not observe the file while the copy publication is in progress. Associated contract tests cover a non-cooperating destination race and a reader waiting for publication.
- `7a7f3ffa`: test-only correction to `tests/nexo/continuity-store.test.mjs`. Tests now expect lock-aware reads to fail/timeout under stale/live locks and inspect raw fixture bytes in scenarios where `loadCurrent()` is intentionally blocked by a lock. No production code changed in this commit.

### Explicit technical limits
- `COPYFILE_EXCL` prevents replacement of an existing destination, but is not atomic visibility to direct external readers.
- The reader coordination applies to callers using the cooperating store API/lock. It does not prove exclusion of arbitrary writers/readers.
- No claim of fsync, power-loss durability, global writer exclusion, no TOCTOU, or safe symlink publication.
- Preserve UNKNOWN-STOP for uncooperative writers and environmental exclusion.

## 3. CI evidence on exact code SHA

All five runs are completed SUCCESS and report exact `head_sha=7a7f3ffa56af116a4f7222d22ff7638c9b470f92`:
1. [Nexo — bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/41362046792) — SUCCESS.
2. [Nexo M0 — integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/41362046788) — SUCCESS.
3. [NCS Lúmina Decoupling Validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/41362046842) — SUCCESS.
4. [Nexo — STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/41362046791) — SUCCESS.
5. [Nexo — STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/41362046808) — SUCCESS.

Local evidence and CI evidence are now both PASS on the same code SHA. The earlier CI failures on `38990a7a` are superseded by the corrected tests and five successful runs on `7a7f3ffa`.

## 4. User/device evidence

- Device target remains POCO X7 Pro / Android.
- Termux is installed and usable; Node.js tests were executed from `~/ncs-m0` in Termux.
- The environment has demonstrated a hardlink restriction and successful `COPYFILE_EXCL` probe.
- This does NOT prove the actual bootstrap launch path, all writer/launcher absence, ability to stop/prevent relaunch, or exclusive ownership of the future Continuity destination.
- E2/E3 remain UNKNOWN; E4 NOT READY. Update the older STATUS statement that Termux is not installed by recording this new evidence; do not reinterpret it as full environmental clearance.

## 5. Canonical M0 gates — unchanged

- NCS M0: INCOMPLETO.
- D0/D1/D2/D3 remain open according to their canonical records.
- Root legitimacy: PENDING/UNKNOWN.
- `authorization: NOT_EVALUATED`; `ROOT_READY` not enabled.
- First Continuity creation/publication and protected effects: STOP.
- PR #110 remains OPEN / DRAFT / NOT MERGED.
- Technical authorization (“todo lo necesario para terminar M0”) covers code/contracts/tests/CI/docs but does not authorize root legitimacy, operational admission, bootstrap execution, first publication, or protected effects.
- Do not delete or alter legacy migration behavior.
- No merge of PR #110.

## 6. Immediate next-chat route

Start with:
1. `NEXO_NCS/STATUS.md` (read the newest delta at the very top).
2. This handoff.
3. `MASTER/CORE` and the current BUILD evidence only where directly relevant.

The STATUS delta for this validation was committed as `caa0653a649eac676b34f81733e499147e2bfd7a`. The local Termux clone has not yet fetched this documentation-only commit. Next local action, if needed, is a normal fetch and fast-forward of the branch; do not rerun tests just for documentation.

Then continue the actual remaining M0 gates, not the already-validated test repair:
- reconcile the POCO/Termux restricted execution candidate with the new observed Termux/Node evidence;
- keep E2/E3 UNKNOWN until writers, launchers, supervisors, stop controls and non-relaunch conditions are evidenced;
- resolve remaining Continuity writer-scope / non-cooperative writer / TOCTOU requirements without claiming the cooperative lock solves them;
- continue the existing FB/P-01/P-05/D0-D3 closure matrix; do not invent new gates or repeat completed audits;
- determine whether a concrete bounded M0 solution exists for each remaining criterion; if not, document the precise unresolved criterion and evidence needed.
- Update STATUS and handoff with exact SHA and evidence after each verified unit.

## 7. Prohibited actions / no-repeat list

- Do not run actual bootstrap, first Continuity creation/publication, or protected effects.
- Do not create a real Continuity store for validation.
- Do not use symlink as a substitute for hardlink without a separately resolved D3/path-security decision.
- Do not claim `COPYFILE_EXCL` is atomic visibility or solves non-cooperative readers/writers.
- Do not repeat `continuity-store.test.mjs` or full `npm test` unless code changes or a concrete contradiction appears.
- Do not re-run old import graph/Lúmina separation audits absent changed code or new evidence.
- Do not merge PR #110.
- Do not touch the separate `~/aldea-ia` checkout or its uncommitted changes; work only in `~/ncs-m0`.

## 8. Suggested continuation instruction

“NCS — continúa desde STATUS.md y este handoff. El SHA 7a7f3ffa ya tiene prueba enfocada, npm test completo y los cinco workflows CI PASS; no repitas esas validaciones. Actualiza el delta ambiental de Termux con la evidencia real, pero conserva E2/E3 UNKNOWN. Continúa cerrando los gates M0 pendientes de escritores no cooperativos/TOCTOU, raíz y P-01/D0-D3. No ejecutes bootstrap, primera publicación ni efectos protegidos; no fusiones PR #110.”

---

## Addendum — full local npm suite PASS and bootstrap path/temp guards exercised (2026-11-02)

Validated code SHA: `5988d9b4c6caa22ec093986a25db80ca842902cc`.

The owner ran:

```sh
cd "$HOME/ncs-m0" &&
git status --short &&
git rev-parse HEAD &&
npm test
```

Observed:
- `git status --short` emitted no entries.
- HEAD was exactly `5988d9b4c6caa22ec093986a25db80ca842902cc`.
- The full `npm test` chain completed and returned to `~/ncs-m0 $` without error.
- Final reported test: `Nexo Open Loops: bounded read-only projection, journal separation, privacy and UNKNOWN linkage OK.`
- Environment: Termux on POCO / Android, Node.js v26.4.0.

**Classification: LOCAL FULL-SUITE TESTED — PASS on SHA 5988d9b4. Not CI-VERIFIED.**

### Supersedes the earlier NOT YET EXECUTED note for path/temp guards

The tested SHA contains, relative to base `534ddb856df93de3065d6db92089904fce1bf9d4`:
- `a19da46da8942091bdfe0496b13f57414e63eaad`: explicit root symlink rejection, relative-parent symlink rejection, canonical effective root, and reserved temp-name rejection regardless of entry type.
- `834f77d01dee9c99977d86015d7f6fdc9237ed2e`: store-level reserved temp artifact rejection regardless of entry type.
- `773d6fd82661df53e235277c296991ab46f15b62`: negative tests for symlink roots/parents and reserved `.tmp` directories/symlinks in bootstrap/store initialization.

The full `npm test` chain includes `tests/nexo/continuity-contract.test.mjs`; the new negative cases were therefore exercised in the full suite. The prior STATUS statement that these tests were NOT YET EXECUTED is superseded for this SHA.

### Limits and unchanged gates

- This local PASS does not establish CI for SHA `5988d9b4...`; available status/workflow queries returned no records for that SHA.
- It does not eliminate TOCTOU in the separate `lstat → realpath → lstat → readdir → initializeExclusive` operations.
- It does not exclude non-cooperative writers/readers or hostile processes with equivalent filesystem access.
- It does not establish fsync or power-loss durability.
- No real bootstrap, first Continuity creation/publication, commissioning or protected effects were executed.
- M0 remains INCOMPLETO; P01-A = L DECIDED BY OWNER; P01-G PENDING/UNKNOWN; P01-C/D OPEN/UNKNOWN; E2/E3 UNKNOWN; E4 NOT READY; root PENDING/UNKNOWN; `authorization: NOT_EVALUATED`; first publication and protected effects STOP; PR #110 OPEN / DRAFT / NOT MERGED.

Continue from the newest STATUS delta. Do not repeat the full suite or the new negative tests absent a code change or concrete contradiction. Continue P01-G and bounded environmental writer/launcher exclusion using existing artifacts; do not execute bootstrap or first publication.

---

## Addendum — missing dedicated M0 bootstrap launcher (2026-11-02)

Static inspection at code SHA `5988d9b4c6caa22ec093986a25db80ca842902cc` confirms:
- `bootstrapNexoContinuityStore(options)` exists as a tested service API.
- `scripts/nexo-continuity.mjs` is only a re-export.
- `scripts/nexo.mjs` has no bootstrap subcommand.
- `package.json` has no M0 bootstrap script.

Thus API/fixture PASS is not an operational invocation. RE-01 (identified invocation) and RE-02 (effective root/destination tied to that invocation) remain UNKNOWN. Termux + Node, one manual foreground session and a private Termux HOME destination remain a technical recommendation only, not a ratified environment or launch path. Do not improvise a script or run bootstrap before P01-G and the first-publication contract are resolved.

No runtime/test/workflow change, no real bootstrap, no Continuity creation, no commissioning and no protected effects.

---

## Addendum — proposed Termux restricted-environment threat boundary R1 (2026-11-02)

The owner previously permitted a restricted environment but did not specify which actors are excluded. A technical candidate R1 is recorded in `NCS_M0_POCO_TERMUX_RESTRICTED_EXECUTION_PROFILE_CANDIDATE_2026-11-01.md` (profile commit `f2abfe2b3318285ce06a824f21ec4dc4d9d21eaf`):
- Android app sandbox + Termux private HOME as the storage boundary.
- One manually launched foreground Termux session and one future dedicated M0 invocation.
- Exclude all other Termux sessions/processes, relevant Termux:API/Boot add-ons, services, jobs, cron, automation and known launchers during the entire window.
- Explicitly exclude root/compromised OS and malicious processes sharing Termux's UID/trust space from the guarantee; any other unknown writer/launcher blocks.

This is a recommendation, not an owner decision. Android documentation distinguishes package Force stop from Task Manager Stop; Task Manager Stop does not prevent scheduled jobs/alarms from running. See the source links in the profile. No claim is made that the current POCO meets R1.

The exact owner decision needed is whether to accept this limited threat boundary. Acceptance would not authorize bootstrap, first publication, commissioning or protected effects. RE-01/RE-02 remain UNKNOWN because no dedicated M0 launcher or effective destination is defined.
