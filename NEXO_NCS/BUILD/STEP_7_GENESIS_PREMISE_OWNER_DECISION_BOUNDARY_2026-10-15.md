# STEP 7 — Genesis premise and owner-decision boundary — 2026-10-15

Branch: `ncs-clean-architecture`  
Status: DESIGN ANALYSIS ONLY — NO PREMISE SELECTED — IMPLEMENTATION STOP

## 1. Purpose

Continue the existing initial-authority decision gate by separating what a direct owner decision can normatively establish from what the system can technically evidence. Reuse the existing Genesis, bootstrap-composition, Constitution Authority Context, AB104.452/453 recovery/succession, and Scope A contracts. This document does not choose a trust path, ratify the Constitution, or authorize implementation.

## 2. The distinction that cannot be collapsed

Three claims must remain separate:

1. **Normative owner decision:** the owner intends a stated constitutional basis, scope, and governance rule to be the starting point.
2. **Technical evidence of that decision:** the evidence path establishes which owner-intent event occurred, what exact content and decision it covered, and which assumptions/verifier were trusted.
3. **Nexo authority and effect admission:** a recognized, current authority context is enforced at the relevant final effect boundary.

A statement can be normatively decisive for the human making it while still having weak machine-verifiable provenance. Conversely, a cryptographically valid signature can be machine-verifiable without proving that the owner reviewed the same content or that the signer was constitutionally entitled to make that decision.

No one of these claims may silently substitute for another.

## 3. What a direct owner decision can establish

A deliberate owner decision can be the **normative origin** of the initial constitutional choice. It can state, in human terms, which constitutional candidate is intended, the decision's scope, and the boundaries the owner is not granting.

That does not by itself establish the following technical facts:

- that the presented content is identical to the bytes or canonical representation later endorsed;
- that a compromised Core/app or OS could not replace the content or alter the approval request;
- that the verifier's software, policy, key, and trusted inputs have justified provenance;
- that the record is current, unreplayed, unrevoked, and protected from rollback;
- that the accepted authority reaches every protected sink with no bypass;
- that an external effect did or did not occur.

A record in chat, a repository, a local file, a biometric prompt, a key operation, or a GitHub workflow cannot be promoted to these stronger claims merely because the owner said “yes” or because the record is durable.

## 4. The bootstrap premise must be explicit

There is no derivation from zero assumptions. Some initial proposition must be accepted as the starting trust basis. That is not a defect if it is made explicit, narrowly scoped, and honestly classified; it becomes a defect when a component hides the premise and claims to have proved itself.

For Nexo, the normative source of the initial decision remains the owner. A verifier can be designated as a bounded technical witness under an explicitly accepted basis; it does not become constitutionally superior to the owner. But the designation and the verifier's policy still need an initial trust premise. If the only support for that premise is a claim emitted by the verifier or by the same untrusted Nexo closure it is supposed to check, the chain remains circular.

The bootstrap premise must therefore say which initial trust facts are **assumed by owner decision** and which are **independently evidenced**. Do not label an assumed fact “verified.”

## 5. Current accepted assumption is insufficient for L2

The previously accepted POCO assumption is limited to faithful screen presentation during a possible first ceremony. It does not establish the relation between the displayed content and the exact bytes/decision submitted to an approval or signing path. It also does not protect that relation against a compromised Android OS or malicious Core/app.

Therefore that assumption alone cannot support the existing L2 claim (exact owner-intent evidence resistant to the declared malicious-Core/compromised-OS threats). Broadening the assumption to cover the entire presentation/input/approval/content-binding path would materially narrow the threat claim; that change has not been selected or accepted. Preserving L2 requires a concrete, justified independent path that is not currently demonstrated.

This is a finding about the currently selected setup, not a claim that L2 is universally impossible.

## 6. Decision boundary

| Question | Current result | Consequence |
|---|---|---|
| Is the owner the normative source of the initial constitutional decision? | Project principle; no ceremony/ratification event recorded | Do not infer a completed decision from prior discussion or draft display |
| Is there a specific reviewed canonical artifact and narrow endorsement whose exact content binding is evidenced? | NOT ESTABLISHED | No Scope A review-evidence claim |
| Is the verifier/policy's initial trust basis justified independently of the producer being checked? | NOT ESTABLISHED | No independent verification claim |
| Is the POCO screen-only assumption enough for L2? | NO | Do not relabel the current path as L2 |
| Is a broader environmental assumption accepted? | NO | Direction A remains unresolved |
| Is a concrete independent L2 presentation/approval/verifier path evidenced? | NO | Direction B remains unresolved |
| Is constitutional authority current and enforced at every protected sink? | NOT ESTABLISHED | No commissioning or protected effects |

## 7. What this analysis does and does not authorize

It supports only the following conclusion: **the initial owner decision is a normative premise, not a technical proof artifact**. The system must preserve that distinction in the evidence model.

It does not authorize a key, signature, hash freeze, verifier, ceremony, host, APK, code change, new schema, or a weaker self-reported record. It does not record the owner's review or ratification of the Constitution. It does not resolve Direction A versus Direction B.

No new IDs, stores, queues, retries, tombstones, transaction wrappers, generic trust registry, quorum engine, or universal GenesisRoot are proposed.

## 8. Current disposition

- STEP 7: **OPEN / STOP / UNKNOWN**.
- Normative owner decision: principle identified; no completed ceremony/ratification event recorded.
- Exact reviewed-content/decision binding: **NOT ESTABLISHED**.
- Initial verifier/policy provenance: **NOT ESTABLISHED**.
- L2 path under the declared threat model: **NOT ESTABLISHED**.
- Constitutional currentness and protected-sink bypass closure: **NOT ESTABLISHED**.
- No implementation, key, signature, ceremony, device operation, or commissioning performed or authorized.

## Related evidence

- [Initial authority bootstrap decision gate](STEP_7_INITIAL_AUTHORITY_BOOTSTRAP_DECISION_GATE_2026-10-15.md)
- [Scope A review-evidence minimum acceptance contract](STEP_7_SCOPE_A_REVIEW_EVIDENCE_MINIMUM_ACCEPTANCE_CONTRACT_2026-10-15.md)
- [Minimum bootstrap composition contract](STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md)
- [Claim-relative failure-domain and effect-class inventory](STEP_7_CLAIM_RELATIVE_FAILURE_DOMAIN_AND_EFFECT_CLASS_INVENTORY_2026-10-15.md)
