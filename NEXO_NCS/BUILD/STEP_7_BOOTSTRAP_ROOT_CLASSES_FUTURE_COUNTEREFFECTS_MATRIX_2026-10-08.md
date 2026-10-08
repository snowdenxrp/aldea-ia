# STEP 7 — Bootstrap Root Classes / Future Countereffects Matrix — 2026-10-08

Status: RESEARCH/ARCHITECTURE DECISION — ATTACK REQUIRED

## Classes evaluated
### A. Platform/hardware root
Can provide strong local bootstrap evidence and protect key material. Future risks: device/vendor lock-in, hardware replacement, portability, virtualization, recovery when device is unavailable, and false assumption that platform integrity equals constitutional authority.
Safe semantic role: integrity/attestation input to bootstrap, not automatically the whole Nexo authority.

### B. Independent external authority
Can provide a trust basis independent of the local Nexo runtime. Future risks: service/provider dependency, availability, jurisdiction/organizational coupling, network dependence, and external authority becoming a hidden permanent control plane.
Safe semantic role: bounded bootstrap/succession support under an explicit contract, not unrestricted mission authority.

### C. Human emergency authority
Can provide recovery/succession support when normal roots fail. Future risks: social-engineering risk, ambiguity, availability, over-broad manual authority, and accidental conversion of emergency power into permanent authority.
Safe semantic role: bounded recovery/safety transition only; never automatic unrestricted constitutional authority.

### D. Multiple roots / threshold composition
Can reduce dependence on one mechanism and improve recovery resilience. Future risks: common-mode dependency, falsely independent roots, complex composition semantics, quorum deadlock, and authority amplification if the composition algebra is underspecified.
Safe semantic role: only under explicit composition and independence contracts.

## Important conclusion
No single class is universally sufficient. The correct Core semantic boundary must support a governed composition without hard-coding one physical mechanism.

## Future-countereffect rule
Choose a concrete mechanism only after threat-model analysis establishes the required independence properties. A mechanism that is strongest today but makes hardware/provider replacement or clean recovery impossible is not accepted merely because bootstrap is easy.

## Current architectural preference
Keep the Core contract mechanism-neutral and define a separate governed bootstrap implementation boundary. Platform evidence, external authority, and bounded human recovery can contribute evidence according to explicit roles, but none may silently become the entire Constitution/Policy authority chain.

## Hard invariants
- `ROOT_TRUST != CURRENT_AUTHORITY`
- `INTEGRITY_EVIDENCE != CONSTITUTIONAL_AUTHORITY`
- `RECOVERY_AUTHORITY != MISSION_AUTHORITY`
- `MULTIPLE_SOURCES != INDEPENDENCE`
- `ROOT_SUCCESSOR != AUTOMATIC_CURRENT_ROOT`
- `AVAILABILITY != TRUST`
- `AUTHENTICITY != SEMANTIC_CORRECTNESS`
- `COMPOSITION != INDEPENDENCE`