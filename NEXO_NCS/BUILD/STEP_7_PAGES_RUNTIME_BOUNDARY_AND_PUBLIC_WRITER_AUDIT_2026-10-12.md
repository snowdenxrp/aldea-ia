# STEP 7 — Pages runtime boundary and public-writer audit — 2026-10-12

Status: READ-ONLY SOURCE + DEPLOYMENT EVIDENCE REVIEW. No code or configuration changes. STEP 7 remains OPEN / STOP / UNKNOWN.

## 1. Confirmed deployed runtime boundary

GitHub Actions run `38297516329` completed successfully for workflow `pages build and deployment` on branch `main`, commit `7706f51470b7a34cbe5c27c4ab55bbfd42e3c24f`. Its jobs include Jekyll build/upload and `Deploy to GitHub Pages`; artifact `11768759460` has digest `sha256:5d16f3276a25b1746734e11f3ca141fc16933a76744ab6440526d6686013e869`.

This establishes a successful GitHub Pages static-site deployment for that main commit. The NCS branch HEAD at the earlier inspection was `5224c095ccea31245d50e8e254d07a4f3ca5d55a`, so this does not establish deployment of the NCS branch.

GitHub documentation describes Pages custom workflows as uploading a static artifact and deploying it with `actions/deploy-pages`: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

GitHub Pages does not execute Cloudflare Pages Functions. A successful static Pages deployment is not evidence that `functions/api/capture.js` is running as a server-side endpoint.

## 2. Cloudflare Pages Function — code-level finding, deployment UNKNOWN

Source: `functions/api/capture.js`, blob `83afd34b8d32840dd8944cb35b406076f2b9fd5c` on `main`.

The source exports:
- `onRequestGet()`: returns `{ok:true, service:"lumina-visual-audit", repository:...}`.
- `onRequestPost()`: if `env.GITHUB_TOKEN` exists, accepts a PNG and metadata, then performs four GitHub Contents API writes to `main`: history PNG, latest PNG, history JSON, latest JSON.
- Image validation caps a PNG at 12 MiB and validates MIME type; metadata is parsed as JSON.

Source-level security observation: the POST handler has no caller authentication, authorization, origin/CSRF check, request nonce, or application-level rate limit. If this Function is deployed with a write-capable `GITHUB_TOKEN`, an arbitrary internet caller who can reach the endpoint could potentially consume the token's repository write capability and create repeated commits/capture records. This is a CONDITIONAL RISK based on source; current Cloudflare deployment, secret configuration, public reachability, and actual exploitability are UNKNOWN. Do not assert that the endpoint is live or that abuse has occurred.

The documentation `docs/visual-audit-github.md`, blob `72a2f24f5ea13626008a6334d6099ca226d7fe2a`, describes Cloudflare Pages deployment and `GITHUB_TOKEN` setup as explicit configuration steps. No Cloudflare deployment receipt/project ID/domain/environment proof was found in the reviewed repository evidence.

Cloudflare's official docs distinguish Pages Functions deployment and logs from static site publication:
- https://developers.cloudflare.com/pages/functions/get-started/
- https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/

## 3. Client behavior

Source: `src/main-stable.js`, blob `b48d7fd9f51baee4cd1e9b319de56bb31eedb772` on `main`.

The client posts the PNG and simulation/camera/agent metadata to `window.__LUMINA_CAPTURE_ENDPOINT || "/api/capture"`. On any failed request, it falls back to downloading a local PNG. This means a static GitHub Pages host alone does not supply the server-side function; the client would need a deployed server endpoint at that route or a configured endpoint override.

## 4. Relevance to Nexo STEP 7

- The capture function is a Lúmina visual-audit writer, not the Nexo AuthorityGate, canonical Constitution owner, Genesis trust verifier, or final protected-effect sink.
- Its GitHub token is a delegated repository capability, not constitutional authority.
- Even if Cloudflare Pages is live, this function alone does not close any Nexo protected-transition gap.
- The confirmed static GitHub Pages deployment is a site deployment only; it does not prove the NCS branch is deployed or that any protected Nexo runtime exists.
- Do not add a superficial authentication wrapper as a substitute for the clean Nexo authority architecture. If the visual-audit endpoint is intended to remain, it needs its own bounded threat model and access-control decision; that is separate from Nexo STEP 7 commissioning.

## 5. Next evidence/action boundary

Read-only next step: establish whether Cloudflare Pages has an actual project/deployment for this repository, the exact production URL, deployment ID/commit, `uses_functions` status, and whether `GITHUB_TOKEN` is configured. This requires a Cloudflare dashboard/API deployment record or a known URL and successful live request; repository source is insufficient. Do not ask for or expose the token itself.

For Nexo STEP 7, continue separately to identify a real protected effect sink and canonical authority owner. If none is evidenced, keep effect execution blocked.

No code/tests/deployments/devices/authority were changed in this audit.


## 6. Additional confirmed client/static-site mismatch (2026-10-12)

Fresh inspection of the `main` tree found:
- Repository metadata reports `has_pages: true` and the default branch is `main`.
- `index.html`, blob `97fa1954d0838d09f4a286ea189c2661207f5aa2`, explicitly sets `window.__LUMINA_CAPTURE_ENDPOINT="/api/capture"` and loads `src/main-stable.js`.
- `src/main-stable.js`, blob `b48d7fd9f51baee4cd1e9b319de56bb31eedb772`, POSTs the capture to that endpoint and falls back to downloading a local PNG on any failed response.
- The observed successful GitHub Pages workflow builds with Jekyll and deploys the static Pages artifact. It does not deploy the Cloudflare Function source.

Conclusion: if this `main` site is served directly by GitHub Pages without an independently configured proxy/override, `/api/capture` is not implemented by that static deployment and the button should enter its local-download fallback. The exact live URL/request response was not verified because direct public-host access was unavailable from this inspection environment; do not claim a live 404 as observed. A separate Cloudflare deployment or routing layer remains possible but unverified.

This is a concrete deployment-integration gap to verify, not a Nexo authority finding. No source code or deployment was changed.
