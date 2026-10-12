# STEP 7 — Build, publication, and deployment evidence reconciliation — 2026-10-12

Status: READ-ONLY EVIDENCE RECONCILIATION. STEP 7 commissioning remains OPEN / STOP / UNKNOWN.

## Scope

Distinguish repository source, automated execution, build artifact, published service, installed device build, and a protected real-world effect sink. This review does not claim to enumerate deployments outside available repository/GitHub evidence.

## Evidence

### A. Scheduled Lúmina simulation workflow

Source: `.github/workflows/lumina-simulation.yml`, blob `e11a11b5101c992396737f3520c427c2c6c4f350`.

Observed:
- Scheduled every five minutes, manual dispatch, and pushes to `main`.
- Runs `npm test`, `npm run assistants`, and `npm run simulate`.
- Commits `world-state.json` and `.lumina-assistant-memory.json` back to `main`.
- Uses GitHub Actions workflow-level concurrency for this workflow and a rebase/retry path.

Classification: a concrete automated repository/simulation mutation path. This is not evidence of a protected Nexo external effect sink. GitHub Actions concurrency does not transfer to another runtime, device, service, or external world.

### B. Cloudflare Pages visual-audit Function

Source: `functions/api/capture.js`, blob `83afd34b8d32840dd8944cb35b406076f2b9fd5c`; setup documentation `docs/visual-audit-github.md`, blob `72a2f24f5ea13626008a6334d6099ca226d7fe2a`.

Observed:
- Source defines GET health response and POST PNG capture behavior.
- If configured with `GITHUB_TOKEN`, POST writes image and metadata into the repository's `main` branch.
- Documentation describes Cloudflare Pages publication and token setup as steps that must be configured.
- This read-only source pass found no repository workflow that itself deploys the Pages Function and no deployment receipt/domain/configuration proving it is currently deployed.

Classification: implemented server-function source with documented deployment instructions; actual deployment/configuration/current reachability UNKNOWN. The function is for visual-audit uploads, not a Nexo constitutional authority gate or protected effect sink. Its GitHub write permission is an application capability that should not be mistaken for Nexo authority.

### C. Nexo M1 Android artifact

Prior verified record: GitHub Actions run `38204426310`, head `bc16c05f599761968e89a2d175b4e87093963504`, artifact `11726378906` (`nexo-m1-native-prototype-debug-apk`).

Classification: debug APK build/artifact evidence only. It does not establish installation on the user's device, current deployed version, Genesis commissioning, Constitution authority, or a real protected sink. Current M1 source was previously inspected as local text-only inference without tools/effects or Nexo runtime import.

## Bounded conclusion

1. Repository evidence identifies at least one real automated simulation writer (GitHub Actions → simulation scripts → state files → commit to main).
2. Repository evidence contains a Cloudflare Pages Function source intended for visual-audit capture, but this pass does not establish that it is deployed or reachable.
3. Repository evidence contains M1 debug build evidence, not production commissioning or a protected effect boundary.
4. No reviewed evidence identifies a concrete external device/network/physical-world effect sink joined to Genesis → canonical current Constitution authority → final enforcement.
5. Do not infer that no external deployment exists. External deployments remain UNKNOWN until supported by specific deployment records, deployed artifact identity, target identity, and a trace of final enforcement.
6. Do not use the GitHub simulation writer, Cloudflare visual-audit token, or M1 APK as an initial trust anchor. None independently establishes constitutional legitimacy.

## Next admissible step

Continue from the deployment boundary: obtain concrete deployment evidence for any claimed live service (provider/project/domain or deployment ID, deployed commit/build identity, environment configuration ownership) and map whether it can cause any protected effect. If no such record is available, retain UNKNOWN and keep protected effect execution unimplemented. No code/tests/device actions or authority changes occurred in this pass.
