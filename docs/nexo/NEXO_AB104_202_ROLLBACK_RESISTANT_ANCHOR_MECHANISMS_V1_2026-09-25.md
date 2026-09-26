# NEXO — AB104.202 ROLLBACK-RESISTANT ANCHOR MECHANISMS V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Study concrete mechanisms for the protected freshness anchor identified in AB104.201, without selecting an implementation.

## External evidence

### Android KeyMint / StrongBox
AOSP documents hardware-backed key storage and attestation. KeyMint attestation exposes whether authorization is hardware-enforced, and includes a ROLLBACK_RESISTANCE authorization tag. StrongBox is described as a secure element-like implementation with stronger resistance to remote and physical compromise than a normal TEE. AOSP also ties some storage protections to verified boot and hardware roots of trust.
Source: Android Open Source Project, Key and ID attestation; File-based encryption.

Important limitation for Nexo:
"hardware-backed" is not itself a proof of anti-rollback. The remote verifier needs evidence about the security level and enforced properties. A device saying it has a hardware key is not equivalent to proving that an arbitrary Nexo freshness counter is rollback-resistant.

### Apple Secure Enclave / anti-replay
Apple Platform Security documents Secure Enclave-controlled anti-replay values and secure non-volatile storage used for anti-replay services. It also documents monotonic counters in earlier mechanisms and later Secure Enclave anti-replay values.
This is evidence that mature platforms put anti-replay state below ordinary mutable OS storage.

Important limitation:
The platform's anti-replay primitive is tied to the platform's own security model. Nexo cannot assume equivalent guarantees on arbitrary hardware or treat an OS API name as proof.

### NIST hardware roots of trust
NIST SP 800-193 describes hardware roots of trust and platform resiliency as mechanisms for protecting, detecting unauthorized change, and recovering from attacks. NIST trust-anchor guidance also establishes that the ultimate trust anchor is authoritative rather than derived from the mutable history it validates.

## Mechanism comparison

### A. Ordinary database transaction / WAL
Provides crash atomicity and recovery semantics.
Does NOT inherently provide anti-rollback against restoring an older complete database.
Status for freshness anchor: insufficient alone.

### B. Monotonic counter
Potentially detects rollback if the counter cannot itself be rolled back.
Needs:
- protected storage;
- defined increment/read semantics;
- crash behavior;
- exhaustion behavior;
- binding to scope/identity;
- recovery after device replacement.
Status: promising primitive, not sufficient as a complete Nexo protocol.

### C. TEE-backed storage
Can isolate key material and policy from the normal OS.
Needs attestation or an independently trusted statement about the TEE/security level.
A compromised TEE remains a trust-root failure.
Status: candidate trust substrate, not complete protocol.

### D. Secure element / hardware anti-replay primitive
Can keep state outside ordinary flash and may provide anti-replay semantics.
Still needs:
- binding between secure-element state and Nexo root digest/epoch;
- provisioning and replacement rules;
- recovery when the secure element is lost;
- device clone semantics.
Status: strong candidate, exact API/guarantee OPEN.

### E. External signed checkpoint
A separate authority can establish freshness independently of the mutable device.
Advantages: survives local storage rollback.
Costs: availability, key management, trust-root compromise and potentially network dependency.
Status: candidate external continuity mechanism.

### F. Multi-device quorum
Several independently protected devices can witness a root transition.
Can detect equivocation if identities and epochs are correctly bound.
Costs: distributed coordination, partitions, availability, device replacement and quorum recovery.
Status: candidate, not automatically secure by having multiple signatures.

### G. Hybrid anchor
A plausible architecture may combine hardware/device-local anti-rollback with an external or multi-device checkpoint.
No selection is made yet.

## New distinction: rollback resistance has two layers
1. STORAGE rollback resistance: can the protected fact itself be restored to an older value?
2. AUTHORITY rollback resistance: can an old but valid authority become current again?

A monotonic counter can help with the first while a root-transition grammar/epoch policy is still required for the second.

## Clone attack
If a device image contains:
root R7 + freshness E7 + valid local keys,
cloning the entire image gives another device the same apparent history.
A local counter cloned as part of mutable state does not solve this.
Possible defenses require device-bound hardware identity/incarnation, protected per-device state, external authority, or quorum. The exact identity model remains OPEN.

## Device replacement
Replacement creates the opposite problem: legitimate migration must not be mistaken for cloning.
Therefore the future protocol needs an explicit replacement/reincarnation transition authorized by the current authority, with evidence binding old and new device identities/incarnations.
No protocol chosen yet.

## Anchor compromise
If the protected anchor itself is compromised, ordinary signed history cannot repair the trust root.
A recovery grammar must exist outside the compromised state, potentially involving independent root authority, quorum, out-of-band recovery, or a pinned bootstrap trust root.
Status: OPEN.

## Repository/code study
Canonical repo: snowdenxrp/aldea-ia / main.
Current study did not establish a verified implementation of hardware/TEE/secure-element rollback resistance in Nexo. No implementation claim is made. Planned concepts and documentation are not evidence of runtime guarantees.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Hardware-backed key != proven rollback-resistant Nexo anchor.
- Attestation != automatic authorization to become current root.
- Monotonic counter != complete root-transition protocol.
- Multiple signatures != automatically a secure quorum.
- Device identity != clone resistance unless identity is protected and bound to authority.
- Replacement != clone; legitimate migration needs an explicit transition.
- Do not choose hardware/TEE/quorum mechanism prematurely.
- No V21.
- No unsupported formal verification/CI/fault-injection claims.

## EXACT NEXT ACTION — AB104.203
Study multi-device continuity and authority:
1. quorum semantics;
2. equivocation/fork detection;
3. device addition/removal/replacement;
4. network partitions and offline operation;
5. quorum compromise thresholds;
6. root rotation across devices;
7. whether Nexo needs a single canonical authority or an explicitly federated authority model.

Status: research-only.
