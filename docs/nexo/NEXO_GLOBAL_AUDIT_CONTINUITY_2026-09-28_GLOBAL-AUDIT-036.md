# GLOBAL-AUDIT-036 CONTINUITY

Audit commit: 65e46c3f1f8a1a97e9559756e65f6a90ff3b6724
Previous continuity: 8885b70386d2d6605659367dcdcb9e6fa6c816d8

Completed multi-boundary partial-failure and identity separation attack.

Result: one stable logical OperationID may span lifecycle, but control admission, attempt, effect and confirmation require distinct semantic identities/states.

Candidate identities:
OperationID = logical operation;
AdmissionID = specific Z1 authorization/binding;
AttemptID = concrete execution/retry lineage;
EffectID = stable external effect identity for reconciliation/idempotency where supported;
ConfirmationID/ObservationID = evidence of external outcome;
RecordGeneration/EventID = durable historical ordering.

Attacks included durable admission/no attempt, attempt-before-send crash, external acceptance/local crash, rejection ambiguity, lost acknowledgement, recovery replay, new admission after policy change, retry under same admission, resource reincarnation, and EffectID reuse.

Critical distinctions preserved: OperationID != AdmissionID != AttemptID != EffectID != ConfirmationID; ADMISSION != EFFECT; ATTEMPT != CONFIRMATION; RECORD != WORLD TRUTH; RETRY is not automatically new authorization; new admission is not mutation of old admission.

Reconciliation must retain original logical identity, use authoritative history plus external evidence, and never infer NOT_COMMITTED from timeout or missing local record. Unknown external outcome remains UNKNOWN/quarantined. Resource incarnation remains an independent binding requirement.

Idempotency is not authorization, atomicity or confirmation proof.

No formal proof/model execution/runtime fault injection. No implementation/V21.
Next: GLOBAL-AUDIT-037 — retry/reconciliation convergence and repeated UNKNOWN attacks.
Carryover unchanged: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra universality UNKNOWN; formal verification NOT PERFORMED.
