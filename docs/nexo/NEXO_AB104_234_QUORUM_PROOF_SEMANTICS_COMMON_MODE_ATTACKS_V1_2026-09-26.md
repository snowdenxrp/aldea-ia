# NEXO AB104.234 — QUORUM PROOF SEMANTICS AND COMMON-MODE ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
A quorum proof establishes only what its protocol semantics actually bind. A threshold count is not automatically proof of independence, freshness, canonicality, or absence of common-mode compromise.

## Threshold semantics
A valid quorum candidate should bind:
- exact statement digest;
- authority configuration/version;
- epoch;
- eligible signer identities;
- threshold rule;
- predecessor/root binding;
- freshness;
- revocation status;
- signer identity/incarnation where relevant.

TUF is a useful reference: Root metadata specifies trusted keys and the minimum signature threshold for roles. The threshold is part of an authenticated role configuration, not an arbitrary count chosen by the verifier. citeturn0search13

## Attacks
- Duplicate identity: repeated signatures from one logical signer must not count as multiple authorities.
- Cloned identity: different keys created from one compromised/cloned state can appear independent; key distinctness alone does not prove failure-domain independence.
- Configuration rollback: a historically valid configuration with an easier threshold must not become current merely because it verifies.
- Split-brain configurations: two configurations can each produce internally valid quorums; transition authority is required.
- Same signers, different statements: conflicting threshold-signed statements are equivocation/conflict, not a count-based winner.
- Root/key rotation: a new key is not current merely because it signs a higher version; transition needs authenticated predecessor binding.
- Freshness substitution: old valid quorum remains historical but cannot automatically authorize current decisions.
- Common backup: many records from one backup are one common failure domain, not independent observations.
- Common root: multiple signers under one compromised root can produce a formally valid quorum.
- Evidence laundering: several signed derived claims can still depend on one original observation.

## What quorum CAN establish
With a correctly defined protocol and trusted dependencies, quorum evidence can establish that an eligible signer set under configuration C and threshold T jointly attested statement D in epoch E.

It does NOT automatically establish:
- statement truth;
- external effect occurrence;
- current authority when freshness/transition is unresolved;
- signer independence;
- absence of a conflicting branch;
- anti-rollback;
- target-side commit;
- non-equivocation unless the protocol has a mechanism for detecting/enforcing it.

SCITT separates signed statements from receipts: a receipt demonstrates registration/inclusion in a verifiable data structure, while transparency provides auditability; this does not make the issuer truthful. RFC 9943 retains this distinction. citeturn0search12turn0search11

SCITT also requires non-equivocation/consistency for the transparency service so relying parties can verify proofs derive from one consistent sequence. citeturn0search26turn0search5

## Dependency graph
TRUSTED ROOT
-> CURRENT CONFIGURATION
-> ELIGIBLE SIGNER SET
-> THRESHOLD RULE
-> SIGNATURES
-> COMMON STATEMENT DIGEST
-> PREDECESSOR/ROOT BINDING
-> FRESHNESS
-> REVOCATION/CONFLICT CHECK
-> QUORUM CLAIM

Independence must be evaluated across this graph. If every signer depends on one compromised root, the graph has a common-mode root even though leaf signatures differ.

## Important distinction
N signatures is a cardinality fact.
N independent authorities is a security claim.
The second requires additional evidence/policy.

## Split-brain rule
Two valid quorum proofs for incompatible statements under the same authority epoch/configuration must produce CONFLICTING_AUTHORITY, not a winner based on larger quorum.

## Configuration transition
A safe reconfiguration candidate binds old configuration -> transition authority -> new configuration and establishes overlap/finality semantics preventing simultaneous independent canonical configurations.

Raft joint consensus is useful evidence for this invariant, but Nexo has not selected Raft or any consensus protocol. citeturn0search10

## Current prototype
No quorum-proof, authority configuration, signer eligibility or split-brain arbitration mechanism was demonstrated in the inspected Nexo prototype. No implementation added.

## AB50→AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- threshold count != independence
- distinct keys != independent failure domains
- valid old quorum != current authority
- quorum != truth of statement
- quorum != external effect commit
- receipt/inclusion != statement truth
- same threshold on conflicting statements != winner
- deterministic tie-break != authority
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.235: investigate quorum equivocation detection and proof of non-equivocation — double-sign evidence, witness/auditor roles, signed checkpoints, conflicting receipts, fork accountability, recovery after detected equivocation, and whether detection can be separated from current authority without rewriting history.