# NCS M0 — OWNER RATIFICATION OF PROTECTED-ASSET PERIMETER FOR O7 / P07 (2026-11-27)

## Decision source

The repository owner expressly ratified this perimeter in the ChatGPT conversation on 2026-11-27, in response to the explicit question asking whether the proposed perimeter should be used as the basis for O7/P07 evaluation while keeping Nexo and Lúmina stores separate.

This record preserves the owner's decision. It does not claim a cryptographic signature or an external identity-verification process.

## Ratified perimeter

The following objects are within the protected-asset perimeter for the O7/P07 evaluation:

1. The primary Nexo Continuity file.
2. Locks and coordination objects associated with Continuity.
3. Temporary files and publication/replacement files associated with Continuity.
4. The relevant root directory and namespace in which those protected objects are resolved and manipulated.
5. Chronicle remains a separate store, but is protected against interference and collisions with the Continuity protected namespace.

## Nexo / Lúmina separation

- Nexo and Lúmina stores remain separate; this ratification does not merge their stores, identities, authority, or synchronization.
- Lúmina world-state is not automatically reclassified as a Nexo protected asset.
- Any capability by a Lúmina component, configurable alias, path, launcher, process, or other route to write to or affect the protected Continuity object/namespace remains in scope for O7 actor/capability analysis.
- The existence of a configurable route is to be evaluated as capability evidence; it must not be conflated with proof that the route was exercised in a particular runtime observation.

## Interpretation and limits

This ratification fixes the protected-asset perimeter used for O7/P07 evaluation. It does not by itself:

- ratify P07 V2.3 or any unratified P07 contract/proposal;
- select flock, fcntl, OFD locks, dirfd/openat2, markers, tombstones, epochs, journals, daemons, or another mechanism;
- establish that O7 or P09 is closed;
- prove implementation, enforcement, crash consistency, durability, or filesystem behavior;
- authorize code changes, tests, CI, runtime execution, Termux/POCO operations, commissioning, cleanup, readmission, or protected effects;
- change `authorization: NOT_EVALUATED`;
- lift any STOP condition or close NCS M0.

## State after ratification

- Protected-asset perimeter for O7/P07 evaluation: RATIFIED.
- Nexo/Lúmina store separation: PRESERVED.
- O7: UNKNOWN / OPEN.
- P09: OPEN / UNKNOWN within the declared universe; dynamic loaders and unidentified external consumers remain UNKNOWN.
- P07-C: UNKNOWN / BLOCKING.
- P05-C: RATIFIED as policy; P05 remains OPEN.
- E2/E3: PARTIAL / NOT CLOSED.
- NCS M0: INCOMPLETE.
- `authorization: NOT_EVALUATED`.
- Commissioning and protected effects: STOP.

## Required next evaluation steps

1. Reconcile the existing O7 inventory against this now-ratified perimeter; do not repeat already documented inventories absent new evidence.
2. For each known actor/capability, distinguish static capability, observed runtime use, and demonstrated enforcement/exclusion.
3. Keep P09 caller coverage separate from O7 writer/affector coverage.
4. Resolve the documented P07-C replacement-safe cleanup and P05 durable BLOCKED gaps without selecting a primitive by inference.
5. Preserve UNKNOWN-STOP wherever actor coverage, object identity, or enforcement remains unproven.

## Related evaluation

- [NCS_M0_O7_P07C_P05_TRACEABILITY_EVALUATION_2026-11-27.md](../BUILD/NCS_M0_O7_P07C_P05_TRACEABILITY_EVALUATION_2026-11-27.md)
- Evaluation commit: `20376a5d2791fa585d07ade44686246de333432e`
- Traceability branch: `ncs-m0-o7-p07c-traceability-2026-11-27`

## Change classification

Documentation-only owner-decision record. No source code, tests, workflows, CI configuration, device state, Termux state, stores, PR #110, or PR #111 were changed by this record.
