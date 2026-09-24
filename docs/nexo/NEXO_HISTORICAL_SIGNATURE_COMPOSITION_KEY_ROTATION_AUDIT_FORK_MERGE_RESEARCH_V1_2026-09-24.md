# NEXO HISTORICAL SIGNATURE COMPOSITION KEY ROTATION AUDIT FORK MERGE RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. NO V21 IMPLEMENTATION. NO CORRECTNESS CLAIM.

## Target
Determine whether signatures from different historical generations, audit forks, and privacy-minimized residues can accidentally compose into a current authorization that was never jointly authorized.

## External cross-check
Threshold signature schemes can establish that a threshold of key-share holders participated under cryptographic assumptions, but application logic still determines what the threshold means. RFC 9591 explicitly describes threshold cooperation and its participant-corruption assumptions; threshold approval is not by itself a semantic authorization contract. A current IETF draft on multi-party authorization likewise distinguishes approval evidence from complete authorization. TLA+ refinement provides a future route to connect this semantic contract to implementation models. Sources: RFC 9591, IETF EP-QUORUM draft, Lamport TLA+ material.
Sources:
- https://datatracker.ietf.org/doc/html/rfc9591
- https://www.ietf.org/ietf-ftp/internet-drafts/draft-schrock-ep-quorum-04.html
- https://lamport.azurewebsites.net/tla/proving-safety.pdf

## Core separations
THRESHOLD_VALIDITY != CURRENT_AUTHORITY.
SIGNER_SET_VALIDITY != JOINT_AUTHORIZATION.
SIGNATURE_AGGREGATION != AUTHORITY_COMPOSITION.
HISTORICAL_QUORUM != CURRENT_QUORUM.
KEY_GENERATION_CONTINUITY != AUTHORITY_CONTINUITY.
AUDIT_MERGE != GOVERNANCE_MERGE.
PROVENANCE_MERGE != AUTHORIZATION_MERGE.
VALID_PARTIALS != VALID_COMPOSITE_AUTHORIZATION.

## Main counterexample
Generation G0 has quorum policy P0.
A signs transition T under P0.
B signs a related transition T under P0, but in a separate audit branch.
Later G1 replaces P0 with P1.
C signs a continuation under P1.
Privacy compaction retains A, B, C residues but removes raw context explaining that A and B were never in the same authorization transaction.
Audit branches are merged.

A naive merger sees:
A valid + B valid + C valid + threshold >= required
and constructs a current authorization.

But no authority ever jointly authorized A+B+C.

Therefore:
VALID(A) + VALID(B) + VALID(C) != JOINT_AUTHORIZATION(A,B,C).

## Composition requires an explicit contract
Candidate CompositionContract:
- composition_id
- target transition/effect
- required policy generation
- membership generation
- root generation
- allowed signer roles
- required threshold
- signer distinctness
- temporal/causal relation
- same-transaction identifier
- context digest
- predecessor/successor relation
- authority epoch
- key generations
- revocation state
- failure-domain/common-mode closure
- ordering domain
- permitted composition operator
- invalidation triggers.

A signature is composable only if the contract says the signatures belong to the same authorization context.

## Fork/merge attack
Audit fork A and audit fork B each record legitimate events.
Each branch compacts independently.
Merge later combines records.

The merge must not infer that:
branch-local order + branch-local validity = one global order.

Candidate:
MERGE_CONTEXT requires:
- branch identities
- branch generation
- fork boundary
- common ancestor/order
- conflicting transition set
- root/membership context
- capability lineage
- effect identity
- UNKNOWN set
- dependency closure
- reconciliation generation.

If global order is unknown, the merged state remains partially ordered or UNKNOWN.

## Key rotation attack
G0 uses key set K0.
G1 uses K1.
A K0 signature and C K1 signature may be part of one legitimate transition only if an explicit key-rotation/continuation contract says so.

Key rotation alone does not imply authority continuity.
A valid K0 signature cannot authorize an action whose admission requires K1 unless compatibility is proven.

Candidate KeyContinuityContract:
- predecessor key generation
- successor key generation
- transition id
- cutoff order
- overlap rules
- permitted historical use
- permitted current use
- dependent certificate closure
- compromise/revocation state
- resource/effect scope.

## Threshold composition attack
Threshold signatures can reduce a set of approvals to one cryptographic object, but the semantic policy still has to define signer membership, threshold, context, and assumptions. RFC 9591's security assumptions include limits on corrupted participants; therefore a threshold object cannot erase the underlying fault model.

NEXO rule:
THRESHOLD_CERTIFICATE -> PROVES PARTICIPATION UNDER CONTRACT
not
THRESHOLD_CERTIFICATE -> PROVES CURRENT_AUTHORITY.

## Mixed-generation quorum
Suppose:
A approves under G0/M0/P0.
B approves under G1/M1/P1.
A+B numerically meet threshold.

Unless a protected transition contract explicitly permits cross-generation composition, the result is:
MIXED_GENERATION_UNAUTHORIZED.

No automatic union.

## Historical residue composition
Residues can support historical claims, but their combination cannot create a stronger claim than the intersection of their permitted contexts.

Candidate composition rule:
COMPOSED_CLAIM_SCOPE <= intersection/contractually-composed verified scope of inputs.

If one input only supports historical attribution and another supports current authorization, their union does not automatically produce current authorization.

## Privacy deletion interaction
Raw records may have been deleted.
A residue retains digest, signer generation, order position, policy generation and transition id.

If the residue cannot establish same-transaction membership or causal relation, the stronger composite claim is unavailable.

Do not reconstruct missing joint context from matching hashes alone.

## Audit replay
Replay of A and B into a new process must preserve:
- event identity
- branch identity
- original order context
- original authority context
- key generation
- policy generation
- transaction identity.

Replay is not re-execution.

## Revocation interaction
If K0 is revoked after signing:
- historical provenance may remain valid for its permitted historical interval;
- current authorization derived from K0 must be revalidated;
- dependent current certificates may invalidate or degrade;
- K0 history cannot be used to bootstrap K1 authority.

## Late evidence
After merge, evidence E arrives showing A and B were generated in incompatible contexts.

Required:
LATE_EVIDENCE -> BIND_TO_BRANCH/GENERATION -> CHECK_COMPOSITION -> INVALIDATE_OR_DOWNGRADE_COMPOSITE_CLAIMS -> RECOMPUTE_CURRENT_AUTHORITY.

Late evidence can invalidate a composite claim even if every original signature remains cryptographically valid.

## Candidate object: AuthorizationCompositionCertificate
Binds:
- composite_id
- target operation/effect
- input authorization artifacts
- exact composition contract
- common transaction/context id
- root/membership generations
- authority epoch
- key generations
- ordering relation
- branch merge generation
- dependency/common-mode closure
- resource/effect identity
- UNKNOWN set
- invalidation triggers
- permitted claim.

## Candidate object: BranchMergeCertificate
Binds:
- merge_id
- branches
- common ancestor
- branch ordering
- conflict closure
- root/membership context
- effect/capability lineage
- reconciliation generation
- UNKNOWN set
- permitted claim.

## Candidate invariants
AC-01 valid signatures cannot establish joint authorization without a composition contract.
AC-02 threshold validity cannot substitute for current authority.
AC-03 mixed generations cannot be composed unless explicitly permitted.
AC-04 key continuity cannot be inferred from numerical generation succession.
AC-05 audit merge cannot create global order from local branch order.
AC-06 historical residues cannot be upgraded by aggregation.
AC-07 replay cannot create new authority.
AC-08 late evidence can invalidate a previously composed claim.
AC-09 revocation of a predecessor key invalidates/degrades dependent current claims when required.
AC-10 branch merge must preserve UNKNOWN/conflicts.
AC-11 signer count cannot substitute for failure-domain independence.
AC-12 current authorization requires current policy, membership, root, authority epoch, scope, fence, and effect identity where applicable.
AC-13 a composite certificate cannot justify its own evidence deletion.
AC-14 privacy deletion cannot create stronger composition semantics than the retained residue supports.
AC-15 historical attribution and current authorization must remain non-coercible types.
AC-16 a threshold certificate proves only what its threshold policy and trust assumptions actually define.

## Major conclusion
The dangerous operation is not cryptographic signature verification; it is semantic composition.

Nexo therefore needs:
SIGNATURE VERIFICATION
-> CONTEXT BINDING
-> GENERATION COMPATIBILITY
-> TRANSACTION/CAUSAL COMPATIBILITY
-> MEMBERSHIP/POLICY COMPATIBILITY
-> DEPENDENCY/FAILURE-DOMAIN CLOSURE
-> EXPLICIT COMPOSITION CONTRACT
-> CURRENT AUTHORITY VALIDATION
-> EFFECT-SPECIFIC ADMISSION.

No automatic "union of valid approvals."

## Formalization target
Future model:
- multiple key generations
- threshold certificates
- separate audit branches
- fork/merge
- privacy residue
- revocation
- late evidence
- mixed-generation artifacts
- composition contracts
- current authorization
- effect identity
- protected ordering.

Primary property:
NO_COMPOSITION_OF_HISTORICAL_OR_PARTIAL_AUTHORIZATION_ARTIFACTS_MAY_CREATE_CURRENT_AUTHORITY_WITHOUT_A_PROTECTED_COMPOSITION_TRANSITION.

## Verification boundary
No SANY/TLC/TLAPS execution. No implementation refinement. No runtime/fault-injection result.

## Next attack
COMPOSITION CONTRACT + CROSS-PROTOCOL CONFUSION + SAME DIGEST DIFFERENT SEMANTICS + DOMAIN SEPARATION FAILURE + KEY/ROLE REUSE.

Question:
Can two artifacts with identical bytes or signatures mean different things in different protocol contexts, and can a generic verifier accidentally treat semantic equality as authority equality?
