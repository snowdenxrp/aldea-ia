# NCS — Cryptographic Research Reconciliation: Threshold Rotation and Authority Generations
Date: 2026-10-08
Status: HISTORICAL RESEARCH RECONCILED WITH EXTERNAL REFERENCES — DESIGN ONLY
Scope: Path B / genesis trust research. No implementation, enrollment, commissioning, activation, or production effects.

## Why this record exists
The prior NCS exploration considered an SAT e.firma as a conditional pre-existing credential candidate before fully reusing the historical Nexo cryptography work. That was premature as an architectural direction. e.firma is not selected as a Nexo root, and no dependency on SAT is accepted. This record resumes the already documented cryptographic research rather than inventing a new trust family.

## Historical Nexo evidence re-opened
1. `docs/nexo/AB104.447_THRESHOLD_GOVERNANCE_BYZANTINE_ROOTS_2026-09-26.md`: threshold signatures do not prove signer independence, current policy, semantic correctness, or current governance state. It explicitly points to AB104.448.
2. `docs/nexo/AB104.448_THRESHOLD_MEMBER_ROTATION_PROACTIVE_RESHARING_2026-09-26.md`: distinguishes SHARE_REFRESH, MEMBER_ROTATION, and AUTHORITY_ROTATION. It identifies stale members, share-generation rollback, policy changes during refresh, partial distribution, overlap of old/new shares, and adaptive compromise as separate hazards.
3. `docs/nexo/AB104.449_ATOMIC_THRESHOLD_ROTATION_ACTIVATION_FAILURE_2026-09-26.md`: local success is not global activation; partial state or unknown activation must not be guessed. The activation boundary must atomically advance authoritative generation and fence old generations, or hold/quarantine.
4. `docs/nexo/AB104.453_OFFLINE_RECOVERY_ROOT_SUCCESSION_2026-09-27.md`: recovery root is not invulnerable or an unlimited super-root; succession needs protected evidence and scope.
5. `docs/nexo/AB104.454_THRESHOLD_RECOVERY_CUSTODY_COLLUSION_2026-09-27.md`: separates cryptographic, governance, independence, availability, and evidence thresholds; common dependencies can collapse apparent threshold independence.
6. `docs/nexo/AB104.455_ACTIVE_ADAPTIVE_THRESHOLD_SETUP_2026-09-27.md`: distinguishes trusted dealer, VSS, DKG, proactive resharing, and adaptive-security assumptions. DKG removes the single trusted dealer from one part of setup, not all trust or governance requirements.

These documents are research/design records. They are not proof of a deployed threshold system or a selected Nexo root.

## External cross-check
- RFC 9591 (FROST) describes a threshold Schnorr signing protocol, but explicitly assumes the coordinator and signer set are chosen externally and that key shares are generated/distributed securely; its security model limits corrupted participants to fewer than the signing threshold. It is informational, not an Internet Standards Track specification. Therefore FROST can be a candidate signing primitive, but does not establish Nexo participant legitimacy, current membership, constitutional authority, or enforcement.
- NIST IR 8214C (January 2026) solicits multi-party threshold schemes and reference material; NIST's threshold program treats setup, security models, implementation, and active/adaptive corruption as distinct concerns. This is evidence that implementation/security claims need construction-specific evidence, not a reason to select a scheme by name.
- RFC 9334 (RATS) separates Attester evidence, Verifier appraisal, and Relying Party authorization. The policy and trust anchors used by those roles must themselves be established and protected.
- RFC 6024 requires trust-anchor management to address replay detection and recovery after trust-anchor loss/compromise. An old valid signature or certificate chain cannot alone establish current trust state.

References:
- https://www.rfc-editor.org/rfc/rfc9591.html
- https://csrc.nist.gov/pubs/ir/8214/c/final
- https://www.rfc-editor.org/rfc/rfc9334.html
- https://www.rfc-editor.org/rfc/rfc6024.html

## Consolidated finding
Do not select e.firma, FROST, DKG, VSS, a TPM/TEE/StrongBox, HSM, threshold quorum, or any single credential as the genesis authority merely because it is cryptographically valid or available.

For a threshold-based governance candidate, the minimum semantic sequence is:
1. Establish the governing authority and participant-enrollment basis independently of the candidate set.
2. Bind a canonical authorization object to action, Constitution identity/version/digest, target, scope, current authority/member/share/policy/recovery generations, and fresh anti-replay context.
3. Verify signature/protocol validity under the specified construction and its exact adversary assumptions.
4. Independently appraise participant eligibility, currentness, revocation, dependency closure, and failure-domain independence.
5. Admit the governance transition at a protected authoritative activation boundary; atomically fence old generations and define crash/partial/unknown activation behavior.
6. Separately verify that any intended effect was enforced and reconcile uncertain outcomes.

The six steps are a synthesis of existing contracts and historical findings, not a new universal trust framework or an implementation specification. The exact construction, root, verifier, participant set, and activation owner remain unselected.

## Current gate
- Path B: BLOCKED/UNKNOWN. No concrete pre-existing, independently grounded genesis credential/root/verifier and enforcement boundary is evidenced for this deployment.
- Path A: evaluation-only. Environmental assumptions have not been accepted as true.
- e.firma: conditional external possibility only; not selected and not an architectural requirement.
- No threshold scheme or hardware class selected. No keys generated/used, participants enrolled, credentials inspected, code written, ceremony run, or Nexo commissioned/activated.
- Do not implement until the missing genesis recognition basis and protected Constitution/policy authority owner are evidenced and a separate owner decision authorizes implementation.

## Next research gate
Continue with the exact unresolved point in the historical chain: determine whether any already-existing, independently grounded trust/recognition basis is available for this deployment. If none is evidenced, report the blocker directly rather than generating credentials, introducing a trusted dealer, choosing a threshold, or treating the repository itself as its own authority.
