# NEXO — AB104.205 BYZANTINE / EQUIVOCATION / QUORUM-EVIDENCE ATTACK V1
Date: 2026-09-26
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Attack the quorum itself: a member signs conflicting decisions, a threshold is partially compromised, peers see different histories, or a stale device returns. The objective is to determine the minimum evidence required to prove that a canonical decision is one coherent authority decision.

## External evidence

### RFC 9943 / SCITT transparency
The recent IETF SCITT architecture explicitly requires verifiable data structures to be append-only, non-equivocating, and replayable. It also separates a signed receipt from the consistency properties of the underlying structure. This is useful evidence that a signature/receipt proves an assertion, while a separate consistency mechanism is needed to prove that the authority did not maintain conflicting histories. citeturn0search1

### FROST threshold signatures
RFC 9591 defines a threshold signing protocol in which a signature requires cooperation from a configured threshold of participants. Its security model assumes the adversary corrupts fewer than the threshold number of signers. Therefore threshold signing can reduce single-key dependence, but once the threshold itself is compromised, cryptographic verification cannot distinguish an honestly authorized decision from a decision produced by the compromised threshold. citeturn0search2

### Distributed consistency
RFC 992 highlights that distributed systems need a consistent view of group state and that failure detection alone is insufficient for strong agreement. This reinforces that Nexo cannot treat reachability or local majority observations as proof of canonical authority. citeturn0search0

## Findings

### 1. A valid signature does not prove non-equivocation
If device D signs ROOT_A for peer X and ROOT_B for peer Y at the same authority epoch, both signatures may individually verify. The contradiction is a relation between statements, not a failure of either signature.

Therefore Nexo needs an equivocation evidence object that binds at least:
- signer/device identity and incarnation;
- authority scope;
- epoch/configuration;
- signed statement digest;
- conflicting statement digest;
- signatures and provenance for both;
- observation context.

### 2. Equivocation evidence must be durable
If the only evidence of equivocation lives in one volatile peer, a crash or rollback can erase the proof. Once independently verified, equivocation evidence should become part of the durable security history or an external transparency record.

### 3. One signer can be Byzantine without invalidating the entire quorum
A single conflicting signer does not automatically invalidate a quorum if the configured safety threshold tolerates that failure. But the signer must become ineligible according to the authority/revocation rules once the equivocation is proven.

The exact threshold depends on the chosen authority model and remains OPEN.

### 4. Threshold signature vs quorum certificate
A threshold signature compresses evidence that enough shares participated, but may hide which participants contributed unless the protocol preserves an auditable signer-set/proof. An individually signed quorum certificate is larger but can directly expose signer identities and conflicting signatures.

Neither representation alone solves authority correctness. The verifier still needs:
- correct configuration/epoch;
- signer eligibility at that epoch;
- threshold rule;
- statement binding;
- freshness;
- transition lineage;
- non-equivocation evidence where required.

### 5. A quorum certificate must bind one exact decision
A certificate that merely says “Q members approved” is insufficient.
It must bind a canonical digest of the exact proposal/transition, including predecessor state and authority epoch/configuration.

Otherwise signatures collected for different proposals could potentially be misassembled into a certificate that no coherent quorum actually approved.

Candidate predicate:
QC_VALID =
SIGNATURES_VALID
AND SIGNER_SET_ELIGIBLE
AND THRESHOLD_SATISFIED
AND SAME_STATEMENT_DIGEST
AND SAME_EPOCH
AND SAME_CONFIG
AND FRESHNESS_VALID
AND PREDECESSOR_BOUND
AND NO_REVOCATION_CONFLICT

This is a research predicate, not implemented code.

### 6. Compromised minority vs compromised threshold
If fewer than the tolerated Byzantine threshold are compromised, the protocol should preserve safety and quarantine/revoke the faulty participants when evidence arrives.

If the adversary controls enough authority to satisfy the canonical threshold, signatures alone no longer establish honest authorization. This becomes an authority-root compromise and requires the separate recovery mechanism identified in AB104.199–204.

### 7. Conflicting recovery authorities are not resolved by “more recent”
Suppose Recovery_A authorizes ROOT_A and Recovery_B authorizes ROOT_B for the same epoch/scope. If neither authority is demonstrably subordinate to the other, the correct result is CONFLICT/QUARANTINE, not timestamp selection.

### 8. Stale offline device
A device may return with a valid old key and a valid old quorum certificate. That proves historical authorization only. It does not restore current authority after a newer configuration/root has become effective.

The verifier must evaluate:
HISTORICALLY_VALID
vs
CURRENTLY_AUTHORIZED.

### 9. Minimum coherent-decision evidence
Research currently narrows the minimum conceptual evidence to:
1. authority scope;
2. configuration/epoch identifier;
3. predecessor digest;
4. exact decision digest;
5. freshness value;
6. signer identities/incarnations or an auditable threshold proof;
7. eligibility/revocation state for those signers;
8. quorum/threshold rule in force;
9. transition authorization;
10. evidence that conflicting same-epoch statements are absent or explicitly handled.

This does not require one physical record; the evidence may be distributed across a durable log, certificate and transparency/attestation mechanisms.

## New invariant

**QUORUM CERTIFICATE != CANONICAL AUTHORITY by itself.**

A quorum certificate becomes authority evidence only after the verifier establishes that the certificate was produced by the correct authority configuration, for one exact decision, at the correct epoch/freshness, by eligible participants, without an unresolved conflicting branch.

## Attack matrix

A. One member signs A and B at same epoch -> EQUIVOCATION evidence; quarantine/revoke according to policy.
B. A minority signs B while quorum signs A -> A may remain canonical; B retained as conflicting evidence.
C. Two different signer sets each satisfy threshold under disjoint configurations -> require configuration-transition proof; otherwise CONFLICT.
D. Threshold key itself compromised -> ordinary signature verification insufficient; invoke root recovery.
E. Stale offline device presents valid old QC -> HISTORICALLY_VALID, not current authority.
F. QC signatures verify but bind different payloads -> INVALID QC.
G. QC uses revoked signer after effective revocation -> INVALID for current authority.
H. Two recovery authorities authorize different roots -> QUARANTINE until an independent authority rule resolves them.
I. Equivocation evidence exists only in volatile memory -> not durable enough for permanent security state.

## Code/repository study
Canonical repository: snowdenxrp/aldea-ia / main. The latest inspected continuity checkpoint confirms AB104.204 was research-only and explicitly states that no verified Nexo quorum/reconfiguration implementation exists yet. fileciteturn35file0 Repository search for quorum/equivocation terms did not establish a verified implementation of these predicates. No implementation claim is made.

Future code audit must trace actual membership persistence, signer eligibility, certificate construction, verification, epoch/freshness checks, revocation, conflict handling and external-effect gates.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Signature validity != non-equivocation.
- Threshold signature != proof of honest authority after threshold compromise.
- Device count != independent authority count.
- Do not assemble a QC from signatures over different statements.
- Do not accept stale QCs as current authority.
- Do not silently select between conflicting recovery authorities.
- Do not erase equivocation evidence after revocation.
- Do not claim a quorum model is implemented because documentation names it.
- No V21.
- No unsupported formal/CI/fault-injection claims.

## EXACT NEXT ACTION — AB104.206
Attack the boundary between authority evidence and actual effects:
1. can a valid QC authorize an effect after its authority is revoked?
2. revocation racing with effect execution;
3. stale QC replay;
4. effect idempotency vs authority freshness;
5. fencing external workers after quorum changes;
6. recovery when effect outcome is unknown;
7. minimum decision/effect contract required to prevent an old canonical certificate from authorizing a new external effect.

Status: research-only.
