# NEXO GLOBAL AUDIT-058 — KEY / CREDENTIAL LIFECYCLE REVOCATION BOUNDARY
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack credential lifecycle semantics: rotation versus identity continuity; compromised-key revocation; replacement keys and overlap; key revocation versus subject revocation; delegated credentials; threshold/key-set changes; stale keys after epoch transition; recovery; common-mode key registries and trust roots.

## External evidence
RFC 5280 distinguishes certificate validity from revocation and identifies revocation reasons including keyCompromise, superseded, affiliationChanged and privilegeWithdrawn. It binds a certificate to a subject and public key and defines key-usage restrictions. This supports separating credential state, subject identity and permitted authority. citeturn0search0

RFC 10007, published June 2026, updates RFC 5280 with an explicit CRL-issuer keyUsage validation requirement, illustrating that a signed revocation structure has additional semantic validation dependencies. citeturn0search8

W3C PROV models provenance around entities, activities and agents and provides validity/constraint machinery for consistent histories; provenance itself can require provenance. citeturn0search1turn0search2turn0search7

## Findings

### A — rotation != identity continuity
K1 replaced by K2 can mean same subject with rotated credential, new incarnation, emergency replacement, delegated-authority transfer, or authority-set change. Key material alone cannot select the semantic case.

### B — key revocation != subject revocation
Revoking K1 may disable that credential, invalidate derived certificates, withdraw a delegated authority, or revoke the subject. These are different scopes. RFC 5280's distinct revocation reasons reinforce that revocation is not one undifferentiated operation. citeturn0search0

### C — compromise
Replacing a compromised K1 with K2 does not by itself prove that historical signatures are invalid, prior delegated authority is invalid, K2 inherits all K1 authority, or K2 belongs to the same subject.

### D — overlap
K1 and K2 can overlap in validity without being equivalent or having identical scope. Validity interval, purpose, scope, epoch and delegation must be evaluated separately.

### E — stale credentials
A credential valid in E1 may remain cryptographically valid but be semantically inadmissible in E2. Cryptographic validity != current authorization.

### F — delegation
A delegated credential inherits only authority actually delegated. Parent revocation may affect children depending on delegation semantics and interval; revoking one child must not automatically revoke unrelated siblings. Delegation chains enter the evidence dependency graph.

### G — threshold/key-set changes
Changing threshold or membership changes authorization semantics. Old signatures cannot automatically be interpreted under the new set without an explicit epoch transition rule.

### H — recovery
Recovery can accidentally restore revoked authority by restoring an old key, old key-set snapshot, reused identifier, or pre-revocation checkpoint. Recovery requires provenance-bound reconstruction and explicit revocation inheritance semantics.

### I — common-mode infrastructure
If issuance, revocation, rotation and recovery depend on one key registry/root, stale or corrupted state there can affect apparently independent evidence. The registry/root therefore becomes a possible common-mode dependency.

### J — key identifiers
Stable KeyID does not prove continuous key material. Reusing KeyID can create false continuity; changing KeyID can still represent ordinary rotation. Candidate distinction: SubjectID + CredentialID + KeyMaterialIdentity + KeyEpoch/Incarnation.

### K — historical signatures
Later key compromise does not automatically invalidate earlier signatures. A historical signature may remain cryptographically valid while authorization is later revoked. Signature validity != authorization validity.

### L — delegated recovery
Recovery authority cannot safely restore credentials merely by overwriting state. Restoration must carry target, scope, authority, epoch, effective interval and provenance. Recovery != erase revocation history.

### M — unresolved lifecycle boundary
A deterministic current-authorization projection requires, at minimum: SubjectIdentity, CredentialIdentity, KeyMaterialIdentity, AuthorityEpoch, Scope, EffectiveInterval, DelegationClosure, KeySet/ThresholdState, RevocationState, Recovery/RestorationHistory and ProvenanceClosure. If any claim-relevant transition remains unresolved, affected authorization remains UNKNOWN.

## Key distinctions
KEY ROTATION != IDENTITY TRANSITION
KEY REVOCATION != SUBJECT REVOCATION
CRYPTOGRAPHIC VALIDITY != CURRENT AUTHORIZATION
KEY IDENTITY != KEY MATERIAL IDENTITY
OVERLAP != EQUIVALENCE
DELEGATION != UNBOUNDED INHERITANCE
PARENT REVOCATION != AUTOMATIC UNIVERSAL INVALIDATION
THRESHOLD CHANGE != SIMPLE KEY ROTATION
RECOVERY != ERASE
HISTORICAL SIGNATURE VALIDITY != CURRENT AUTHORIZATION
SIGNED REVOCATION != COMPLETE REVOCATION SEMANTICS
DETERMINISTIC KEY RESOLUTION != PROVEN AUTHORITY

## Result
FOUND:
- credential lifecycle needs distinct semantics for key, subject, authority and epoch;
- compromise/revocation does not automatically define historical-signature semantics;
- rotation does not prove identity continuity;
- delegation creates dependency chains and scoped propagation;
- threshold/key-set changes require explicit epoch semantics;
- recovery can reopen revoked authority if reconstruction is not revocation-aware;
- key registries/trust roots can become common-mode dependencies.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete credential/authority algebra; complete delegation propagation semantics; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

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

## Next exact mission — GLOBAL-AUDIT-059
Attack delegation and authority inheritance:
parent/child delegation scope; attenuation and non-escalation; delegation depth; delegated credential revocation; parent revocation versus child historical validity; authority transfer versus delegation; emergency delegation; cyclic delegation; delegation reconstruction after retention loss; common-mode delegation roots.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
