---- MODULE NexoSharedFootprintV5Adversarial ----
EXTENDS Naturals, TLC

CONSTANTS Effects, DeclaredDomains

VARIABLES
  remaining,
  reserved,
  declaredDomain,
  actualConflictDomain,
  footprintEpoch,
  domainEpoch,
  admitted,
  admissionEpoch

vars == <<remaining, reserved, declaredDomain, actualConflictDomain,
           footprintEpoch, domainEpoch, admitted, admissionEpoch>>

Init ==
  /\ remaining = [d \in DeclaredDomains |-> 10]
  /\ reserved = [e \in Effects |-> 0]
  /\ declaredDomain = [e \in Effects |-> CHOOSE d \in DeclaredDomains : TRUE]
  /\ actualConflictDomain = [e \in Effects |-> CHOOSE d \in DeclaredDomains : TRUE]
  /\ footprintEpoch = [e \in Effects |-> 0]
  /\ domainEpoch = [d \in DeclaredDomains |-> 0]
  /\ admitted = [e \in Effects |-> FALSE]
  /\ admissionEpoch = [e \in Effects |-> 0]

FootprintCurrent(e) ==
  footprintEpoch[e] = domainEpoch[declaredDomain[e]]

Admit(e, amount) ==
  /\ ~admitted[e]
  /\ amount <= remaining[declaredDomain[e]]
  /\ FootprintCurrent(e)
  /\ remaining' =
       [remaining EXCEPT ![declaredDomain[e]] = @ - amount]
  /\ reserved' = [reserved EXCEPT ![e] = amount]
  /\ admitted' = [admitted EXCEPT ![e] = TRUE]
  /\ admissionEpoch' = [admissionEpoch EXCEPT ![e] = domainEpoch[declaredDomain[e]]]
  /\ UNCHANGED <<declaredDomain, actualConflictDomain,
                  footprintEpoch, domainEpoch>>

Invalidate(d) ==
  /\ domainEpoch' = [domainEpoch EXCEPT ![d] = @ + 1]
  /\ UNCHANGED <<remaining, reserved, declaredDomain,
                  actualConflictDomain, footprintEpoch, admitted,
                  admissionEpoch>>

ChangeFootprint(e, d) ==
  /\ declaredDomain' = [declaredDomain EXCEPT ![e] = d]
  /\ footprintEpoch' = [footprintEpoch EXCEPT ![e] = domainEpoch[d]]
  /\ UNCHANGED <<remaining, reserved, actualConflictDomain,
                  domainEpoch, admitted, admissionEpoch>>

Next ==
  \/ \E e \in Effects, n \in 1..10 : Admit(e, n)
  \/ \E d \in DeclaredDomains : Invalidate(d)
  \/ \E e \in Effects, d \in DeclaredDomains : ChangeFootprint(e, d)

GlobalCapacityInvariant ==
  \A d \in DeclaredDomains :
    LET total == Sum({reserved[e] : e \in Effects /\ actualConflictDomain[e] = d})
    IN total <= 10

FootprintSound ==
  \A e \in Effects :
    admitted[e] => declaredDomain[e] = actualConflictDomain[e]

====

\* Intended adversarial lesson:
\* If FootprintSound is assumed, a footprint epoch can fence stale
\* footprint results, while the full dependency graph can remain outside
\* the linearization state.
\*
\* If FootprintSound is NOT guaranteed, two effects can be assigned
\* different declared domains while sharing one actual invariant domain;
\* local admissions may both succeed and GlobalCapacityInvariant can fail.
\*
\* Therefore the protected core needs an authoritative, bounded
\* conflict/disjointness relation whose soundness is itself protected.
\* An epoch alone cannot repair a false dependency classification.
