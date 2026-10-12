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


## Addendum — confirmed GitHub Pages deployment run (2026-10-12)

Fresh live GitHub Actions record retrieved after the initial note:
- Run `38297516329`, workflow `pages build and deployment`, event `dynamic`, branch `main`, head commit `7706f51470b7a34cbe5c27c4ab55bbfd42e3c24f`, conclusion SUCCESS. Run URL: https://github.com/snowdenxrp/aldea-ia/actions/runs/38297516329
- Build job `114972080936`: Jekyll build and upload artifact succeeded.
- Deploy job `114972395717`: `Deploy to GitHub Pages` succeeded.
- Artifact `github-pages`, ID `11768759460`, SHA-256 `5d16f3276a25b1746734e11f3ca141fc16933a76744ab6440526d6686013e869`; associated with the same `main` head commit. The artifact is a static Pages site package, not a Nexo protected runtime.
- The NCS branch HEAD at the time of this check is `5224c095ccea31245d50e8e254d07a4f3ca5d55a`, distinct from the deployed `main` head. Thus this successful Pages run is not evidence that the current NCS branch itself was deployed.
- Repository releases endpoint returned an empty list (`[]`) at inspection time. This is only a release-list observation, not proof that no external artifacts/deployments exist.
- GitHub's official docs explain that a successful `deploy-pages` job publishes the uploaded artifact to GitHub Pages; this supports classifying this run as a successful static-site deployment, not a protected Nexo effect deployment. Reference: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Revised bounded conclusion

GitHub Pages deployment is now CONFIRMED for the `main` commit above. Cloudflare Pages Functions deployment/reachability remains UNKNOWN; the GitHub Pages deployment does not execute Cloudflare Pages Functions. No reviewed evidence ties this static-site deployment to Genesis, canonical current Constitution authority, or a final protected external-effect sink. STEP 7 remains OPEN / STOP / UNKNOWN.
