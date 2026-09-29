# AB104.874R — credential/key rotation + correction lineage audit

Date: 2026-09-29
Parent: AB104.873R
Mode: research/audit only

QUESTION
Can restart/failover plus credential/key rotation make a correction issued under an older security principal invalid, ambiguous, or incorrectly accepted, and does this create a new interaction beyond I17/I18/I19/I21 and class 19?

FRESH EVIDENCE
- AWS recommends credential rotation and explicitly describes old credentials being made inactive/deleted after new credentials are deployed; this establishes that credential validity has a lifecycle distinct from resource lifecycle. citeturn0search2turn0search9
- AWS webhook documentation states HMAC signatures bind timestamp + payload to a secret and can provide replay protection; rotating the webhook secret invalidates the previous secret. citeturn0search1
- AWS temporary role credentials are automatically rotated, with new credentials available before old credentials expire, showing that credential generations can overlap during transition. citeturn0search6

ATTACK
E1/R1 produces correction C1 authenticated with credential generation K1. Failover/restart moves processing to R2 and credential generation K2. C1 is delayed and arrives after K1 is retired. Separately, a retry/correction from R2 uses K2.

ANALYSIS
A. Receiver validates current credential only: delayed C1 may be rejected as authentication-invalid. That is class 19 (authentication/source validity), but rejection does not prove C1 never existed or that its external effect was absent. Historical lineage remains I19 + I21 where applicable.
B. Receiver accepts both K1 and K2 during a rotation grace window: credential validity overlaps; the event must still be evaluated by operation/resource lineage and freshness. This remains class 19 + I19/I21, not a new class.
C. Credential identity is not bound to operation identity: K1/K2 cannot determine which correction belongs to which operation. Identity remains I18/I19; authentication is evidence about source validity, not lifecycle lineage.
D. Credential K1 is rotated/revoked after C1 was already accepted by the provider: later credential invalidation does not retroactively erase the accepted effect. This preserves the distinction between source validity and effect knowledge (class 11 where outcome is ambiguous).
E. Replay of a previously valid signed correction after credential rotation: signature validity alone is insufficient if the verification contract does not bind freshness/event identity; AWS's timestamp-bound HMAC example demonstrates that replay protection is a separate property from authentication. This reduces to class 19 + I22/I21 as applicable.

KEY REFINEMENT
`CREDENTIAL_VALIDITY != OPERATION_VALIDITY != EFFECT_VALIDITY`
Credential rotation answers whether a source is currently authorized/authenticated. It does not by itself answer whether an already-submitted operation was valid at its creation time, whether its correction is causally linked, or whether an external effect committed.

SECOND REFINEMENT
`ROTATION != REVOCATION_OF_HISTORY`
Revoking K1 should not rewrite historical evidence created under K1. A historical correction may be rejected for current processing while remaining evidence that must be reconciled through authoritative lineage.

DISPOSITION
No new top-level interaction class frozen.
Authentication/source validity is already represented by class 19; lifecycle interaction reduces through I17/I18/I19/I21, with I22 for replay/retry and class 11/12 where effect ambiguity or reconciliation is present.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Semantic freeze NOT DECLARED.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Nexo runtime race NOT EXECUTED.
V21 FORBIDDEN.

CANDIDATE INVARIANTS
- INV-TE-56: Credential validity must be evaluated separately from operation/effect validity.
- INV-TE-57: Credential rotation/revocation must not erase historical operation or correction lineage.
- INV-TE-58: A correction rejected because its credential is no longer valid must remain distinguishable from a correction that never existed.
- INV-TE-59: Authentication success must not substitute for operation/resource lineage or freshness evidence.
- INV-TE-60: Credential-generation transitions and grace windows must be explicit contract parameters.

NEXT
AB104.875R — investigate credential rotation combined with authorization-policy change: old credential still cryptographically authentic but its authority is reduced/revoked, while a delayed correction arrives. Determine whether this separates authentication validity from authorization freshness in a way that requires a new interaction or remains class 19 + authority/fencing class 9 + I19/I21.

NEXO_IMPLEMENTED=NO
RUNTIME_TEST_EXECUTED=NO
FORMAL_VERIFICATION=NO
V21=FORBIDDEN
SEMANTIC_FREEZE=NOT_DECLARED