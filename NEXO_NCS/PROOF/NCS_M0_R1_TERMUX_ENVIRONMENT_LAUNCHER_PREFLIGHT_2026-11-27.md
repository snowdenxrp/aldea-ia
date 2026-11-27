# NCS M0 — R1 Termux environment and launcher preflight

**Capture time (UTC):** 2026-11-27 04:25:19Z  
**Evidence type:** owner-provided terminal transcript; read-only preflight  
**Device/runtime boundary:** Termux session on Android; no assistant invocation, writer, test, or CI execution occurred in this capture.

## 1. Observed environment

The owner first ran the capture from Termux HOME:

- `pwd`: `/data/data/com.termux/files/home`
- `NEXO_STATE_PATH`: `UNSET`
- `NEXO_LUMINA_MEMORY_PATH`: `UNSET`
- `npm`: `/data/data/com.termux/files/usr/bin/npm`
- `npm pkg get scripts.assistants` from HOME returned `ENOENT` because HOME has no `package.json`.

The owner then changed to `~/aldea-ia` and captured:

- Repository path: `/data/data/com.termux/files/home/aldea-ia`
- Current local branch: `main`
- Local HEAD: `1834182a2eaf4b1bfe59f9802ce3e49fc89b2ca7`
- `npm pkg get scripts.assistants`: `"node scripts/assistants.mjs"`
- `NEXO_STATE_PATH`: `UNSET`
- `NEXO_LUMINA_MEMORY_PATH`: `UNSET`

## 2. What this proves

1. At the recorded time, both named environment variables were unset in the observed Termux shell.
2. The local checkout at the reported HEAD `1834182a2eaf4b1bfe59f9802ce3e49fc89b2ca7` declares the package script `assistants` as `node scripts/assistants.mjs`.
3. The initial failed npm query was a working-directory issue, not evidence that the repository lacks the script.

## 3. What this does not prove

- It is not an invocation-bound capture: `npm run assistants` was not executed.
- It does not prove what environment a future or alternate launcher supplies to the child process.
- It does not prove that RAW-1 is disabled, that the protected Continuity path is excluded, or that no write can occur.
- It does not demonstrate runtime use or non-use of RAW-1.
- It does not close O7, P07-C, P05, or any M0 gate.
- It is a user-provided local checkout observation. The reported local HEAD is not asserted to equal the separate static-analysis snapshot `d8b5ca8720908d926acc18130614cce132a43b5d`.

## 4. Safety and execution record

The commands shown were read-only environment, Git metadata, and package-script queries. No `npm run assistants`, Node entrypoint, test, CI job, filesystem mutation, or protected effect was performed as part of this capture.

## 5. Disposition

- R1 shell variables at capture time: **UNSET / OBSERVED**
- Package script declaration in reported local checkout: **CONFIRMED**
- Effective child-process environment during actual RAW-1 invocation: **NOT OBSERVED**
- RAW-1 runtime activation/use: **UNKNOWN**
- Enforcement/exclusion of protected Continuity: **NOT DEMONSTRATED**
- O7: **UNKNOWN / OPEN**
- P07-C: **UNKNOWN / BLOCKING**
- P05-C: **RATIFIED**; P05: **OPEN**
- `authorization: NOT_EVALUATED`
- Commissioning / protected effects: **STOP**
- NCS M0: **INCOMPLETE**

This record preserves the new capture only. It does not replace earlier evidence or repeat the existing source/launcher audit.