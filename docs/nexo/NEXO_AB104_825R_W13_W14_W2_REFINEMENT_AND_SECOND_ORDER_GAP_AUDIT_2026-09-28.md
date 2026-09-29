# NEXO AB104.825R — W13/W14/W2 refinement + second-order gap audit

Date: 2026-09-28
Status: RESEARCH ONLY. No Nexo implementation.

## Research cross-check

NIST's ordered t-way work confirms that fault detection in state-based systems can depend on event ordering, and its sequence-covering work provides a way to reason about finite relevant event-order coverage without enumerating every possible sequence. citeturn0search0turn0search9

NIST's combinatorial coverage work also supports measuring coverage against an explicitly defined interaction space rather than using raw test count as a proxy. citeturn0search8turn0search11

## W13 refinement — explicit authority-generation transition

Previous W13 conflated incarnation transition and authority-generation transition. That was too weak for I9.

Refined W13:

1. operation O is accepted under identity I1, incarnation E1, authority generation G1;
2. retention/evidence record for O expires;
3. recovery establishes E2;
4. authority generation explicitly advances G2;
5. delayed O from E1/G1 arrives;
6. protected boundary checks E2/G2 independently of missing old retention evidence;
7. outcome is REJECT, RECONCILE, or UNKNOWN according to the declared state machine.

This preserves I2 and now explicitly instantiates the distinct authority-generation predicate required by I9.

**I2:** FULL provisional.
**I9:** FULL provisional after refinement; still requires formal equivalence review.

## W14 refinement — explicit acknowledgement ambiguity

Previous W14 did not make acknowledgement uncertainty a separate event. That was insufficient for I10.

Refined W14:

1. worker A owns O;
2. ownership transfers to B;
3. A retains an in-flight response/effect possibility;
4. O is redelivered/retried under B;
5. one confirmation/acknowledgement for O is lost, delayed, or duplicated;
6. the effect boundary must not create a second semantic effect;
7. if durable effect knowledge is unavailable, state is UNKNOWN and requires reconciliation.

**I5:** FULL provisional.
**I10:** FULL provisional after refinement; formal equivalence review pending.

## W2 refinement — explicit recovery/incarnation boundary

I11 was previously mapped to W2, but generic transaction failure did not establish recovery as a causal boundary.

Refined W2 variant:

1. O is initiated under E1;
2. external provider may accept O;
3. local process recovers into E2 before definitive external outcome is durable locally;
4. delayed outcome from E1 arrives or remains unknown;
5. retry/reconciliation uses operation identity plus current authority/incarnation;
6. the system cannot infer external absence from missing local confirmation;
7. a retry cannot silently become a new semantic operation.

This is retained as an explicit W2-R variant rather than mutating the historical W2 meaning.

**I4:** remains FULL under original W2.
**I11:** FULL provisional under W2-R.

## Second-order gap search

The search was performed over the seven predicate axes and the six normalized temporal relations, but only candidates that can reach a protected decision/effect boundary were retained.

Candidate combinations examined:

- identity × recovery × correction;
- authority × recovery × external-effect knowledge;
- provenance × retry × stale observation;
- ownership × recovery × duplicate;
- authentication × correction × delayed response;
- retention × correction × reconciliation;
- safety × external-effect knowledge × recovery;
- liveness × authority × retry;
- provenance × authority × incarnation;
- correction × acknowledgement × external effect.

### Results

**identity × recovery × correction:** subsumed by W16 when correction changes interpretation of a pre-recovery operation. No new independent protected predicate identified.

**authority × recovery × external-effect knowledge:** subsumed by refined W2-R/W16 depending on whether correction exists. No new independent predicate without adding a distinct effect boundary.

**provenance × retry × stale observation:** currently admissible as a candidate but not proven independent. It may require a witness if provenance determines authority/reconciliation differently from identity. Status: PENDING.

**ownership × recovery × duplicate:** currently subsumed by refined W14 when recovery is the mechanism producing the ownership-generation transition. If ownership can change independently of recovery, a separate witness may be needed. Status: PENDING semantic distinction.

**authentication × correction × delayed response:** no new independent effect predicate identified; correction can be represented as the authoritative state transition and delayed response as stale input. Status: CANDIDATE/REDUCTION PENDING.

**retention × correction × reconciliation:** currently distinct from I2/I9 only if correction changes the interpretation of expired evidence. Status: PENDING.

**safety × external-effect knowledge × recovery:** covered conceptually by W2-R when safety is represented as the protected effect boundary. No independent witness yet proven necessary.

**liveness × authority × retry:** covered by I1 if liveness is not an independent acceptance predicate. If liveness introduces a separate deadline/failure state, a new temporal predicate would be required. Status: PENDING.

**provenance × authority × incarnation:** currently overlaps I6 unless provenance has semantics beyond authentication/source identity. No new witness frozen.

**correction × acknowledgement × external effect:** overlaps W16/W14 depending on whether correction is pre- or post-effect. No new witness frozen.

## Important result

The second-order search did **not** justify immediately adding W17+.

Instead, it identified four semantic questions that must be resolved before the interaction universe can be frozen:

1. Is provenance independent from identity/authentication at the protected boundary?
2. Can ownership change independently of recovery/incarnation?
3. Can correction change the meaning of expired evidence independently of reconciliation?
4. Does liveness/deadline state alter authorization or only scheduling?

These are now explicit UNKNOWN/PENDING questions rather than hidden assumptions.

## Coverage state after refinement

I1-I8: FULL provisional.
I9: FULL provisional via refined W13.
I10: FULL provisional via refined W14.
I11: FULL provisional via W2-R.
I12: FULL provisional via W15.
I13: FULL provisional via W16.

No additional interaction is frozen by this audit.

## Methodological disposition

The audit now distinguishes:

- **historical witness semantics:** never silently rewritten;
- **refined variants:** new explicit witnesses/variants that add a causal predicate;
- **coverage:** provisional until the interaction universe is enumerated and equivalence rules are frozen;
- **UNKNOWN/PENDING:** preserved rather than converted into assumptions.

The existence of a finite grammar does not itself prove completeness. A completeness claim requires an explicitly enumerated denominator and a frozen equivalence/exclusion relation.

## Exact next action

**AB104.826R:** resolve the four semantic questions above using concrete distributed-system code/test evidence, especially provenance-vs-identity, independent ownership epochs, correction of expired evidence, and deadline/liveness semantics. Then update the interaction grammar only if evidence requires it. Do not create W17+ merely to increase apparent coverage.

No implementation. No formal verification. No universal security/exactly-once claim. No deletion/overwrite.
