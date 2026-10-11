# STEP 7 — Draft Bounded Human-Genesis Assumption Set — 2026-10-11

Status: DRAFT FOR OWNER REVIEW — NOT ACCEPTED — DESIGN ONLY — NO PROTECTED ACTIVATION

## Purpose and boundary

This is the smallest candidate assumption statement for a possible human-supervised first-boot ceremony. It follows the existing IR-1, Genesis Trust Foundation, root-recognition gate and existing-resource check. It is not a claim that a ceremony is already secure, and it does not authorize implementation or protected commissioning.

**Proposed scope:** one initial transition that recognizes one exact, versioned Constitution and one explicitly named commissioning context. It grants no general mission, policy, execution, recovery, succession, or external-effect authority.

## Candidate assumptions that would have to be explicitly accepted

| ID | Proposed assumption | What it does NOT prove |
|---|---|---|
| H1 — Owner presence | Kevin is physically present, understands the ceremony and intentionally initiates it. | A button press, device unlock or ordinary conversation alone does not prove owner identity or informed approval. |
| H2 — Controlled setup environment | During this limited ceremony, Kevin can keep the setup environment and its physical access under his direct supervision; no unobserved adversary has substituted the prepared software or material. | This is an environmental assumption, not measured boot or independent platform attestation. |
| H3 — Honest presentation path | For the scope of the ceremony, the presentation/approval host is assumed not to be compromised in a way that displays one Constitution/context while submitting another or fabricates the approval. | The ceremony cannot claim resistance to a compromised host that controls both what Kevin sees and what the verifier receives. |
| H4 — Exact-content review | Kevin is given the complete relevant Constitution identity/content, version, context and scope in a form he can meaningfully inspect before approving. | A digest, abbreviated display, generic “approved” label or hidden content is not meaningful review. |
| H5 — Narrow informed approval | Approval is explicit and refers to the exact content/context and one named transition, with no implicit delegation. | It does not authorize later amendments, key rotation, succession, recovery, mission execution or unrelated effects. |
| H6 — Verifier and enforcement still required | Before reporting ESTABLISHED or enabling the transition, an identified verifier and final effect boundary must be independently justified and tested against the accepted claim. | Owner acceptance of H1–H5 cannot substitute for a verifier, replay/currentness controls, lifecycle rules, provenance or bypass-closure evidence. |
| H7 — Unknown means stop | Any mismatch, interruption, stale/conflicting evidence, missing critical dependency, inability to inspect, or unverifiable verifier/status leaves the transition UNKNOWN/STOP. | No automatic fallback, retry, local flag or recovery snapshot may silently grant authority. |

## Explicitly excluded claims

If H1–H5 were ever accepted, the resulting ceremony still must NOT claim:
- resistance to compromise of the presentation/approval host or its software supply chain;
- independent hardware attestation unless separately demonstrated;
- proof of Kevin's identity from device ownership, PIN, app session, voice, a gesture or a UI label alone;
- currentness or revocation merely from a local file, version number, epoch, timestamp, hash or signature;
- legitimacy of a verifier merely because it is named Core/Nexo or bundled with the candidate;
- successful enforcement merely because a ceremony returns success or writes an audit record;
- safe recovery, replacement or succession without separate governed transitions.

## Feasibility status against current evidence

- H1 is a governance/intent condition that must be observed during a future ceremony, not established now.
- H2 and H3 are not verified. They would be explicit environmental assumptions, and H3 leaves compromised-host attacks out of scope.
- H4 and H5 have no implemented presentation-to-approval binding in current evidence.
- H6 is not satisfied: the independent verifier and final protected-effect boundary are still unestablished.
- H7 is a required failure rule, but its enforcement must be implemented and tested at the actual boundary.

Therefore **even if Kevin later accepts H1–H5, this draft does not permit Genesis Trust Foundation = ESTABLISHED today**. H6 is a separate technical gate.

## Review gate before any owner decision

Before asking Kevin to accept this assumption set:
1. Name the actual limited first-boot transition and the exact Constitution artifact/version/context it would cover.
2. Identify which component displays the content, captures approval, verifies it, establishes currentness/revocation, and enforces the final transition.
3. Draw the concrete data/authority path between those roles and identify every shared failure domain.
4. State which of those components are trusted by assumption versus independently evidenced, and what the assumption cannot resist.
5. Demonstrate that any failure, mismatch, interruption, replay or unknown status remains blocked at the last controllable effect boundary.
6. Reconcile the result with MASTER + frozen AB + P/P112 before any implementation.

If this analysis cannot identify a justified verifier and actual final enforcement boundary, do not ask the owner to accept the ceremony as a solution. Keep the protected transition blocked and continue non-protected work.

## Current disposition

Draft only. Kevin has not accepted these assumptions. No verifier, platform, device, provider, key, or ceremony is selected. No device changes or protected commissioning occurred.
