# AB104.875R — credential rotation + authorization change audit
Date: 2026-09-29
Parent: AB104.874R
Mode: research/audit only

## Question
Does credential rotation combined with an authorization-policy change create an interaction independent of class 19 + class 9 + I19/I21?

## Fresh evidence
- Google Cloud Apigee documents that revoked OAuth tokens can remain accepted for up to 180 seconds because token verification is cached. This is direct evidence that token validity and current authorization/revocation state can diverge temporarily. citeturn0search1
- Google Cloud GKE documents staged credential rotation: new credentials are issued first, nodes are recreated, and old credentials are revoked only when rotation completes. This establishes an explicit transition/grace interval rather than an instantaneous identity replacement. citeturn0search2turn0search3
- Google Cloud service-account key rotation recommends creating a replacement, deploying it, disabling the old key, monitoring, then deleting it. Credential lifecycle and authorization therefore have separate transition states. citeturn0search8

## Attack
K1 is cryptographically valid and initially authorized for correction C1. Policy P1 then revokes/reduces K1 while K2/P2 becomes active. A delayed C1 arrives at a verifier whose cached authorization state still accepts K1, or at a verifier that correctly rejects K1. Meanwhile C2 under K2 may be accepted.

## Analysis
A. Stale authorization cache accepts K1 after policy revocation: stale authorization observation/control-plane propagation, within class 9 plus class 19, with I21 if ordering/freshness matters.
B. Verifier correctly rejects K1: current authorization failure does not prove C1 never existed or that its earlier effect was absent. I19 remains historical correction lineage.
C. K1 and K2 overlap during planned rotation: explicit transition contract; class 9 + class 19 with an authority-generation boundary, not a new class.
D. K1 is accepted under stale policy and mutates a resource after K2 authority superseded it: previously studied stale-authority/fencing family. Resource-side generation checking is the relevant protection; authentication success is insufficient.
E. C1 arrives after revocation but corrects an effect already committed under K1: revocation must not erase historical lineage. Current authorization governs new mutation permission while historical correction evidence remains separately reconciled.

## Key refinement
AUTHENTICATION_VALID != CURRENT_AUTHORITY
CURRENT_AUTHORITY != HISTORICAL_EFFECT_LINEAGE
A valid signature/token proves source authenticity under its verification contract. It does not establish current authorization after policy change, nor prove absence of a prior external effect.

## Disposition
No new top-level interaction class frozen.
The scenario reduces to class 9 + class 19 + I19/I21, with I17/I18/I22 and class 12 as applicable.
The stale-cache case strengthens the empirical basis for separating authentication from current authority, but does not create a new top-level class.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

## Candidate invariants
INV-TE-61: Authentication success must not imply current authorization when authorization state can change independently.
INV-TE-62: Authorization revocation/fencing must have an explicit freshness/propagation contract.
INV-TE-63: Historical operation/correction lineage survives credential or authorization revocation.
INV-TE-64: A stale authorization cache must not be treated as authoritative current authority.
INV-TE-65: Authority-generation transitions and credential-generation transitions remain distinct dimensions.

## Next
AB104.876R — investigate authorization-cache staleness combined with failover/region migration: whether one region can retain old authorization while another has new policy, and whether this composes only class 9 + I18 + I21 or exposes a distinct cross-domain authority-consistency interaction.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED