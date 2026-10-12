# STEP 7 — Lúmina capture endpoint external-write boundary review
Date: 2026-10-12
Status: SOURCE-VERIFIED CONDITIONAL SECURITY FINDING — DEPLOYMENT UNKNOWN

## Scope boundary
This is a read-only review of the existing Lúmina visual-audit capture route. It is not evidence that Lúmina is a Nexo production sink, and it does not authorize connecting Lúmina to Nexo's protected transition. It checks whether a concrete external write-capable endpoint already exists in source, and what evidence is missing to determine whether it is deployed.

## Pinned source
- `functions/api/capture.js` blob `83afd34b8d32840dd8944cb35b406076f2b9fd5c` (present on both `main` and `ncs-clean-architecture` at inspection).
- `docs/visual-audit-github.md` blob `72a2f24f5ea13626008a6334d6099ca226d7fe2a`.
- `.github/workflows/lumina-simulation.yml` blob `e11a11b5101c992396737f3520c427c2c6c4f350`.
- Root `index.html` blob `97fa1954d0838d09f4a286ea189c2661207f5aa2`.
- Root `src/main-stable.js` blob `b48d7fd9f51baee4cd1e9b319de56bb31eedb772`.

## Source facts
1. `onRequestPost` requires `env.GITHUB_TOKEN`, parses multipart form data, accepts a PNG up to 12 MiB and parses `metadata` as JSON.
2. If configured, the route uses the token to call the GitHub Contents API and writes four repository paths: timestamped PNG history, `latest.png`, timestamped JSON metadata, and `latest.json`. It commits to `main`.
3. `onRequestGet` returns a health response; the handler source contains no authentication/authorization check for callers, no explicit Origin/CSRF defense, no application rate limit, and no schema/size bound for metadata beyond JSON parse.
4. The front end uses a relative `/api/capture` endpoint and falls back to local PNG download when the endpoint fails.
5. The repository documentation explicitly says this function must be deployed as Cloudflare Pages with Functions enabled and a server-side `GITHUB_TOKEN`. That token is not embedded in the browser, but the route becomes a write-capable proxy if deployed and reachable.
6. The separate `lumina-simulation.yml` workflow also has `contents: write` and pushes simulation state to `main`; it is a GitHub Actions writer, not a Nexo protected-effect sink.

## Security interpretation
CONDITIONAL FINDING: if this function is deployed on a publicly reachable Cloudflare Pages project with a write-capable `GITHUB_TOKEN`, any caller able to reach the route may be able to cause arbitrary accepted PNG bytes and caller-supplied JSON metadata to be committed to the repository through the function. MIME type and size checks constrain format/size but do not authenticate the caller or establish that a capture is genuine. The browser not containing the token does not by itself protect the server endpoint.

Potential consequences include repository history pollution, repeated writes/abuse of the token's allowed repository scope, overwriting the latest-capture pointers, and storage/API consumption. This review does not establish that abuse has occurred.

## Deployment reconciliation
- GitHub Pages is static hosting; it does not execute Cloudflare Pages Functions merely because `functions/api/capture.js` exists in the repository.
- Cloudflare Pages Functions are deployed as server-side code when the project is published with Functions configured. Official documentation: https://developers.cloudflare.com/pages/functions/ and https://developers.cloudflare.com/pages/functions/get-started/.
- In this review, public web opens of candidate URLs did not establish a live deployment or response; the repository search did not identify a Cloudflare project/domain or token configuration. Therefore route reachability, environment secrets, Cloudflare project linkage, and deployed artifact identity remain UNKNOWN. Do not report the conditional issue as a confirmed live exposure.

## Required containment/design decision before enabling a write-capable deployment
1. Keep the endpoint disabled or remove the write-capable token until an explicit threat model and access-control design are approved.
2. If capture is needed, define an authenticated caller model and server-side authorization; Origin checks alone are not authentication. Apply request size and metadata schema limits, abuse/rate controls, and concurrency-safe naming/commit behavior.
3. Use a narrowly scoped token and isolate capture storage from trusted source/configuration. Treat all submitted pixels and metadata as untrusted evidence until independently reviewed; never treat the upload itself as authority or proof of state.
4. Test anonymous POST, cross-site form submission, oversized/malformed input, repeated requests, concurrent uploads, token absence/revocation, and commit conflicts in a non-production deployment. Preserve raw logs and the exact deployment/config pin.
5. Verify the actual public hostname, deployed commit, function route, environment binding, and response before assigning PASS/FAIL. No live attack or write test was run in this review.

## STEP 7 consequence
This is a concrete source-level external-write boundary in the separate Lúmina visual-audit path, but it does not close the missing Nexo production sink. It demonstrates why target enumeration must include service routes and repository mutations, while keeping Lúmina separate from Nexo's protected runtime. Do not wire this endpoint into `executeProtectedTransition`, Nexo authority, or constitutional commissioning.

## Actions performed
Read-only source/config review and public documentation research only. No code, workflow, secret, token, Constitution, APK, device, deployment, or runtime state changed. No tests ran. Deployment status remains UNKNOWN.

## Additional source finding — request bounds and concurrent capture consistency (2026-10-12)

Further read-only inspection of the same pinned `functions/api/capture.js` found three independent integrity/availability concerns. These are source-level findings conditional on deployment; no live endpoint was tested.

1. **The PNG limit is checked after multipart parsing.** `request.formData()` completes before the code checks `image.size <= 12 MiB`. The metadata part has no explicit byte limit or schema/depth/key-count bound. Therefore the image check alone does not bound the entire request or the memory/work consumed while parsing it.
2. **History identifiers have one-second resolution.** `stamp()` removes milliseconds. Two captures in the same second derive the same history image and history-metadata paths, so a later request can replace the earlier entry instead of creating two distinct history records. The `GET existing SHA → PUT` sequence also has a race under concurrent updates.
3. **One logical capture is four independent GitHub writes.** The image history, latest image, metadata history and latest metadata are committed sequentially, without an atomic multi-file transaction or a capture-level consistency check. A failure partway through can leave partial records; concurrent requests can interleave latest-image and latest-metadata updates, so the two `latest` files may describe different captures.

### Consequence and disposition
- Treat the endpoint as a conditional write/availability/integrity risk if publicly deployed with a write-capable token.
- Before enabling it, bound the whole request before/while parsing, validate a strict metadata schema and size, use collision-resistant capture identity, and define a concurrency-safe persistence design that cannot silently pair an image with another capture's metadata. If atomic consistency is required, store one immutable capture bundle or manifest as the commit unit, then update a pointer with explicit concurrency control.
- Keep this Lúmina audit-storage issue separate from Nexo's Genesis/Constitution authority path. It is not a Nexo sink and does not authorize integration.
- Deployment, token scope, public reachability, actual exploitation and production impact remain UNKNOWN. No code, workflow, secret, deployment, or runtime state changed; no tests or live requests ran.
