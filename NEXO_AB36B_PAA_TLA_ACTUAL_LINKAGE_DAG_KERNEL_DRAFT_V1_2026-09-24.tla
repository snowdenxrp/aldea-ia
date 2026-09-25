---------------- MODULE NexoPAA_AB36B ----------------
EXTENDS Naturals, FiniteSets, Sequences

CONSTANTS Subjects, Operations, Attempts, Resources,
          Incarnations, Epochs, Policies, Delegations,
          Bridges, Admissions, Events

CONSTANTS ATOMIC, LEASE, RECHECK,
          TRUE_JUSTIFIED, FALSE, UNKNOWN, B0

ASSUME
  / ATOMIC # LEASE / LEASE # RECHECK / ATOMIC # RECHECK
  / B0 = "Z1->Z3"

EventTypes ==
  {"AUTH_ISSUE","AUTH_REVOKE","EPOCH_ADVANCE",
   "DELEGATION_CHANGE","POLICY_CHANGE","RESOURCE_REINCARNATE",
   "LEASE_ISSUE","LEASE_EXPIRE","ATTEMPT_CREATE","RETRY",
   "DECIDE","ADMIT","ABORT"}

Assessments == {TRUE_JUSTIFIED, FALSE, UNKNOWN}

AuthRec ==
  [subject: Subjects, resource: Resources, incarnation: Incarnations,
   epoch: Epochs, cap: SUBSET {} cup {x in Subjects}]

BridgeRec ==
  [subject: Subjects, op: Operations, attempt: Attempts,
   resource: Resources, incarnation: Incarnations,
   epoch: Epochs, policy: Policies, delegation: Delegations,
   protocol: {ATOMIC, LEASE, RECHECK}, fresh: BOOLEAN, consumed: BOOLEAN]

AdmissionRec ==
  [subject: Subjects, op: Operations, attempt: Attempts,
   resource: Resources, incarnation: Incarnations,
   auth: Subjects, bridge: Bridges, boundary: {B0}]

vars ==
  <<currentIncarnation, currentPolicy, currentDelegation,
    authorities, bridges, admissions, usedAuth, usedBridge,
    eventType, precedes, binds, invalidates, bridgesEvent,
    consumes, assessment>>

Init ==
  / currentIncarnation in [Resources -> Incarnations]
  / currentPolicy in [Resources -> Policies]
  / currentDelegation in [Subjects -> Delegations]
  / authorities = {}
  / bridges in [Bridges -> BridgeRec]
  / admissions = {}
  / usedAuth in [Admissions -> Subjects]
  / usedBridge in [Admissions -> Bridges]
  / eventType in [Events -> EventTypes]
  / precedes subseteq Events X Events
  / binds subseteq Events X Events
  / invalidates subseteq Events X Events
  / bridgesEvent subseteq Events X Events
  / consumes subseteq Events X Events
  / assessment in [Admissions -> Assessments]

WellFormedDAG ==
  A e in Events : ~Reachable(e,e,precedes)

Reachable(x,y,R) ==
  (x,y) in R / E z in Events : (x,z) in R / Reachable(z,y,R)

ActualAdmission(a) ==
  a in admissions / a in DOMAIN usedAuth / a in DOMAIN usedBridge

ActualAuthority(a) ==
  E x in authorities :
    x.subject = usedAuth[a]

ActualBridge(a) ==
  usedBridge[a] in DOMAIN bridges

BindingOK(a) ==
  LET b == bridges[usedBridge[a]] IN
    / b.subject = admissions[a].subject
    / b.op = admissions[a].op
    / b.attempt = admissions[a].attempt
    / b.resource = admissions[a].resource
    / b.incarnation = admissions[a].incarnation

ProtocolOK(a) ==
  LET b == bridges[usedBridge[a]] IN
    / / b.protocol = ATOMIC
       / b.fresh
    / / b.protocol = LEASE
       / b.fresh / ~b.consumed
    / / b.protocol = RECHECK
       / b.fresh

IncarnationOK(a) ==
  LET b == bridges[usedBridge[a]] IN
    / b.incarnation = admissions[a].incarnation
    / b.incarnation = currentIncarnation[admissions[a].resource]

AssessmentOf(a) ==
  IF ~ActualAdmission(a) THEN UNKNOWN
  ELSE IF / ActualAuthority(a)
          / ActualBridge(a)
          / BindingOK(a)
          / IncarnationOK(a)
          / ProtocolOK(a)
       THEN TRUE_JUSTIFIED
       ELSE UNKNOWN

Admit(a) ==
  / a 
otin admissions
  / a in DOMAIN usedAuth
  / a in DOMAIN usedBridge
  / admissions' = admissions cup {a}
  / assessment' = [assessment EXCEPT ![a] = AssessmentOf(a)]
  / UNCHANGED <<currentIncarnation,currentPolicy,currentDelegation,
                 authorities,bridges,usedAuth,usedBridge,
                 eventType,precedes,binds,invalidates,bridgesEvent,consumes>>

Stutter ==
  UNCHANGED vars

Next == Admit / Stutter

Spec == Init / [][Next]_vars

INV_ACTUAL_LINKAGE ==
  A a in admissions :
    / a in DOMAIN usedAuth
    / a in DOMAIN usedBridge

INV_UNKNOWN_CONSERVATIVE ==
  A a in admissions :
    assessment[a] = TRUE_JUSTIFIED =>
      / ActualAdmission(a)
      / ActualAuthority(a)
      / ActualBridge(a)
      / BindingOK(a)
      / IncarnationOK(a)
      / ProtocolOK(a)

INV_BOUNDARY ==
  A a in admissions :
    admissions[a].boundary = {B0}
=============================================================
