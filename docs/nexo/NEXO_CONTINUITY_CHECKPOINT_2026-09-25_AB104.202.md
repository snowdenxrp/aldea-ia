# NEXO — CONTINUITY CHECKPOINT AB104.202
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

Research file:
docs/nexo/NEXO_AB104_202_ROLLBACK_RESISTANT_ANCHOR_MECHANISMS_V1_2026-09-25.md
Commit: d008c3b047027dd7ff150e59fdf6571b80473d3c

Evidence studied:
- Android Open Source Project KeyMint/attestation and file-based encryption: hardware-backed enforcement, attestation, StrongBox, rollback_resistance tag, verified boot dependencies.
- Apple Platform Security: Secure Enclave anti-replay values and secure non-volatile storage.
- NIST trust-anchor and platform-resiliency guidance.

Core findings:
1. Hardware-backed key storage is not automatically proof of a rollback-resistant Nexo freshness anchor.
2. Attestation can provide evidence about security level/properties, but does not by itself grant current-root authority.
3. Monotonic counter is only useful if the counter cannot be rolled back and its semantics/binding are defined.
4. TEE/secure-element storage is a candidate substrate, not a complete Nexo protocol.
5. External signed checkpoints survive local rollback but introduce availability and trust-root dependencies.
6. Multi-device quorum can provide external continuity/equivocation detection but introduces distributed coordination and partition problems.
7. A hybrid mechanism may eventually be appropriate, but NO mechanism is selected.

Important new distinction:
ROLLBACK RESISTANCE has two layers:
- storage rollback resistance: protected fact itself cannot be restored to an older value;
- authority rollback resistance: an old valid authority cannot become current again.
Both require protocol rules.

Clone/replacement:
A cloned mutable image can reproduce root/freshness/local keys. Local mutable counters do not solve cloning. Device-bound protected incarnation or external authority is required.
Legitimate replacement is different from cloning and needs an explicit authorized reincarnation/migration transition.

Anchor compromise:
If the protected anchor itself is compromised, ordinary signed history cannot repair it. Recovery must be defined outside the compromised state; exact mechanism remains OPEN.

Code study:
No verified implementation of hardware/TEE/secure-element rollback resistance was established in the canonical repo. No implementation/security guarantee is claimed.

Historical residuals AB50→AB58 remain unchanged:
TERNARY_MATH_GAP FOUND
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION UNKNOWN
EVENTDAG_CLOSURE PARTIAL
RECONSTRUCTION BOUNDED_ONLY
SEMANTIC_FREEZE NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED

DO-NOT-REPEAT:
- hardware-backed key != proven Nexo anti-rollback
- attestation != current authority
- monotonic counter != complete protocol
- multiple signatures != automatically secure quorum
- device identity != clone resistance without protected binding
- replacement != clone
- no premature mechanism selection
- no V21
- no unsupported formal/CI/fault-injection claims

EXACT NEXT ACTION — AB104.203:
Study multi-device continuity/authority:
1 quorum semantics;
2 equivocation/fork detection;
3 device add/remove/replace;
4 partitions/offline operation;
5 compromise thresholds;
6 root rotation across devices;
7 canonical single authority vs federated authority.

CONTINUITY:
Next CONTINUITY resumes directly at AB104.203. Preserve all UNKNOWN/PENDING and AB50→AB58 residuals; do not restart AB104.202.
