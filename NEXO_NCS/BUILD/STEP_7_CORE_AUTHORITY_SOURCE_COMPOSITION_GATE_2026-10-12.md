# STEP 7 — Core authority-source composition gate
Date: 2026-10-12
Status: DESIGN CROSSWALK / ATTACK REVIEW — NO IMPLEMENTATION AUTHORIZED

## Purpose
This record closes one narrow research question: how the existing Genesis Trust Foundation, Constitution Authority Context, Constitution-to-Policy binding, and Core Policy Authority/Policy Source contracts compose without turning any downstream component into its own root. It does not select a trust channel, freeze the Constitution, identify a deployed sink, or claim runtime security.

## Source pins re-read
- Genesis Trust Foundation contract: blob e65df41ff98f7e53a8574ca5295a947023cb8b30.
- Core Policy Authority / Policy Source contract: blob 46f672ff36d23f9927824013545f9ef90d9af86b.
- Core Policy Authority contract attack: blob 334eb7310cd07bc432df4daf31f3bc23280b96af.
- Constitution-to-Policy binding contract: blob 34a4a8ecef267bb1d27cb50e927b613d0ff0f499.
- Constitution Authority Context future-countereffects gate: blob d5ebabcb05566593e32f3e1f9bf1047f6b99e0c0.
- Trust-function/root-role map: blob b93a2fd8e730d54bbe43493db137dc1b4d13d964.
- Protected-transition implementation: blob 00a4fa069f3ef0b843ecc5d280bb686f21be1bcd.
- Core ports: blob c7f9e2671e5735bd6cf85c86bf283bec58aeea7f.

## Minimum dependency order
1. Genesis basis: establish a pre-existing legitimacy basis and its provenance under the declared threat model. A candidate Genesis object, its own verifier, its own key, repository state, or a recovery snapshot cannot create this basis by self-assertion.
2. Constitution authority context: only after step 1, establish the exact Constitution identity/content, governed authority domain, validity/currentness, amendment/revocation/succession ordering, and provenance. A constructor, immutable object, hash, signature, or caller-supplied status is not the establishment mechanism.
3. Constitution-to-Policy binding: establish that the current governed Constitution permits the exact policy identity/content and scope for the stated policy class and mission/claim context. Policy version ordering is not authority ordering.
4. Protected policy source: provide the exact governed policy semantics and required dependencies with establishment provenance from the protected source path. It may establish policy identity/semantics/applicability only; it does not authorize an action, admit a candidate, commit state, execute an effect, or prove an external outcome.
5. Decision and effect boundary: downstream admission/authorization must consume the established context and remain separately governed. A context established earlier is not timeless; material authority, policy, scope, dependency, revocation, or currentness changes must invalidate/re-establish affected decisions. Final enforcement must be at the actual sink or an independently enforceable boundary.

## Attack results
- Self-bootstrapping: fails by design; no downstream contract can bootstrap step 1.
- Caller/provider-supplied AUTHORIZED, VALID, provenance, owner, policy hash, or current revision: insufficient without independently established producer and currentness.
- Correct policy hash under a stale or superseded Constitution: insufficient; byte identity does not establish current authority.
- Correct Constitution and policy binding with a widened mission/claim scope: insufficient; scope must remain bound end to end.
- Valid policy source result followed by revocation before final admission: insufficient unless the final sink enforces a currentness/fencing rule that orders revocation and effect admission.
- Recovered snapshot with valid integrity but unresolved succession/currentness: UNKNOWN/STOP; integrity does not choose the current constitutional branch.
- A successful conditional state commit: insufficient to prove an external effect was authorized or happened.
- Separate keys/processes/providers: not evidence of independence until shared dependency and failure-domain closure are established.

## Smallest coherent boundary
The semantic Core should consume a typed result whose meaning is narrowly: 'this exact Constitution regime is recognized under an already established Genesis basis, and this exact policy content is governed/applicable for this bounded context as of the stated currentness evidence.' That result is not itself a runtime capability merely because its fields are typed or immutable. Its producer and provenance must be established outside caller-controlled data; currentness must be checked where the protected decision/effect is linearized.

No new generic trust registry, universal policy engine, compatibility wrapper, duplicate epoch, second authority recheck, or synthetic effect callback is justified. The existing contracts already express the role separation; the missing item is the legitimate protected establishment path and concrete deployment binding, not another schema.

## Gate decision
- Contract composition: coherent as a semantic dependency order; no contradiction found in the reviewed contract text.
- Genesis basis and recognition channel: UNKNOWN / NOT SELECTED.
- Constitution artifact/content/scope: NOT FROZEN.
- Implemented canonical Constitution Authority Context owner: NOT ESTABLISHED.
- Protected Policy Source implementation rooted in Genesis: NOT ESTABLISHED.
- Production caller, deployed target, final sink and bypass closure: UNKNOWN / NOT DEMONSTRATED.
- Therefore implementation of this composition remains STOP. Existing isolated STEP 3–6 runtime tests remain valid only within their recorded limits; they do not establish this chain.

## Evidence and next step
This was a read-only source/contract crosswalk. No tests ran; no code, workflow, keys, Constitution, APK, device, deployment, or runtime authority changed. To proceed beyond this design gate, concrete evidence must identify (a) the independently recognized Genesis basis and verifier path and (b) the actual target/deployment and its last effect-capable sink. If either does not exist yet, keep commissioning STOP and continue design-only work; do not manufacture a production caller or mark the gate passed.

Research references: IETF RFC 9334 defines separate Attester, Verifier, and Relying Party roles; NIST SP 800-193 distinguishes protection, detection, and recovery functions. Neither standard selects Nexo's initial root or proves this repository's runtime composition. https://www.rfc-editor.org/rfc/rfc9334.html https://csrc.nist.gov/pubs/sp/800/193/final