# NCS Step 7 — Historical Cryptographic Root Decision Recovery
Date: 2026-10-08
Status: HISTORICAL EVIDENCE RECONCILIATION — NO ROOT SELECTED
Scope: Recover the prior answer from MASTER/AB research without repeating the already-closed root taxonomy or creating a new mechanism.

## Question
Did the earlier Nexo cryptography investigations already select a concrete, pre-existing genesis/recovery root or Path B recognition basis that can be reused for the current deployment?

## Result
**The architecture-level answer was already established; a concrete deployment root was not.**

The historical work established that current authority must have a non-circular trust path to an independently established or pre-established authority basis; recovered state, self-signed recovery, a valid signature, threshold count, DKG success, hardware key protection, or a root's own declaration cannot create that legitimacy. It also established that recovery authority must be bounded and distinct from ordinary mission authority, with explicit succession, anti-replay, revocation/currentness, generation fencing, and enforcement/reconciliation.

However, the reviewed historical documents explicitly left the physical/cryptographic root choice open:
- AB104.199 says the protected anchor could be a hardware-backed key, threshold key set, immutable genesis checkpoint, signed checkpoint on independent devices, or a combination, and explicitly says that choice remains an architecture decision.
- AB104.452 lists pre-established offline root, defined human/governance group, external hardware/institutional authority, and pre-committed recovery ceremony as candidate classes. It does not select one for the deployment.
- AB104.453 specifies the lifecycle and scope of an offline/pre-established recovery root but does not establish that such a root already exists for this deployment.
- AB104.446 establishes root enrollment/de-enrollment as protected authority transitions; no root may self-enroll.
- AB104.447–.455 establish that cryptographic threshold, governance threshold, independence threshold, and availability are separate. DKG/VSS/FROST do not authorize their own participant set or establish Nexo governance legitimacy.
- AB104.457 performed a source-level FROST DKG/refresh audit. It provides scoped implementation evidence about that external library, not evidence of a deployed Nexo participant set, authenticated participant enrollment, independently grounded recovery authority, or an activated Nexo root.
- NEXO_MASTER_ARCHITECTURE describes the Genesis Trust Bundle and first-boot sequence as architecture; it does not evidence a deployed Genesis Trust Bundle or a concrete commissioning authority for this deployment.
- The no-root disaster-recovery research explicitly concludes that if original authority, publisher, and recovery root are all unavailable, Nexo cannot safely manufacture current authority from recovered state.

## Why this felt already answered
The old investigations answered the design question: **the trust basis must be external/pre-established and non-circular, and recovery must be governed and fenced.** They also mapped the crypto and lifecycle controls in considerable detail. That can feel like the root choice was completed, but those documents repeatedly mark the actual root/credential/participant set as unselected or deployment-dependent.

## Current NCS implication
This is not a reason to invent a new root layer or repeat the taxonomy. Reuse the existing semantic contracts and invariants. Path B still requires one concrete, pre-existing artifact or relationship whose provenance, authority, freshness/currentness, and verifier can be independently established. The repository and historical docs inspected so far do not identify such a deployment artifact.

The current phone, Termux, repository identity, commit hashes, an e.firma possibility, a biometric capability, a FROST/DKG library, or a hypothetical threshold group cannot be promoted to Path B without evidence that the relevant trust relationship already exists and is independently recognized.

## Next exact action
Stop broad repository-only root searches unless new evidence points to a specific record. The remaining discriminating step is to identify whether a concrete pre-existing credential/root/recognition relationship actually exists outside the repository and can be independently verified. If none exists, Path B is unavailable for this deployment as presently evidenced; remain uncommissioned. Path A remains evaluation-only, with assumptions not accepted. No implementation, key generation/use, enrollment, ceremony, commissioning, activation, or production effects.

## Evidence links
- AB104.199: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/NEXO_AB104_199_TRUST_ANCHOR_CONTINUITY_ROOT_ROTATION_ATTACK_V1_2026-09-25.md
- AB104.446: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/AB104.446_ROOT_ENROLLMENT_DEENROLLMENT_RECOVERY_GOVERNANCE_2026-09-26.md
- AB104.452: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/AB104.452_EXTERNAL_RECOVERY_AUTHORITY_BOOTSTRAP_2026-09-27.md
- AB104.453: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/AB104.453_OFFLINE_RECOVERY_ROOT_SUCCESSION_2026-09-27.md
- AB104.454: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/AB104.454_THRESHOLD_RECOVERY_CUSTODY_COLLUSION_2026-09-27.md
- AB104.455: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/AB104.455_ACTIVE_ADAPTIVE_THRESHOLD_SETUP_2026-09-27.md
- AB104.457: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/AB104.457_FROST_SOURCE_LEVEL_DKG_REFRESH_AUDIT_2026-09-27.md
- No-root recovery: https://github.com/snowdenxrp/aldea-ia/blob/main/docs/nexo/NEXO_AUTHORITY_FOUNDATION_BOOTSTRAP_NO_ROOT_DISASTER_RECOVERY_RESEARCH_V1_2026-09-24.md
