# NEXO GLOBAL AUDIT-057 — IDENTITY / INCARNATION AT REVOCATION BOUNDARY
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective

Attack identity and incarnation semantics:
- stable identity versus historical incarnation;
- aliases, re-keying and key rotation;
- resource reincarnation;
- scope inheritance across incarnation changes;
- revocation before/after reincarnation;
- restoration after reincarnation;
- identity-resolution failure;
- common-mode identity registries.

## External evidence

W3C PROV explicitly models changing real-world resources using distinct entities with their own identifiers and lifetimes, linked through relations such as specializationOf and alternateOf. It also warns that attributes do not necessarily uniquely identify an entity and that different identifiers may refer to different aspects or versions. citeturn0search0turn0search1

PROV-JSON further leaves merging of equivalent identifiers to the consuming application rather than silently assuming identifier equality implies record identity. citeturn0search6

## A — stable identity != incarnation

A logical subject S may have incarnations i1 and i2.

R1 revokes i1.
If i2 is a new incarnation, R1 must not automatically revoke i2.

Conversely, if the authority contract explicitly defines revocation over stable identity S, R1 may span incarnations.

Therefore revocation target semantics must distinguish:
StableIdentity, Incarnation, Scope, EffectiveInterval.

## B — re-keying

A key rotation can mean:
1. same logical subject, new credential;
2. new incarnation;
3. replacement authority;
4. compromise recovery.

Cryptographic continuity alone does not determine which semantic case applies.

A resolver must use an authoritative key-transition/identity contract.

## C — aliases

Alias A -> S does not by itself prove:
A == S,
nor that all historical incarnations of S are represented by A.

Alias resolution is evidence-bearing.

If two registries disagree on alias mapping, claim-relevant identity resolution becomes UNKNOWN unless an authoritative precedence rule exists.

## D — resource reincarnation

A resource identifier may be reused after destruction or invalidation.

R1 revokes resource incarnation i1.
Later i2 is created under the same visible identifier.

Identifier equality alone must not transfer R1 to i2.

Candidate identity tuple:
LogicalSubjectID + ResourceID + IncarnationID + AuthorityEpoch.

## E — revocation before reincarnation

R1 is issued against i1 before i2 exists.

It cannot be assumed to cover i2 unless the revocation contract is explicitly identity-wide or future-incarnation scoped.

Thus:
REVOCATION-OF-i1 != REVOCATION-OF-FUTURE-i2.

## F — revocation after reincarnation

R2 arrives after i2 exists but claims a historical interval concerning i1.

Arrival after i2 does not change R2's target.

The resolver needs event semantics and target binding to avoid retroactively applying R2 to i2.

## G — restoration after reincarnation

Restoration of i1 must not silently restore i2.

Likewise restoration of i2 must not erase a valid revocation of i1.

Historical incarnations require separate state projections unless an explicit inheritance rule exists.

## H — identity-resolution UNKNOWN

If an operation targets alias A and the system cannot establish whether A denotes S/i1 or S/i2, the affected claim cannot safely be resolved.

Candidate:
UNRESOLVED IDENTITY BOUNDARY => UNKNOWN for affected scope.

Do not substitute "best matching" identity merely to obtain deterministic output.

## I — common-mode identity registry

If revocation, restoration and conflict resolution all depend on one identity registry, corruption or stale state in that registry can affect every supposedly independent decision.

Therefore the identity registry becomes part of the evidence dependency graph and potentially a common-mode root.

## J — authority epoch versus incarnation

Authority epoch and source/resource incarnation are independent dimensions.

An authority may remain valid while a resource reincarnates.
A resource may remain the same incarnation while authority changes.

Collapsing them into one version counter can hide real distinctions.

## K — alias collision

Two aliases may point to different incarnations, or two logical subjects may temporarily share an alias due to registry error.

If the resolver merges them before provenance is established, it can manufacture both false revocations and false restorations.

Candidate:
ALIAS EQUALITY != SUBJECT EQUALITY != INCARNATION EQUALITY.

## L — scope inheritance

A scope attached to i1 may or may not inherit to i2.

Inheritance must be explicit and claim-relative.

Examples:
- credential-specific scope: likely incarnation-bound;
- logical-account scope: potentially identity-wide;
- resource-path scope: may follow a namespace but not an individual resource incarnation.

These are examples of semantic categories, not frozen Nexo rules.

## M — minimum identity boundary

For deterministic revocation projection:
TargetLogicalIdentity
+ TargetResource
+ TargetIncarnation
+ Scope
+ AuthorityEpoch
+ EffectiveInterval
+ IdentityResolutionProvenance
+ Transition/InheritanceRule
must be established.

If any claim-relevant mapping remains UNKNOWN, affected projection remains UNKNOWN.

## Key distinctions

STABLE IDENTITY != INCARNATION
IDENTIFIER EQUALITY != ENTITY EQUALITY
ALIAS != PROOF OF IDENTITY
RE-KEY != AUTOMATIC REINCARNATION
AUTHORITY EPOCH != RESOURCE INCARNATION
REVOCATION OF i1 != REVOCATION OF i2
RESTORATION OF i1 != RESTORATION OF i2
ALIAS EQUALITY != INCARNATION EQUALITY
IDENTITY REGISTRY != INDEPENDENT EVIDENCE
DETERMINISTIC IDENTITY MATCH != PROVEN IDENTITY

## Result

FOUND:
- historical incarnations require distinct semantic treatment;
- identifier reuse can otherwise create false revocation transfer;
- re-keying requires explicit transition semantics;
- alias resolution is evidence-bearing;
- conflicting identity registries can force UNKNOWN;
- resource reincarnation must be distinguished from authority epoch;
- revocation/restoration should bind historical incarnation unless explicit inheritance exists;
- identity infrastructure can become a common-mode dependency.

NOT CLOSED:
- FutureObs_PAA;
- P_AA quotient congruence;
- complete identity/incarnation algebra;
- complete scope inheritance semantics;
- R1-R5 completeness/minimality;
- dependency/TCB/evidence reducer completeness;
- independence/quorum completeness;
- retention/reconstruction soundness.

NOT PERFORMED:
- implementation;
- formal verification;
- runtime/fault injection;
- V21;
- semantic freeze.

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

## Next exact mission — GLOBAL-AUDIT-058

Attack key/credential lifecycle semantics at the revocation boundary:
- credential rotation versus identity continuity;
- compromised-key revocation;
- replacement keys and overlap periods;
- key revocation versus subject revocation;
- delegated credentials and inherited authority;
- threshold/key-set changes;
- stale keys after epoch transition;
- recovery paths that accidentally restore revoked authority;
- common-mode key registries and trust roots.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
