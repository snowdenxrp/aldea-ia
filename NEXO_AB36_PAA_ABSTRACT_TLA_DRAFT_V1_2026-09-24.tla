---- MODULE NexoPAA_AB36 ----
EXTENDS Naturals, FiniteSets, TLC

CONSTANTS
    Subjects, Operations, Attempts, Resources,
    Incarnations, Epochs, Policies, Delegations,
    Bridges, Caps, Protocols

ASSUME
    Subjects # {} /\\ Operations # {} /\\ Attempts # {} /\\
    Resources # {} /\\ Incarnations # {} /\\ Epochs # {} /\\
    Policies # {} /\\ Delegations # {} /\\ Bridges # {} /\\ Caps # {} /\\
    Protocols = {"ATOMIC", "LEASE", "RECHECK"}

Boundary == "Z1->Z3"
Assessments == {"TRUE_JUSTIFIED", "FALSE", "UNKNOWN"}

CONTEXT ==
    [subject: Subjects, resource: Resources, incarnation: Incarnations,
     epoch: Epochs, cap: Caps, policy: Policies, delegation: Delegations]

BRIDGE ==
    [subject: Subjects, op: Operations, attempt: Attempts,
     resource: Resources, incarnation: Incarnations,
     epoch: Epochs, cap: Caps, policy: Policies,
     delegation: Delegations, protocol: Protocols,
     fresh: BOOLEAN, consumed: BOOLEAN]

ADMISSION ==
    [subject: Subjects, op: Operations, attempt: Attempts,
     resource: Resources, incarnation: Incarnations,
     bridge: Bridges, boundary: {Boundary}]

VARIABLES auth, incarnation, policy, delegation, bridges, admissions, assess

vars == <<auth, incarnation, policy, delegation, bridges, admissions, assess>>

TypeOK ==
    / auth in SUBSET CONTEXT
    / incarnation in [Resources -> Incarnations]
    / policy in [Resources -> Policies]
    / delegation in [Subjects -> Delegations]
    / bridges in [Bridges -> BRIDGE]
    / admissions in Seq(ADMISSION)
    / assess in [1..Len(admissions) -> Assessments]

Init ==
    / auth = {}
    / incarnation = [r in Resources |-> CHOOSE i in Incarnations: TRUE]
    / policy = [r in Resources |-> CHOOSE p in Policies: TRUE]
    / delegation = [s in Subjects |-> CHOOSE d in Delegations: TRUE]
    / bridges = [b in Bridges |-> CHOOSE x in BRIDGE: x.subject in Subjects]
    / admissions = << >>
    / assess = [i in 1..0 |-> "UNKNOWN"]

AuthValid(a) ==
    a in auth /\\
    a.resource \in Resources /\\
    a.incarnation = incarnation[a.resource] /\\
    a.policy = policy[a.resource] /\\
    a.delegation = delegation[a.subject]

CompleteBinding(a,e) ==
    a.subject = e.subject /\\
    a.resource = e.resource /\\
    a.incarnation = e.incarnation /\\
    a.cap = e.cap

ProtocolValid(b,e) ==
    b.subject = e.subject /\\
    b.op = e.op /\\
    b.attempt = e.attempt /\\
    b.resource = e.resource /\\
    b.incarnation = e.incarnation /\\
    b.fresh /\\
    ~b.consumed

AdmissionAssessment(e) ==
    IF \\E b \\in Bridges:
          b \in DOMAIN bridges /\\
          bridges[b].subject = e.subject /\\
          bridges[b].op = e.op /\\
          bridges[b].attempt = e.attempt /\\
          bridges[b].resource = e.resource /\\
          bridges[b].incarnation = e.incarnation /\\
          ProtocolValid(bridges[b], e)
       THEN "TRUE_JUSTIFIED"
       ELSE "UNKNOWN"

Admit ==
    \\E e \\in ADMISSION:
       / e.boundary = {Boundary}
       / e.bridge \in DOMAIN bridges
       / admissions' = Append(admissions,e)
       / assess' = [i in 1..Len(admissions') |->
                         IF i = Len(admissions') THEN AdmissionAssessment(e)
                         ELSE assess[i]]
       / UNCHANGED <<auth, incarnation, policy, delegation, bridges>>

Stutter ==
    UNCHANGED vars

Next == Admit \\/ Stutter

Spec == Init /\\ [][Next]_vars

NoAuthorityAmplification ==
    \\A i in 1..Len(admissions):
       assess[i] # "TRUE_JUSTIFIED" \\/ admissions[i].bridge in DOMAIN bridges

====
