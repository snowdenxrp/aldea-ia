# NEXO — AB104.206 AUTHORITY → EXTERNAL EFFECT ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21.

## Scope
Attack the boundary between a valid authority decision and a real external effect. The objective is to prevent historical authorization, replayed quorum evidence, or stale recovery state from causing a new external effect.

## External evidence studied

### TUF
TUF separates trusted root metadata, version/freshness checks, snapshot consistency, and rollback/freeze handling. Its current specification requires root transitions to satisfy threshold signatures from both the currently trusted root and the new root, and rejects root versions that are not exactly the next version. This supports a Nexo distinction between authority validity, freshness, and transition authorization. citeturn0search0

### RATS
RFC 9334 separates Attester, Verifier and Relying Party and explicitly treats freshness as a policy input. It also notes a race: the attested state may change immediately after evidence is generated. Therefore an attestation result is evidence with a freshness window, not an eternal authorization token. citeturn0search1

### Transactional outbox / idempotency
The distributed-systems failure mode remains: a process can perform an external publication/effect and crash before recording completion. Retrying from the local record can therefore duplicate an external effect unless the external boundary has its own idempotency or reconciliation semantics. This reinforces the AB104.197 rule: CommitRecord is recovery evidence, never a permission to re-run the original effect.

## Attack matrix

### A. Valid old QC replay
A previously valid quorum certificate is presented again after authority has advanced.
Result: reject as stale/replayed. QC validity is not sufficient; current authority/freshness must be checked.

### B. QC valid, authority revoked before effect
Authorization and effect are separated by time. If revocation occurs before the effect crosses its external boundary, the effect must be fenced or rejected according to the effect contract.

### C. Effect succeeds, local CommitRecord missing
External state is UNKNOWN from the local perspective. Recovery must reconcile using an operation identity or external observation; it must not execute the effect again merely because CommitRecord is absent.

### D. CommitRecord exists, external effect uncertain
CommitRecord proves only the defined local transition. It does not prove external completion unless the contract explicitly binds it to independently verified external evidence. Recovery reconstructs state/reconciles; it does not blindly invoke the handler again.

### E. Worker loses authority after claiming operation
A worker may hold stale authority while another process advances the authority epoch. An effect boundary needs fencing/conditional acceptance tied to the current authority epoch, or the external system must reject stale tokens.

### F. Duplicate operation_identity
Two attempts with the same logical operation identity must converge to one externally observable outcome. A fresh execution identity must never be manufactured merely because recovery happened.

### G. Different operation identities for same logical effect
Idempotency cannot rely only on a randomly generated transport/request ID. The logical operation identity must be stable enough to detect retries/recovery of the same effect, while distinct legitimate operations remain distinguishable.

### H. Historical authorization used after restore
A restored image may contain a valid old Decision/QC and a valid CommitRecord. If protected freshness has advanced beyond it, the historical record may be useful for reconstruction but cannot authorize a new effect.

## New distinction
Three facts must remain separate:

1. DECISION_AUTHORIZED — authority accepted a decision under a particular epoch/config/freshness.
2. EFFECT_ATTEMPTED/COMMITTED — the local effect protocol durably recorded a transition.
3. EFFECT_OBSERVED — the external boundary independently confirms the intended outcome.

None should be inferred from another unless an explicit protocol contract proves the implication.

## Candidate Decision Contract fields
Conceptually:
- decision_identity
- authority_epoch
- authority_config_digest
- root_digest
- freshness/expiry constraints
- subject/resource scope
- operation_identity
- predecessor/state digest
- allowed effect class
- nonce/replay binding where required
- revocation/fencing epoch

## Candidate Effect Contract fields
Conceptually:
- operation_identity
- decision_identity
- required_authority_epoch
- target/resource identity
- effect parameters digest
- idempotency key / deduplication identity
- maximum validity window
- external acknowledgment/reconciliation method
- completion evidence requirements
- compensation/UNKNOWN policy

Exact schemas remain OPEN.

## Recovery state machine implication
If an old authorization is found during recovery:
- use it to reconstruct historical state;
- do not issue a new external effect solely from its presence.

If external completion is uncertain:
- `UNKNOWN_EXTERNAL`;
- query/reconcile if the boundary supports it;
- only create a new attempt when the effect contract explicitly proves that doing so cannot duplicate the original outcome.

If authority epoch is stale:
- `STALE_AUTHORITY`;
- fence the worker;
- no external effect.

If the external system accepts a stale authorization because it lacks fencing, that is an architecture-level boundary weakness, not something Nexo can honestly mark as solved internally.

## Code/repository study
Canonical repo: snowdenxrp/aldea-ia / main.
Search of the canonical repository for `Effect Contract`, `Decision Contract`, `CommitRecord`, and `effect_identity` did not establish a verified implementation of the complete authority-to-effect invariant. Therefore no implementation/security guarantee is claimed.

## Historical residuals AB50→AB58 — unchanged
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

## DO-NOT-REPEAT
- Valid historical QC != current authorization.
- Attestation evidence != eternal authorization.
- CommitRecord != permission to retry.
- Missing CommitRecord != proof that an external effect did not happen.
- Local commit != external completion unless explicitly evidenced.
- Random request ID != necessarily stable logical operation identity.
- Stale worker authority must not cross an effect boundary.
- Never hide UNKNOWN_EXTERNAL by guessing.
- No V21.
- No unsupported formal verification/CI/fault-injection claims.

## EXACT NEXT ACTION — AB104.207
Attack effect-boundary fencing and reconciliation in concrete systems:
1. compare conditional writes/version checks, leases and fencing tokens;
2. study cloud/database APIs that provide idempotency keys or conditional mutation;
3. crash after external acceptance but before local acknowledgment;
4. crash after local commit but before external acceptance;
5. network partition and delayed duplicate messages;
6. stale worker after authority rotation;
7. determine the minimum evidence needed to classify COMMITTED / NOT_COMMITTED / UNKNOWN without guessing.

Status: research-only.