# AB90 — LEASEBRIDGE + ADMISSIONBINDINGCLASS shared-attempt attack — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, formal verification, or 286-triple expansion.

## Objective

Continue AB89 with two independent attempt/admission identities and one candidate shared lease/bridge. Test whether LeaseBridge and AdmissionBindingClass can safely be merged, using only recovered explicit semantics and without importing LEASE_RENEW, RETRY, MUTATION, or RECHECK semantics.

## Evidence basis

AB89 records the canonical bounded contract recovered from AB26:
- LeaseIssue creates a bound lease but does not itself create admission linkage.
- CreateAttempt creates a fresh attempt identity; prior attempts remain unchanged; future admission must bind to the attempt.
- Admit requires the actual admission linkage and evaluates predicates against the actually linked context.
- The admission linkage is authoritative historical state, not merely a consequence of current validity.
AB50/AB51 also established that LeaseBridge and AdmissionBindingClass were deliberately kept separate candidates and that bridge merge remained unresolved.

## Attack construction

Let two attempts exist:
A1 != A2.

Let B be a candidate LeaseBridge initially associated with the lease/authorization context for A1.

Construct two candidate histories:
H1: A1 is admitted using B and the actual admission context records A1.
H2: the same current lease/bridge validity is retained, but the actual admission context is associated with A2.

The attack asks whether a representation that keeps only a merged "bridge-valid" object can preserve all future P_AA observations for both histories.

## Result 1 — current bridge validity is insufficient to encode actual admission identity

The recovered contract requires future admission to bind to the attempt, while Admit separately requires the actual admission linkage.
Therefore the proposition:

    BridgeValid(B) = true

cannot, by itself, determine:

    UsedAdmissionContext.attemptId

for both A1 and A2.

A merge that erases the attempt-specific admission linkage would therefore discard a protocol-relevant dimension unless an explicit reconstruction rule proves that the missing identity is recoverable from retained bridge facts.

No such reconstruction proof is currently recovered.

## Result 2 — shared bridge does not imply shared admission binding

A single authorization/lease bridge may be valid as a current authorization object while two attempts remain distinct historical contexts. The recovered semantics do not authorize the inference:

    same LeaseBridge => same AdmissionBindingClass.

Conversely, treating AdmissionBindingClass as merely a cached copy of LeaseBridge would erase the distinction between authorization validity and the historical context actually admitted.

## Result 3 — candidate future separator

Suppose a future operation is explicitly attempt-sensitive (for example, a later admission or an evidenced replay/consumption check). Then H1 and H2 can produce different P_AA observations if that operation reads the actual admission linkage.

This is a legitimate separator pattern, but the current corpus does not provide a complete future transition law proving that such an operation must occur in every continuation.

Therefore this is evidence that merge is unsafe by default, not a completed quotient-separation theorem.

## Result 4 — no fabricated nondeterminism

We do not assume that one shared bridge can legally be rebound from A1 to A2. We also do not assume that it cannot. The missing bridge-rebinding transition law remains UNKNOWN.

The correct state is therefore:
- known distinction in stored semantic roles;
- unknown completeness of future successor behavior.

## Gate

C1 Source context: KNOWN/PARTIAL
C2 Legal transition domain: bounded for LeaseIssue/CreateAttempt/Admit; bridge-rebinding domain UNKNOWN
C3 Post-state: explicit for known admission linkage; complete bridge-sharing/rebinding post-state UNKNOWN
C4 Frame/invalidation: bounded for known actions; bridge rebinding UNKNOWN
C5 Admission linkage: EXPLICIT and protocol-relevant
C6 Exhaustive successor domain: UNKNOWN

LEASEBRIDGE_ADMISSION_BINDING_MERGE = NOT_JUSTIFIED
MERGE_SAFETY = UNKNOWN
FUTURE_SEPARATOR_PATTERN = IDENTIFIED_BUT_NOT_COMPLETELY_LEGALIZED
IRREDUCIBLE_TERNARY_RESIDUAL = NOT_ESTABLISHED
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

## External formal cross-check

TLA+ defines Next as the relation of possible successive-state pairs and actions as predicates over current and next states. This supports the distinction made here: equality of a current bridge-validity field is not enough to establish behavioral equivalence when a separate historical admission context participates in later observations. The quotient must be shown congruent over allowed successors, not inferred from a snapshot field.

Sources reviewed:
- Lamport, Specifying and Verifying Systems with TLA+ — https://lamport.azurewebsites.net/pubs/spec-and-verifying.pdf
- Lamport, The Temporal Logic of Actions — https://www.microsoft.com/en-us/research/publication/the-temporal-logic-of-actions/

## Decision

AB90 does NOT prove that LeaseBridge and AdmissionBindingClass can never be merged.

It establishes a stronger and safer engineering/research rule:

    DO NOT MERGE until an explicit reconstruction + future-equivalence proof exists.

The attempt identity and actual admission linkage are protocol-relevant dimensions under the recovered contract, so deleting them merely because the current LeaseBridge is valid would be an unsupported semantic collapse.

## Exact next action

Search for an explicit future operation that reads both the attempt-bound context and LeaseBridge (without using unresolved renewal/retry/mutation/recheck semantics). If found, construct a concrete H1/H2 future-observation separator. If none is found, attempt a formal reconstruction proof from the complete known state before considering any merge.

Do not expand to 286 triples until this quotient obligation is resolved or formally bounded as UNKNOWN.
