# STEP 7 — Canonical Constitution Review Completeness Gate — M0.23 — 2026-10-16

Status: DESIGN ANALYSIS ONLY — NO OWNER DECISION / NO IMPLEMENTATION AUTHORIZED

## Purpose

Continue the canonical-scope/verifier work without repeating the Android Protected Confirmation capability search. M0.21/M0.22 already establish that a protected prompt, even if supported, is not by itself evidence that the complete Constitution was reviewed. This record turns that limitation into a precise review-completeness gate.

## New bounded conclusion

A constitutional review event must not be interpreted as ratification, authority grant, or commissioning unless the review protocol establishes all three separately:

1. **Canonical subject identity** — which exact Constitution bytes and revision were presented for review.
2. **Review-scope completeness** — which sections, appendices, referenced policies, dependencies, and unresolved fields were in scope, and evidence that none were silently omitted, substituted, truncated, or rendered ambiguously.
3. **Decision semantics** — whether the human action means only “I saw/reviewed this material,” “I acknowledge receipt,” “I approve this exact constitutional revision,” or “I authorize a narrowly specified transition.” These are not interchangeable.

A hash of the canonical bytes can identify a subject but does not prove the human saw those bytes or a faithful rendering. A display attestation can support a claim about presentation, but does not establish constitutional legitimacy, comprehension, currentness, or the authority of the verifier. A UI confirmation alone cannot upgrade a review acknowledgement into ratification.

## Review-completeness requirements matrix

| Requirement | Minimum evidence needed | Fail-closed result if absent |
|---|---|---|
| Exact canonical subject | Stable retrieval of the exact byte sequence reviewed, plus its digest and unambiguous revision relation | UNKNOWN; no approval interpretation |
| Full scope manifest | Explicit inventory of all included sections and dependencies, including appendices and referenced policy material | UNKNOWN; do not claim full Constitution review |
| Rendering binding | Deterministic rendering rule/version tied to the canonical subject; verifier can reconstruct or validate the presentation | UNKNOWN if rendering provenance cannot be checked |
| No truncation or omission | Protocol-level detection that the entire declared scope was displayed; any overflow, inaccessible section, unsupported field, or rendering failure aborts | Abort review; no partial display may count as full review |
| Meaning of human action | Exact, plain-language decision text distinguishes review acknowledgement from ratification/authority grant | Treat as acknowledgement only, or UNKNOWN if ambiguous |
| Freshness/currentness | Verifier-established challenge/freshness and current Constitution/succession/revocation context, rooted outside the claim being verified | UNKNOWN; no authority transition |
| Verifier legitimacy | Independently established verifier identity, trust anchors, appraisal policy, and update/currentness rules | UNKNOWN; a verifier cannot bootstrap itself |
| Decision-to-scope binding | If a later decision is requested, it names the exact canonical subject and explicitly bounded transition/effect scope | No effect; no implicit expansion |
| Evidence provenance | Evidence is produced/verified at the protected boundary, not accepted solely because caller fields say “verified” or “authorized” | UNKNOWN |
| Final enforcement | The actual effect-capable sink enforces the verified decision and cannot be bypassed through another production path | STOP; no commissioning |

This matrix is a set of necessary review conditions, not a claim that they are sufficient for L2. They must be instantiated against the actual target deployment, threat model, and protected effect before implementation.

## Important consequence for Android Protected Confirmation

The documented prompt-size/display constraints make it unsafe to infer that a long Constitution was reviewed merely because a short prompt was confirmed. A short prompt may bind the user to a digest or scope reference only if the relying party can independently verify that reference, reconstruct the exact declared material, and show that the user-facing action's meaning was not broader or different from the prompt. Even then, it does not establish comprehension or independent constitutional legitimacy.

If the complete scope cannot be rendered and reviewed faithfully under the chosen protocol, the protocol must explicitly narrow the reviewed scope or abort. It must not silently summarize, truncate, omit referenced material, or treat an acknowledgement as constitutional ratification.

## Role boundaries

- **Canonical Constitution**: governed content; not its own trust root.
- **Renderer/presentation mechanism**: presents content; cannot declare the content authoritative.
- **Human review action**: evidence of a narrowly defined action; not automatically a grant of authority.
- **Verifier/appraiser**: evaluates evidence under an already governed trust basis; cannot establish its own trust anchors or appraisal policy.
- **Genesis/recognition basis**: the still-unresolved prior legitimacy basis.
- **Final effect boundary**: must enforce any authorized transition; presentation evidence alone cannot enforce it.

Do not collapse these roles into a new monolithic bootstrap object or generic registry.

## Unresolved questions — deliberately not answered by this record

1. What exact Constitution revision and scope should be presented first?
2. Which review action, if any, does the owner intend: acknowledgement only, ratification, or authorization of a specified transition?
3. What independent source establishes verifier trust anchors and verifier-policy currentness?
4. What actual target and effect-capable sink must enforce the result?
5. What succession/revocation rule governs a previously reviewed revision after it is superseded?

No values are inferred for these questions. They require owner governance or deployment evidence; this document does not decide them.

## Evidence and change boundary

- Reuses existing M0.20 failure-domain inventory and M0.21/M0.22 Android presentation findings; it does not repeat public product-support research.
- No device interaction, APK, key generation, signature, prompt, Constitution edit, owner-review event, test, CI workflow, commissioning, or protected effect occurred.
- No new Core API, identifier scheme, registry, queue, retry, or authority mechanism is proposed.
- Step 7 remains OPEN / STOP / UNKNOWN; Constitution remains DRAFT / NOT FROZEN / NOT COMMISSIONED; protected effects remain STOP.

## Next exact action

Cross-check the repository's existing Constitution-to-Policy binding and initial authority bootstrap contracts against this matrix, and report only a concrete contradiction or a missing owner/provenance binding. Do not implement the matrix as a runtime contract until the canonical subject, intended human decision, verifier trust source, deployment target, and final sink are grounded.
