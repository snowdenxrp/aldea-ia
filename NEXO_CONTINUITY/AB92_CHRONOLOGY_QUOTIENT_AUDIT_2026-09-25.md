# AB92 — CHRONOLOGY RECOVERY AND CLAIM-RELATIVE QUOTIENT AUDIT — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, formal verification, or 286-triple expansion.

## Objective

Continue AB91 by recovering the canonical AB26/AB49 obligations and performing a bounded, non-oracular quotient audit over the explicitly recovered event-order language.

## Canonical evidence recovered directly

AB25 commit:
8de08f7b61ec11da21638ff3988dee23ea51b553

AB26 commit:
9785992bac45988413838aace8ea835fa7c1389e

AB49 commit:
b4dfd5553826073a3099f7e2b8ad11327b6a1781

AB25 establishes:
- UsedAdmissionContext is historical/relational evidence of actual admission linkage, not an authorization predicate.
- AdmissionRecord retains attempt, resource/incarnation, authority, policy/delegation, bridge, protocol class, decision reference, admission position and boundary as needed for P_AA.
- CreateAttempt creates a fresh attempt identity.
- Prior attempt bridge is not inherited unless an explicit binding rule proves P_AA equivalence.
- Admit creates/observes the authoritative admission linkage.
- Hidden-history attacks include revocation, reincarnation, delegation, policy, replay, attempt, admission order and decision/bridge linkage.

AB26 establishes:
- six-part transition contract: Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink;
- historical admission links are immutable;
- LeaseBridge and AdmissionBindingClass have distinct semantic roles;
- three temporal positions are not a general sufficiency theorem;
- order-equivalence, not raw timestamp equality, is the appropriate compression target;
- quotient equivalence must preserve current semantic context, existing admission linkage, retained history distinctions and every allowed future P_AA-relevant continuation;
- failure to establish correspondence means UNKNOWN.

AB49 establishes:
- HistorySupport may use event identity, actual authority/bridge/recheck linkage, claim-relevant order, invalidation edges, linearization, lease interval/expiry/renewal/consumption/replay, exact recheck facts/order, bounded auxiliary history, and boundary/scope;
- HistorySupport may not use future observations or quotient equivalence as an oracle;
- exact congruence requires corresponding future transitions and equal abstract successors;
- one-way refinement must not be mislabeled as bisimulation.

## Bounded event-order audit

Scoped known event alphabet:
AuthorityRevoke
PolicyChange
DelegationChange
ResourceReincarnate
LeaseExpire
Admit

For the invalidation events above, AB25/AB26 give explicit cross-effects. In a bounded model, the relative order of invalidation and Admit is therefore P_AA-relevant: an invalidation before admission can prevent admission, while the same invalidation after an already-recorded admission does not rewrite the historical admission linkage.

This confirms:
ORDER_RELEVANT_TO_PAA = KNOWN

But this does not establish an irreducible ternary predicate. Each demonstrated effect is presently expressible through event-to-admission ordering and the corresponding lower-arity invalidation relation.

## Quotient audit

Candidate merge:
Q(LeaseBridge, AdmissionBindingClass) -> one representation.

Necessary retained dimensions:
- actual admission linkage / attempt identity;
- authority binding;
- freshness/expiry;
- replay/consumption;
- invalidation state;
- protocol class;
- temporal/order support.

AB26's CM-AA137..146 and AB25's CM-AA121..136 show independent dimensions whose loss can make reconstruction impossible or UNKNOWN.

Therefore the bounded audit finds:
MERGE_ELIMINATION = NOT_JUSTIFIED

This is stronger than merely saying “fields differ”: the lost dimensions participate in either historical linkage or future transition obligations.

However:
CONCRETE_LEGAL_FUTURE_SEPARATOR = NOT_ESTABLISHED
because no complete future transition simultaneously reading both representations was recovered in the current indexed history.

## History minimization result

The safe minimization target is not “fewest fields/events”.

A history item can be removed only if all histories differing only in that item have equivalent future P_AA behavior, or the abstraction safely returns UNKNOWN/PENDING when the distinction cannot be reconstructed.

Thus:
MINIMAL_HISTORY_LOG = NOT_ESTABLISHED
MINIMAL_PAA_SUPPORT = BOUNDED CANDIDATE ONLY

## Epistemic update

ORDER_RELEVANCE = KNOWN
BRIDGE/ADMISSION_MERGE = NOT_JUSTIFIED
CONCRETE_QUOTIENT_SEPARATION = UNKNOWN
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
EXECUTION = NOT_VERIFIED

## Important non-conclusions

- No claim that LeaseBridge and AdmissionBindingClass can never be merged.
- No claim that a ternary P_AA collision exists.
- No claim that no ternary collision exists.
- No claim that the indexed-history search proves historical nonexistence.
- No promotion of UNKNOWN to KNOWN_EMPTY.
- No semantic modification of AB61/AB65.

## Exact next action

Construct the smallest non-oracular finite quotient candidate from the AB26/AB49 support language and test each removable support dimension independently:
1. attempt/admission linkage;
2. claim-relevant order;
3. invalidation edges;
4. protocol class;
5. lease interval/replay history.

For each removal, seek either:
A. a recovered legal separator,
B. a bounded proof of observational equivalence for the scoped event language, or
C. UNKNOWN with an explicit unresolved obligation.

Only after this dimension-by-dimension audit should a larger joint collision search be considered.
