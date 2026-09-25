# AB104.4 — Code audit: AB61 vs AB100 LEASE_CONSUME semantics — 2026-09-25

Status: RESEARCH ONLY. No production implementation change.

## Audit target
Direct inspection of the recovered AB61 interpreter source (commit a348f1e67461c26074075d39fdca189fd9cac5f9) and the recovered AB100 replay-aware harness (commit 4e3798e061b2386486c989eb522a2b61d1661653) reveals a material implementation-boundary discrepancy that must not be silently merged.

## AB61 behavior
AB61 declares LEASE_CONSUME with reads {lease, attempt} and writes {lease_valid}. Its apply_known implementation, when the lease is valid, sets lease_valid=False. However its continuation_legality treats LEASE_CONSUME as a known event unless lease_valid is already false. Thus AB61 contains an explicit bounded harness behavior in which consumption invalidates the lease.

## AB100 behavior
AB100 changes the representation: LEASE_CONSUME reads {lease, attempt, replay}, writes {replay}, and has semantic_status UNKNOWN. ReplayState stores consumed_attempts and a completeness marker. Its admit() refuses to decide unless replay completeness is COMPLETE; if the attempt is known consumed, admission is FALSE. Its apply() deliberately refuses to execute LEASE_CONSUME because its semantic status is UNKNOWN.

## Why this is significant
These are not equivalent code representations. AB61 models consumption as lease invalidation; AB100 models consumption as replay-state mutation while deliberately refusing to assert the protocol law. Because replay/consumption is a canonical separator (AB49 L4), choosing either behavior as canonical would introduce a semantic assumption unless source evidence closes the law.

The discrepancy does NOT establish that Nexo has two legal semantics. It establishes that the research harnesses encode different abstractions and that the canonical research layer must preserve the distinction.

## Required repair boundary
1. Do not overwrite AB61 historical source.
2. Do not promote AB100 to protocol truth merely because it is newer.
3. Treat LEASE_CONSUME post-state as UNKNOWN until source evidence specifies whether consumption invalidates the lease, mutates replay independently, does both, or follows another law.
4. Future code should represent replay and lease validity as separate state dimensions and attach provenance/status to each transition effect.
5. A compatibility adapter, if needed, should be explicitly labeled as a hypothesis/scaffold and must not be used to claim P_AA closure.

## Secondary observation
AB61's lower_obs reports replay_consumption_facts as state.lease_valid, which conflates replay/consumption evidence with lease validity. AB100's separation of ReplayState is therefore a useful architectural correction, but it still does not provide the missing protocol transition law.

## Gate impact
LEASE_CONSUME remains UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW.
QUOTIENT_CONGRUENCE remains UNKNOWN.
TERNARY_PAA_COLLISION remains UNKNOWN.
SEMANTIC_FREEZE remains NOT_DECLARED.
FORMAL_VERIFICATION remains NOT_PERFORMED.
AB65_EXECUTION remains NOT_VERIFIED.
286 expansion remains BLOCKED.
