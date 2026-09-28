# NEXO CONTINUITY — GLOBAL-AUDIT-108

Artifact commit: b5627742cb904f7838036dd4a7be5c7742dac4cd

Scope: provider-local ordering versus global causal/effect history; delayed observations after compaction, retention loss, migration, and recovery.

Result:
Provider revision, Raft term, receipt timestamp, attempt number, reconciliation time, and local event order are domain-local metadata. They cannot be promoted to a universal cross-provider causal clock without an explicit semantic contract. etcd exposes cluster_id/member_id/revision/raft_term and documents that snapshot restore can move revisions backward and create a new logical cluster identity. AWS Durable Execution provides bounded execution-history retention and separates OperationId from AttemptNumber. Cloud Tasks permits duplicate execution and does not guarantee task execution order.

Key invariant candidates:
PROVIDER_LOCAL_ORDER != CROSS_PROVIDER_ORDER
OBSERVATION_ORDER != EFFECT_TIME
RECONCILIATION_TIME != EFFECT_TIME
RESTORED_REVISION != ORIGINAL GLOBAL POSITION
CONVERGED CURRENT STATE != UNIQUE HISTORICAL PATH
FINITE AUDIT RETENTION + REQUIRED HORIZON NOT OBSERVED -> UNKNOWN

Critical state unchanged:
FutureObs_PAA = UNKNOWN
P_AA quotient congruence = UNKNOWN
R1-R5 completeness/minimality = UNKNOWN
dependency/TCB/evidence-reducer completeness = UNKNOWN
independence/quorum completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED
AB55/AB56 carryover = UNRESOLVED

Next exact mission: GLOBAL-AUDIT-109. Continue adversarial research on causal ordering translations across provider domains, including clock/sequence mappings, migration epochs, and whether any finite ordering contract can safely support the required claims without assuming global time.
