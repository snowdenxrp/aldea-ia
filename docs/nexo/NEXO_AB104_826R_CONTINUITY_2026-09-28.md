# NEXO AB104.826R — I14/I15 redundancy attack + second-order search
Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Research cross-check
NIST states that fault detection in stateful systems can depend on the specific order of inputs and presents ordered t-way combinations and sequence covering as methods for covering relevant ordered interactions without exhaustive enumeration of every possible sequence. citeturn0search0turn0search9

Transactional-outbox/idempotent-consumer evidence also shows that relays may publish more than once and consumers therefore need explicit duplicate handling. citeturn0search12turn0search14

## I14 — provenance × authentication × authority
Predicates: authenticated source; provenance/delegation chain; current authority differs from provenance-derived authority; protected boundary evaluates authenticity and current authority/provenance separately.

Redundancy attack:
- W10 has authentication + obsolete incarnation + authority, but no independently represented provenance/delegation chain.
- W15 has authentication + obsolete incarnation + ACK ambiguity, but no provenance-chain evaluation.
- W6/W13 concern recovery/incarnation and retention, not provenance.

Result: I14 cannot currently be proven equivalent to an existing witness without collapsing provenance into authentication or authority. That collapse is not allowed by the current model.

Disposition: I14 = UNTESTED candidate. No W17 accepted yet.

## I15 — correction × retention expiry × reconciliation
Predicates: historical evidence exists; retention expires/becomes unavailable; later authoritative correction/reversal arrives; reconciliation must use the correction without treating missing evidence as proof of non-occurrence.

Redundancy attack:
- W13 lacks authoritative correction.
- W4 lacks retention expiry as a causal predecessor.
- W16 lacks retention expiry.

Result: no existing witness preserves all four predicates.

Disposition: I15 = UNTESTED candidate. New witness naming deferred until the next matrix-based attack.

## Second-order search
Candidate families examined semantically rather than by raw permutation:

- C1 provenance × recovery × authority — not promoted; recovery adds no demonstrated independent protected-boundary decision beyond I14.
- C2 liveness/deadline × external-effect uncertainty × reconciliation — pending; timeout alone does not imply authority revocation or effect absence.
- C3 correction × authority epoch × delayed operation — overlaps I9/I13 unless correction changes authority interpretation rather than data interpretation; insufficient evidence to promote.

Important result: no justification for blindly creating W17-W19. The audit must permit UNKNOWN/PENDING instead of manufacturing witnesses.

## Current interaction status
- I1-I8: FULL under current witness definitions.
- I9-I11: FULL after AB104.825R refinements, pending final equivalence audit.
- I12-I13: FULL provisional through W15/W16.
- I14: UNTESTED.
- I15: UNTESTED.
- C1-C3: PENDING / not mandatory.

## Coverage denominator
NOT FROZEN. The named ledger currently contains 15 candidate interactions, but this is not yet the final admissible-universe denominator because temporal admissibility and semantic equivalence/exclusion still require a final pass.

## Disposition
20 classes remain UNFROZEN.
W1-W16 remain retained provisionally.
No W17+ witness accepted by this revision.
No implementation. No formal verification. No universal completeness/security claim.

## Exact next action
AB104.827R: build the explicit I1-I15 coverage matrix containing required predicates, witness, temporal relation, protected boundary, observable outcome, and evidence condition. Then attack I14/I15 using the matrix rather than prose. If either survives, define the minimum new witness and only then update the universe count.

No deletion/overwrite. No silent witness mutation.
