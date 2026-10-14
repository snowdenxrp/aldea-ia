# STEP 7 — Constitution Artifact Readiness Audit
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: SOURCE CROSSWALK / DRAFT NOT FROZEN / NO COMMISSIONING

## Purpose

Apply the owner-accepted bounded honest-device/presentation premise to the next real dependency: the exact constitutional artifact that could be reviewed in a first recognition ceremony. This is a source/document audit, not an approval or Constitution draft.

## Owner premise now recorded

The owner accepted the provisional assumption that the POCO and its screen faithfully present the content being approved, **only for the first recognition ceremony**. The decision is recorded in:
`NEXO_NCS/DECISIONS/STEP_7_BOUNDED_INITIAL_HONEST_DEVICE_PREMISE_2026-10-14.md`.

This resolves the explicit owner-choice gate for that narrow assumption. It does not establish artifact identity, verifier provenance, currentness, protected enforcement, or recovery.

## Source evidence reviewed

- `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md`, blob `78872e9c86bac2738de9ab49f6f3d35a075c8bcf`.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`, blob `e65df41ff98f7e53a8574ca5295a947023cb8b30`.
- `NEXO_NCS/BUILD/STEP_7_GENESIS_TRUST_FOUNDATION_CONTRACT_ATTACK_2026-10-08.md`, blob `569204e35e28a6e9f1981496417f432762ae1bb2`.
- `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`, blob `7528771ee531c06a6615f465f1b4f7981ea80f7f`.
- `NEXO_NCS/BUILD/STEP_7_COMMISSIONING_ACCEPTANCE_TEST_MATRIX_2026-10-12.md`, blob `2d65a0d469c929f0fdca6d1ad21ad65138dc0d4e`.
- `NEXO_NCS/BUILD/STEP_7_CORE_AUTHORITY_SOURCE_COMPOSITION_GATE_2026-10-12.md`, blob `f9a5b7a387f65cbfb2d9fe13d4df478862bad0f3`.
- `NEXO_NCS/BUILD/STEP_7_CONCRETE_OWNER_RECOGNITION_PATH_PROPOSAL_2026-10-14.md`, blob `e1826c1749dca606dffa8c4e73ba4e9d92d5b51d`.
- `NEXO_NCS/BUILD/STEP_7_BOOTSTRAP_THREAT_MODEL_DECISION_TABLE_2026-10-14.md`, blob `61a650674d546f601bd1c97c803dcbb8ebef5a0c`.

## Finding 1 — MASTER is a normative source, not yet the frozen Constitution artifact

The inspected MASTER states that the Constitution should be a versioned immutable root with an ID/version/hash, protected invariants, authority domains, amendment rules, emergency containment, trust roots, mandatory gates, prohibited transitions, recovery, evaluator independence, and audit. It also defines important principles such as cognition ≠ authority ≠ execution ≠ verification, fail-closed UNKNOWN handling, capability/authority monotonicity, and separation of external effects from their verification.

However, the inspected evidence does not identify a separately frozen, canonical Constitution artifact whose exact bytes, version, complete human-readable rendering, amendment/succession rules, and initial scope are already approved. Therefore the MASTER must not silently be treated as a ready-to-commission Constitution; it is the source from which a proposed constitutional draft would be assembled and reviewed.

This is a bounded repository finding, not a claim that no such artifact could exist elsewhere.

## Finding 2 — Genesis and Constitution are distinct

The existing Genesis Trust Foundation contract explicitly separates genesis trust from Constitution, identity, policy, mission authority, recovery authority, and execution authority. Its attacked contract rejects self-signing genesis, hash-as-trust, signature-as-currentness, recovery self-root, snapshot resurrection, and root amplification.

The Constitution Authority Context contract is downstream of an already recognized trust foundation. A typed context, hash, signature, valid state commit, or caller-supplied provenance does not establish its own legitimacy.

Consequently, the newly accepted human/device presentation premise is only the bounded source of intent for the first recognition ceremony. It does not implement Genesis Trust Foundation or the protected Core establishment boundary.

## Readiness gates for a future constitutional draft

Before any commissioning digest or signature is created, a draft must make the following reviewable in one coherent artifact or in explicitly version-bound normative attachments:

1. **Identity and canonicalization:** stable constitution identifier, draft/revision label, UTF-8/canonical byte rules, deterministic complete rendering, and a rule that any byte/content change invalidates prior review.
2. **Protected invariants and scope:** which invariants are constitutional, which authority domains exist, and what the initial recognition explicitly does and does not authorize.
3. **Authority separation:** owner intent, identity credentials, trust foundation, policy, recovery, succession, execution and verification remain distinct.
4. **Amendment/currentness:** who may propose versus approve amendments; how exact content/scope is bound; how conflicting revisions, rollback, revocation and offline uncertainty are handled.
5. **Succession and recovery:** no automatic successor authority, no recovery self-authorization, no resurrection from a stale snapshot, and no authority amplification; unresolved legitimacy remains STOP/UNKNOWN.
6. **Emergency containment:** bounded triggers, powers, scope, duration and exit conditions; emergency safety cannot become ordinary constitutional authority.
7. **Protected effect boundary:** commissioning alone cannot be interpreted as permission to execute arbitrary missions or protected effects; actual target/sink enforcement is a separate required proof.
8. **Threat assumptions and evidence limits:** the first-ceremony honest-device assumption is explicitly scoped; platform attestation, hashes, signatures and repository provenance each retain their stated limited meanings.
9. **Human-readable review:** the owner must be able to review the full content and scope, not only a digest; no hash or signature is generated while the draft is changing.
10. **Recovery/reference handling:** the proposed paper record remains optional/unratified until separately accepted; it is a reference aid, not an authority root. Loss of all recognized references cannot be solved cryptographically from nothing.

This list is a readiness checklist, not a new parallel authority contract. The existing MASTER and STEP 7 contracts remain normative inputs; contradictions must be resolved, not patched with new metadata.

## What can advance now

- The bounded initial-trust premise is owner-accepted and recorded.
- The repository can proceed with a **proposed constitutional draft assembled from existing MASTER/AB/P evidence**, with traceability for each clause and explicit OPEN items.
- The draft must remain DRAFT / NOT FROZEN until adversarial review and owner review of its complete contents.
- Only after the artifact is stable should canonical bytes and a digest be generated for review. That digest identifies bytes; it does not itself establish authority.

## What remains blocked

- No Constitution is declared frozen or commissioned by this audit.
- No verifier is selected or proven to be the intended executing verifier.
- No canonical active-Constitution state owner/currentness/revocation mechanism is implemented.
- No complete production protected sink or bypass-closed enforcement path is demonstrated.
- No recovery basis is accepted or implemented.
- No key, signature, commissioning digest, APK, device, deployment, or runtime authority changed; no tests ran.

## Decision

Proceed to build a traceable **constitutional draft/readiness package** from existing MASTER + AB + P/P112 evidence. Do not start key enrollment or commissioning. Keep protected effects at STOP/UNKNOWN until the remaining independent gates have evidence.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
