# STEP 7 — Recognition Channel Comparative Assessment
Date: 2026-10-08
Track: NCS clean architecture
Status: DESIGN ASSESSMENT — NO CHANNEL OR CRYPTOGRAPHIC MECHANISM SELECTED — NO IMPLEMENTATION AUTHORIZED

## Purpose
Compare the three research-priority channel families already identified by the accepted independent commissioning requirement and the minimum genesis commissioning threat model. This assessment reuses those records; it does not repeat their generic attacks or select a specific product/protocol.

## Governing requirements
- The legitimate source of the act remains explicit owner-authorized commissioning under the Constitution; software, model, provider, device, or recovery process cannot invent it.
- Recognition must be independently grounded relative to the uncommissioned candidate, not merely stored or asserted by that candidate.
- Approval binds to the exact canonical Constitution/version, Nexo incarnation/deployment, and unique commissioning context; replay or substitution cannot authorize a different context.
- Provider independence, local-first operation, portability, explicit consent, revocation/currentness, loss/recovery and common-mode dependencies must be explicit.
- Missing or conflicting required evidence means UNKNOWN/STOP for protected activation. It must not imply consent or promote a candidate into authority.
- A successful authentication is only evidence for its defined claim; it is not blanket authorization for future operations.

## Comparison

### A — Separate owner-held authenticator / security key
**Can establish, if a sound protocol and enrollment ceremony are proven:** possession/control of a separately held credential and approval of a challenge bound to the exact commissioning context.
**Cannot establish by itself:** that the credential was originally bound to the legitimate owner through a trustworthy ceremony; that the user understood the displayed Constitution; coercion resistance; safe recovery after loss; or currentness if revocation cannot be checked.
**Dependencies to close:** issuance/enrollment, verifier trust, authenticator lifecycle, local/offline verification, candidate UI integrity, firmware/update chain, PIN/user-verification semantics, revocation and replacement.
**Assessment:** plausible candidate for the active approval channel, but only if the enrollment/bootstrap problem is solved independently and the candidate cannot substitute the content/context shown to the owner.

### C — External genesis provisioning / external ceremony
**Can establish, if independently governed:** a pre-established reference or binding delivered through a channel not controlled solely by the candidate.
**Cannot establish by itself:** legitimacy of the external issuer, freedom from issuer capture, owner intent unless the owner explicitly approves the bound act, or long-term independence if the issuer retains exclusive control.
**Dependencies to close:** issuer governance and authority limits, supply chain/custodian, account/vendor/network dependency, auditability, portable export/exit, revocation, offline operation, and whether provisioning can be repeated without silently changing the root.
**Assessment:** conditional bootstrap option, not a default. It is acceptable only if external authority is bounded and the design can leave that provider without losing Nexo's identity/authority or allowing unilateral provider promotion.

### E — Physical approval/recovery medium
**Can establish, depending on design:** possession of an independently stored artifact or a human-readable out-of-band reference that can help authorize or recover a bounded transition.
**Cannot establish by itself:** currentness, non-duplication, informed consent to a displayed context, or safe revocation. A static bearer secret may be copied or stolen; a printed digest alone proves no human approval.
**Dependencies to close:** secure creation and issuance, entropy/uniqueness where secret material is used, duplication/theft, storage, revocation/replacement, binding to exact context, and recovery after loss of both the medium and primary authenticator.
**Assessment:** potentially useful as a recovery/continuity role or second channel, but must not become a magic master secret or an unrevocable root.

## Cross-cutting conclusion
No single family automatically proves the complete claim “Kevin explicitly commissioned this exact Nexo Constitution in this exact deployment.” The protocol must distinguish:
1. owner-authorized intent;
2. credential/channel control;
3. exact content and deployment binding;
4. independent appraisal and currentness;
5. the protected state transition and verifiable result.

The channel is only independent relative to a named threat. Two artifacts that share the same account, provider, compromised device, update authority, or recovery path must not be counted as independent against compromise of that dependency.

## Unresolved decision boundary
The current evidence supports continuing the comparison without selecting a product or protocol. A concrete choice still requires a declared acceptable recovery posture: what should happen if the active channel is lost or compromised, and which dependencies may be trusted to help recover without self-promoting a replacement root? Existing context does not authorize inferring this answer. No user choice is required before completing the dependency analysis; ask only if multiple designs remain materially different after that analysis.

## Gate / next action
Build a dependency and failure-mode matrix for A, C, and E: issuer/enrollment, verifier, candidate UI, network/provider, update path, revocation, offline use, theft/loss, replacement/recovery, portability/exit, and exact-context consent. Identify whether a candidate can meet the requirements without hidden provider dependence or circular trust. Then attack the narrowest viable protocol contract. Do not implement the Trust Foundation or Constitution Authority Context until the root is independently recognizable and the contract passes adversarial review.
