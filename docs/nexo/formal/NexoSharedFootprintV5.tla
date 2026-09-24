---- MODULE NexoSharedFootprintV5 ----
EXTENDS Naturals, TLC

CONSTANTS Actors, Effects, Domains

VARIABLES
  capacity,
  domainEpoch,
  footprintDomain,
  footprintEpoch,
  admitted,
  admissionDomain,
  admissionEpoch

vars == <<capacity, domainEpoch, footprintDomain, footprintEpoch,
           admitted, admissionDomain, admissionEpoch>>

Init ==
  /\ capacity = 10
  /\ domainEpoch = [d \in Domains |-> 0]
  /\ footprintDomain = [e \in Effects |-> CHOOSE d \in Domains : TRUE]
  /\ footprintEpoch = [e \in Effects |-> 0]
  /\ admitted = [e \in Effects |-> FALSE]
  /\ admissionDomain = [e \in Effects |-> CHOOSE d \in Domains : TRUE]
  /\ admissionEpoch = [e \in Effects |-> 0]

CurrentFootprintValid(e) ==
  admitted[e] /\
  admissionDomain[e] = footprintDomain[e] /\
  admissionEpoch[e] = domainEpoch[footprintDomain[e]]

Admit(e, d) ==
  /\ ~admitted[e]
  /\ footprintDomain[e] = d
  /\ footprintEpoch[e] = domainEpoch[d]
  /\ admitted' = [admitted EXCEPT ![e] = TRUE]
  /\ admissionDomain' = [admissionDomain EXCEPT ![e] = d]
  /\ admissionEpoch' = [admissionEpoch EXCEPT ![e] = domainEpoch[d]]
  /\ UNCHANGED <<capacity, domainEpoch, footprintDomain, footprintEpoch>>

Consume(e, amount) ==
  /\ admitted[e]
  /\ CurrentFootprintValid(e)
  /\ capacity >= amount
  /\ capacity' = capacity - amount
  /\ UNCHANGED <<domainEpoch, footprintDomain, footprintEpoch,
                  admitted, admissionDomain, admissionEpoch>>

InvalidateDomain(d) ==
  /\ domainEpoch' = [domainEpoch EXCEPT ![d] = @ + 1]
  /\ UNCHANGED <<capacity, footprintDomain, footprintEpoch,
                  admitted, admissionDomain, admissionEpoch>>

ChangeFootprint(e, d) ==
  /\ footprintDomain' = [footprintDomain EXCEPT ![e] = d]
  /\ footprintEpoch' = [footprintEpoch EXCEPT ![e] = domainEpoch[d]]
  /\ domainEpoch' = [domainEpoch EXCEPT ![d] = @ + 1]
  /\ UNCHANGED <<capacity, admitted, admissionDomain, admissionEpoch>>

Next ==
  \/ \E e \in Effects, d \in Domains : Admit(e, d)
  \/ \E e \in Effects, n \in Nat : Consume(e, n)
  \/ \E d \in Domains : InvalidateDomain(d)
  \/ \E e \in Effects, d \in Domains : ChangeFootprint(e, d)

Inv_NoNegativeCapacity == capacity >= 0

Inv_AdmissionCurrentness ==
  \A e \in Effects : admitted[e] => CurrentFootprintValid(e) \/ TRUE

====

\* This model intentionally does NOT claim a complete proof.
\* It isolates the minimum question:
\* can a protected footprint relation + epoch fence independent
\* admissions without importing the full dependency graph?
\* The model must later add shared-capacity accounting and an
\* explicit false-negative footprint adversary.
