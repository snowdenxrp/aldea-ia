# STEP 7 — Commissioning Model Narrowing
Date: 2026-10-08
Status: Design candidate; not implemented.

## Result
Existing Master and NCS constraints support explicit owner-authorized commissioning as the preferred semantic source for further contract design. This does not select a technical mechanism or claim that a trust root exists.

## Constraints
- Nexo cannot establish its own legitimacy.
- Technical integrity evidence does not by itself establish constitutional authority.
- The commissioning act must bind to the exact Constitution and context.
- Model/provider output, local metadata, signatures, snapshots, or epochs alone do not create authority.
- If authority is unavailable and no pre-authorized succession rule applies, preserve evidence and block dependent protected transitions.
- Recovery cannot promote itself into ordinary constitutional authority.
- Migration requires an authorized continuity transition.

## Candidate mechanism families
Owner-authorized commissioning remains the semantic source. External provisioning, hardware assistance, previously protected local credentials, multi-custodian arrangements, or a hybrid may be evaluated only as technical/governance mechanisms under a concrete threat model. None is selected here. A threshold arrangement is not introduced without a specific need.

## Adversarial cases to carry into the contract
1. Candidate signs its own initial Constitution.
2. Model/provider reports approval without an independently bound act.
3. Approval is replayed against a substituted Constitution or scope.
4. Authority is unavailable and a recovery process tries to appoint itself.
5. Device/provider migration claims authority without an authorized continuity transition.
6. Two successor candidates have no authoritative ordering.
7. Hardware measurement is incorrectly promoted into constitutional legitimacy.
8. No recognized recovery path remains.

Expected rule: unresolved legitimacy, currentness, or ordering stays UNKNOWN and blocks transitions that depend on it; no implicit fallback.

## Next action
Define and attack the minimal Commissioning Binding Contract: exact authorized act, constitutional object/context, independently recognized basis, evidence, replay/substitution resistance, currentness/revocation, failure outcomes, and unavailable-authority behavior. Do not select a key, TPM, provider, or cryptographic protocol yet.

No implementation or formal/runtime verification is claimed.
