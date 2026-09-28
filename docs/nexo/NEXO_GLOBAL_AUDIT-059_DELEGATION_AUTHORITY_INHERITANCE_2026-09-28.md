# NEXO GLOBAL AUDIT-059 — DELEGATION / AUTHORITY INHERITANCE REVOCATION BOUNDARY
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack parent/child delegation scope, attenuation/non-escalation, delegation depth, delegated revocation, parent revocation versus child historical validity, authority transfer versus delegation, emergency delegation, cycles, reconstruction after retention loss, and common-mode delegation roots.

## External evidence
W3C PROV models delegation as an agent acting on behalf of another in an activity and provides ordering/consistency constraints; it does not itself define a complete capability-authority algebra for Nexo. citeturn0search0

UCAN 1.0 explicitly separates delegation, invocation and revocation, and states that each direct delegation must restate or attenuate capabilities. Its delegation specification describes hierarchical authority and validity periods. This is directly useful as comparative evidence, not as a frozen Nexo design. citeturn0search1turn0search2

## Findings

### A — delegation != transfer
A delegates authority to B without necessarily transferring the underlying identity, credential, or root authority. Therefore:
DELEGATION != IDENTITY TRANSFER
DELEGATION != ROOT AUTHORITY TRANSFER.

### B — attenuation / non-escalation
A child delegation must not gain authority absent from its parent. UCAN explicitly requires direct delegations to restate or attenuate capabilities. citeturn0search1
However, “attenuation” is not sufficient by itself to define Nexo's complete semantic relation because resource identity, epochs, conditions and external evidence can affect authority.

### C — scope inheritance
A child may inherit only the intersection/allowed projection of parent authority and the child's explicit scope, but the exact operation is not frozen. Partial overlap, aliases, wildcard scopes and changing resource incarnations can make the relation UNKNOWN.

### D — parent revocation
Revoking parent P can affect descendants, but propagation depends on whether the child authority semantically depends on P at the relevant time and scope.
A historical child decision should not be erased merely because P is revoked later.

### E — child revocation
Revoking child C should not automatically revoke siblings or parent authority. Propagation must follow explicit dependency edges.

### F — delegation depth
A finite chain is not automatically semantically complete. A verifier must establish the root authority, every parent-child edge, validity interval, scope attenuation and relevant revocation state. Missing links force UNKNOWN rather than inferred authority.

### G — authority transfer
A transfer can change the controlling authority without creating a parent-child delegation chain. Treating transfer as delegation can fabricate inherited authority.

### H — emergency delegation
Emergency authority needs explicit issuer authority, scope, lifetime, epoch and termination/revocation semantics. “Emergency” is not itself precedence.

### I — cycles
A cyclic delegation graph cannot bootstrap authority from itself. If A delegates to B and B's admissibility depends on A, the cycle requires an external root; otherwise the authority boundary remains UNKNOWN.

### J — retention / reconstruction
If an intermediate delegation or revocation is lost from retained history, reconstructing a chain from current snapshots can produce a false continuous chain. Current state is not sufficient evidence of historical authority.

### K — common-mode roots
If issuance, delegation validation, revocation and identity resolution all depend on one registry/root, multiple resulting “proofs” may share the same failure mode. They are not automatically independent evidence.

### L — revocation propagation
A useful candidate relation is:
parent revocation -> descendant invalidation only where a claim's authorization dependency actually passes through the revoked parent authority, within the relevant scope, interval and epoch.
This is a candidate boundary, not a frozen protocol rule.

### M — delegation validity boundary
A current delegated authorization requires at minimum:
RootAuthority
+ DelegationChain
+ ParentChildScopeRelation
+ Attenuation/non-escalation evidence
+ Subject/credential incarnation
+ AuthorityEpoch
+ EffectiveInterval
+ RevocationClosure
+ IdentityResolution
+ ProvenanceClosure.
Unresolved claim-relevant input => UNKNOWN.

## Key distinctions
DELEGATION != TRANSFER
DELEGATED AUTHORITY != ROOT AUTHORITY
ATTENUATION != COMPLETE AUTHORITY SEMANTICS
PARENT REVOCATION != AUTOMATIC UNIVERSAL INVALIDATION
CHILD REVOCATION != SIBLING REVOCATION
FINITE CHAIN != COMPLETE CHAIN
EMERGENCY STATUS != PRECEDENCE
CURRENT SNAPSHOT != HISTORICAL AUTHORITY PROOF
CYCLIC SUPPORT != ROOT AUTHORITY
MULTIPLE PROOFS != INDEPENDENT ROOTS
DETERMINISTIC CHAIN RESOLUTION != PROVEN AUTHORITY

## Result
FOUND:
- delegation needs explicit scope and non-escalation semantics;
- parent/child revocation propagation is dependency- and scope-sensitive;
- delegation does not equal authority transfer;
- finite chain traversal does not prove semantic completeness;
- cycles cannot bootstrap authority;
- historical reconstruction needs retained delegation/revocation provenance;
- common-mode roots can invalidate apparent independence.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete delegation/authority algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

NOT PERFORMED:
implementation; formal verification; runtime/fault injection; V21; semantic freeze.

## Global epistemic state — preserve exactly
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-060
Attack delegation graph completeness and revocation propagation:
- hidden/missing parent edges;
- multiple delegation paths;
- convergent descendants;
- partial-chain evidence;
- cross-domain delegation;
- scope intersection/union under delegation;
- delegation graph cycles and near-cycles;
- revocation propagation across merged chains;
- reconstruction when one branch is missing;
- common-mode graph indexes.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
