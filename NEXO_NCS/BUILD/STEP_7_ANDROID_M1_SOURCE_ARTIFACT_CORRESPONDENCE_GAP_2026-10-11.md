# STEP 7 — Android M1 Source / Installed Artifact Correspondence Gap — 2026-10-11

Status: source-to-artifact correspondence UNKNOWN. This is a read-only source review; no device action, build, install, signing change, or commissioning was performed.

## Question

Does the Android project source currently present on `ncs-clean-architecture` establish the behavior and identity of the M1 APK previously reported as installed on Kevin's POCO?

## Source facts read from the branch

- `NEXO_NCS/M1_ANDROID/app/build.gradle.kts` declares namespace and applicationId `org.nexo.m1`, versionCode `1`, versionName `0.2.0-prototype`.
- `NEXO_NCS/M1_ANDROID/README.md` describes an isolated Android shell and explicitly says it does not import the Node.js/Lúmina simulation runtime; it lists no tools/effects, Vault, durable chat history, remote fallback, or Genesis/authority path.
- `NEXO_NCS/M1_ANDROID/app/src/main/AndroidManifest.xml` has a launcher Activity and no declared INTERNET permission.
- `MainActivity.kt` describes a local text-only interaction. It verifies the GGUF digest before loading the model, streams generated text to the UI, and explicitly labels output as unverified. The system prompt says the prototype has no tools, device control, persistent memory, or authority.
- The latest deployment evidence matrix records the user-reported installed package as `org.nexo.m1.safetest18`, version `0.2.6-safe-test18`. That is a different package ID and version from the source project read above.

## Bounded conclusion

The source project inspected here is not identity-matched to the installed APK described in the deployment record. Therefore:
1. Do not infer that the installed `safetest18` APK has the exact code, manifest, permissions, signing identity, or runtime behavior of this `org.nexo.m1` source tree.
2. Do not infer the inverse either: this discrepancy alone does not prove the installed APK is unsafe or malfunctioning.
3. The current source tree, within its declared scope, is a local inference/presentation prototype and does not implement the Genesis/constitutional authority path.
4. The installed artifact's exact source commit, build workflow/run, package/version, signer identity and digest are not joined by the evidence reviewed here. That provenance relation remains UNKNOWN.
5. This does not change the separate Step 7 finding: no deployed production composition has been evidenced that joins a legitimate Genesis verifier, protected active-Constitution establishment and the final enforcement boundary.

## Next safe action

Continue Step 7 using source/build provenance already available in the repository: inspect the M1 build workflow and artifact provenance records to determine whether the installed package's source lineage can be established without building or installing anything. If the linkage cannot be grounded from existing records, record it as UNKNOWN and do not claim source correspondence. This is evidence collection only; it does not authorize M1 debugging or switching the main objective away from Step 7.

No new root, verifier, credential, channel, authority, runtime layer, or integration is selected. No code or device state was changed. **STEP 7 remains OPEN / STOP / UNKNOWN.**


## Build-workflow provenance cross-check

The existing `.github/workflows/nexo-m1-android-build.yml`:
- checks out the triggering source ref, builds `NEXO_NCS/M1_ANDROID` with `assembleDebug`, and uploads `app-debug.apk` plus build evidence;
- derives its expected package from the checked-in Gradle configuration, which declares `applicationId = "org.nexo.m1"` and `versionName = "0.2.0-prototype"`;
- names the uploaded artifact `nexo-m1-native-prototype-debug-apk` and retains it for 14 days;
- records the APK SHA-256 in the artifact's build evidence, but the workflow itself does not prove which artifact was installed on Kevin's phone.

A repository-tree inspection of the current branch found no `safetest18` source/project path. A commit search for `safetest18` also returned no matching commits. These bounded searches do not prove the code never existed in another branch, historical artifact, or external build; they show only that the inspected current branch and searched commit index do not establish the required lineage.

### Result after workflow inspection

No existing record retrieved in this pass joins all of the following: exact source commit → successful workflow run/job → retained APK SHA-256 → package/version and signer of the installed `org.nexo.m1.safetest18` artifact. The source/artifact relation therefore remains **UNKNOWN**, not “mismatch proven malicious” and not “same source proven.” The current workflow's 14-day artifact retention also means the present workflow file alone is not a durable record of a particular historical artifact.

No new workflow was run, no artifact was downloaded or installed, and no device command was requested. Since existing records do not ground the installed APK's lineage, stop this provenance subtask here rather than rebuilding. Return to the Step 7 first-boot deployment boundary; M1 remains a lab/client and not the constitutional root.
