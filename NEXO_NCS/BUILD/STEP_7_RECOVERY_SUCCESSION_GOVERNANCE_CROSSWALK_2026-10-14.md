# STEP 7 — Recovery and Succession Governance Crosswalk
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: EVIDENCE REUSE / DESIGN BOUNDARIES ONLY / NOT COMMISSIONING

## Purpose

Consolidate the recovery and succession implications already present in MASTER, the STEP 7 trust contracts, and historical AB/P findings. This is not a new recovery protocol, not a selection of a successor, and not an implementation authorization.

## Evidence reused (no closed audit rerun)

- `NEXO_MASTER_ARCHITECTURE_2026-09-23.md`: constitutional governance includes recovery, succession, emergency containment, revocation, audit, and enforcement boundaries.
- `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`: recovery cannot replace the Genesis basis with an artifact that authenticates itself; without a recognized basis or separately governed recovery/succession root, remain UNKNOWN/quarantined.
- `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`: recovered state, a valid snapshot, a new epoch, and current authority are distinct. A snapshot cannot resurrect authority.
- `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`: recovery authority and succession/order are separate semantic roles; role names do not prove a protected implementation exists.
- AB104.446: root enrollment/de-enrollment is an authority transition, not ordinary configuration; a root cannot enroll itself; root removal must invalidate dependent admissions; conflicting governance states are disputed/quarantined; emergency recovery must not simply weaken normal admission rules.
- AB104.429: offline revocation/currentness is a separate distributed-state problem. A valid credential or signed revocation artifact is not, alone, proof of current authorization.
- AB104.563–565: evidence validity, epoch validity, predecessor continuity and current authority are distinct. Epoch/witness changes require a protected semantic activation boundary; a restored old snapshot must not reactivate superseded authority.
- AB104.571: final recovery activation must bind the validated dependency/version snapshot and current recovery fence at the authoritative commit boundary; client-side check-then-write is insufficient. An ambiguous commit result requires authoritative reconciliation, not a blind retry.
- AB105.111R/112R/116R continuity handoff: recovery, reconciliation and reauthorization are distinct stages; the evidence that makes authority VALID after revocation was explicitly left undefined in the historical model. Do not import one candidate interpretation silently.
- GLOBAL-AUDIT-109: STOP/revocation must survive stale incarnations, cached credentials, checkpoints, queued/in-flight work and provider boundaries; model compliance or a local STOP is not proof of global enforcement.

These documents are design/research evidence, not proof of a running implementation. Closed historical probes are not repeated here.

## Recovered invariants

1. **Recovery cannot create its own legitimacy.** The authority to recover must come from a previously recognized constitutional/Genesis basis or a separately governed basis established before the crisis.
2. **Recovery is not succession.** Restoring state, rotating a key, creating an epoch or reconciling effects does not appoint a successor.
3. **Succession is not identity.** Kinship, device possession, credential possession, predecessor absence or a technically newer record cannot alone establish successor authority.
4. **Reconciliation is not reauthorization.** Reconciliation resolves what happened or what state can be reconstructed; it cannot make authority VALID unless the governing contract explicitly defines and independently supports that authority-bearing meaning. Existing AB105.116R records the provenance question as OPEN.
5. **Historical validity is not current authority.** An old certificate, signed checkpoint, valid snapshot or prior approval may remain evidence but must not regain authority after revocation/fencing.
6. **Final recovery activation must resist TOCTOU.** All protected dependencies and the current recovery/authority fence must still match at the authoritative commit boundary. A client-side check followed by a separate write is not sufficient.
7. **Uncertain commit outcome is UNKNOWN.** Reconcile against the authoritative state before retrying; do not assume the transaction failed or succeeded.
8. **Root lifecycle is governance.** Enrolling, removing, replacing or changing the threshold/independence policy of trust roots changes who may authorize a claim. It cannot be performed by the candidate root or by silently lowering the existing requirements.
9. **Emergency containment is bounded.** Emergency mode may not silently become general governance, permanent succession or an easier authority path.
10. **No recognized basis means no fabricated recovery.** If all recognized credentials and independent references are lost and no pre-governed recovery path survives, the honest result remains UNKNOWN/STOP.

## Boundary table

| Question | Recovered rule | Still OPEN / not evidenced |
|---|---|---|
| Who can initiate recovery? | Only a path authorized by a previously established governing basis; recovery cannot self-authorize. | Concrete authority-bearing input and its protected establishment path. |
| What can recovery restore? | Only capabilities and scope bounded by the governing rules; no silent authority amplification. | Exact recoverable state, scope and limits. |
| How is stale authority rejected? | Revocation/currentness, dependency versions, predecessor continuity and current fence must be checked at the protected boundary. | Canonical state owner, offline staleness policy and enforceable runtime boundary. |
| What if the recovery commit response is lost? | Result is UNKNOWN until authoritative state is reconciled. | Concrete storage/transaction semantics in Nexo target runtime. |
| Who is successor? | No present successor can be inferred from family relation or possession. | Any future successor, trigger, evidence, approvals, exclusivity and transfer/release procedure. No successor selected here. |
| What if roots conflict or quorum is unavailable? | Preserve conflict and STOP/QUARANTINE; do not choose by timestamp or weaken threshold implicitly. | Governed dispute resolution or pre-authorized emergency path. |
| What if all recovery references are lost? | No cryptographic reconstruction of original owner legitimacy from nothing. | Whether the owner accepts any concrete recovery arrangement; none is ratified here. |
| What proves recovery works in deployment? | Design documents and injected tests are not runtime proof. | Actual authority source, protected state owner, final sink, bypass inventory and execution evidence. |

## Candidate sequence for future specification (not operative)

`DETECT / REQUEST` → `ESTABLISH RECOVERY AUTHORITY` → `CAPTURE DEPENDENCY + FENCE STATE` → `VALIDATE SCOPE AND CURRENTNESS` → `CONDITIONAL PROTECTED ACTIVATION` → `RECONCILE AUTHORITATIVE RESULT` → `SEPARATE REAUTHORIZATION` → `SEPARATE SUCCESSOR RELEASE, IF GOVERNED`.

This is a conceptual ordering distilled from existing evidence, not a new state machine or implemented workflow. Each step lacks commissioning-grade proof today. No transition may be inferred merely because an earlier step completed.

## Adversarial checks required before any implementation proposal

- Recovery artifact signed by a revoked key.
- Recovery authority depends on the compromised root it is replacing.
- Valid old snapshot restores a pre-revocation generation.
- Dependency changes between final validation and commit.
- Commit succeeds but acknowledgment is lost.
- Two recovery branches claim the same governance generation.
- Emergency path lowers the normal threshold or renews itself.
- Reconciliation completes while authority remains revoked.
- Successor identity is known but transfer exclusivity/currentness is not.
- STOP reaches one device but a stale incarnation or provider still accepts work.
- All independent recovery references are lost.

These checks reuse existing research boundaries; they are not claimed to have been executed against runtime code.

## Disposition

The crosswalk clarifies which recovery/succession rules are already recovered and which decisions or implementation proofs are absent. It does not select a hardware root, handwritten reference, successor, quorum, recovery mechanism or staleness window.

No source code/tests changed or ran. No keys, signatures, commissioning digest, Constitution freeze, device configuration, deployment or runtime authority changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
