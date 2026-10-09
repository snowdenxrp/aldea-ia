# NCS — STEP 7: Existing Client and Bypass-Path Inspection
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: SOURCE INSPECTION — NOT A DEPLOYMENT TEST

## 1. Question examined
Does the current repository contain a concrete Nexo mobile client or a narrow client path that could implement the read-only mobile interaction contract without inventing a new client?

## 2. Source findings
The branch tree was fetched recursively from GitHub and inspected for mobile/client/platform artifacts and current UI entry points.

- No Android/iOS, React Native, Expo, Capacitor, or dedicated mobile-client directory was found in the inspected tree. This is a repository-tree finding, not proof that no separate external prototype exists.
- index.html is explicitly titled “Lúmina — Aldea IA”, loads src/main-stable.js, and presents the Lúmina 3D village/simulation. It is not a Nexo conversational UI.
- src/main-stable.js builds the Lúmina simulation and includes a visual-capture action.
- functions/api/capture.js identifies itself as a Lúmina visual audit receiver. It accepts a PNG and JSON metadata, then uses server-side GITHUB_TOKEN to write the image and metadata into audits/visual/... on the hard-coded main branch.
- package.json defines simulation/assistant/test scripts; the inspected package metadata does not define a mobile app build or Nexo client entry point.
- The Nexo Core files inspected (src/nexo/core/contracts.mjs, src/nexo/core/ownership.mjs) provide semantic contracts/ports, not a user-facing mobile interaction client. Unimplemented ports throw NEXO_CORE_CONTRACT_NOT_IMPLEMENTED.

## 3. Security boundary and implications
1. **Do not reuse Lúmina UI or its capture endpoint as Nexo's read-only client.** Lúmina is a separate experimental system; the capture endpoint performs repository writes and is therefore not a read-only answer path.
2. **The existing capture handler has a code-level authorization concern:** the visible onRequestPost implementation checks for a configured server token and validates upload type/size/JSON syntax, but no request authentication/authorization check is visible before it writes to GitHub using that token. If this endpoint is publicly reachable in a deployment with GITHUB_TOKEN configured, unauthenticated callers may be able to trigger writes to the designated audit paths. Actual deployment exposure and exploitability were not tested and remain UNKNOWN.
3. This finding is out-of-scope for the Nexo mobile slice and does not authorize modifying Lúmina or its endpoint. Track it separately for a dedicated Lúmina security audit; do not silently fold a fix into NCS.
4. A browser page, a serverless function, and a repository-backed visual capture flow are not evidence of a Nexo mobile app, protected client, trusted presentation channel, or effect-enforcement boundary.

## 4. Contract impact
- The read-only interaction contract remains semantic only.
- There is currently no repository-grounded concrete Nexo client path to trace end-to-end.
- We must not invent a client or infer mobile security properties from the generic web viewport or a user-agent string.
- The phone model/OS is not yet the blocking decision. The more fundamental gap is that no Nexo interaction client has been selected or established in the repository.

## 5. Evidence classification
- **Source-confirmed:** fetched branch tree and contents of index.html, src/main-stable.js, functions/api/capture.js, package.json, src/nexo/core/contracts.mjs, and src/nexo/core/ownership.mjs.
- **Not established:** deployed endpoint reachability, endpoint authentication behavior in production, mobile-device state, Nexo UI existence outside this repository, runtime bypass resistance, or any Nexo client behavior.
- No runtime tests, exploit attempts, phone inspection, endpoint calls, or changes to existing app code were performed.

## 6. Next action
Do not proceed to implementation or provider/platform selection from this source snapshot. Next, map the narrowest proposed Nexo client boundary as a new architecture contract only if the owner explicitly wants a new client-design track; otherwise continue P0 by comparing the existing trust-recognition families against the already-recorded phone failure graph. Keep the Lúmina capture finding separate. No root selection, commissioning, credential enrollment, protected recovery/succession, or external Nexo effects are authorized.
