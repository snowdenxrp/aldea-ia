# AB105 G0 authorize-snapshot diagnostic checkpoint — 2026-10-02

## Executed evidence

Run: 37037323460
Job: 110938623014
Head: ed095b1254da730e8b4d15eb3e5203ed50fa0f2d
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42
Artifact: 11240801816
Artifact digest: sha256:6acacf4881843b194ca3c3782b5b5b267184023565daac13f045e813ac3cb18b

Raw result:
CAUSAL_JMM_RACE ITERATIONS=100 READERS=4 OBSERVATIONS=2939007 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=2845069 OVERLAP_ALLOWED=17769 OVERLAP_DENIED=81 POST_RETURN_PRE_REMOVE_CACHE=0 POST_RETURN_POST_REMOVE_CACHE=2845069 POST_RETURN_UNKNOWN_CACHE=0 POST_RETURN_PRE_REMOVE_SNAPSHOT=0 POST_RETURN_POST_REMOVE_SNAPSHOT=2845069 POST_RETURN_UNKNOWN_SNAPSHOT=0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0 UNEXPECTED=0

## Source audit at exact pin

StandardAuthorizerData.authorize() calls findAclRule() once for the non-superuser path. findAclRule() performs exactly one plain read:
AclCache aclCacheSnapshot = aclCache;
It then uses that same local snapshot for both checkSection() calls (specific resource and wildcard). Therefore the diagnostic ThreadLocal captures the single local cache snapshot used by the authorization decision; it is not merely the last of multiple independent snapshots.

The executed result therefore establishes:
- no observed post-return ALLOWED;
- no observed post-return authorization with pre-remove field cache identity;
- no observed post-return authorization with pre-remove internal authorize snapshot identity;
- all 2,845,069 post-return observations sampled the post-remove cache identity both before authorize and at the internal snapshot boundary;
- overlap ALLOWED remains observed.

## Epistemic status

🟢 EXECUTED/RAW-VERIFIED: the diagnostic ran successfully at the pinned Kafka revision.
🟢 SOURCE-VERIFIED: the exact pinned authorize path has one local aclCache snapshot per authorization decision.
🟡 CAUSAL MECHANISM: NOT ESTABLISHED.
🟡 JMM happens-before: UNKNOWN.
🟡 stale read: NOT OBSERVED IN THIS DIAGNOSTIC.
🟡 security impact/exploitability/generalization: UNKNOWN.

Reflection/ThreadLocal instrumentation is timing-affecting diagnostic instrumentation. The result is behavioral evidence, not a complete formal JMM proof.

## Boundaries

AB105.116R: UNCHANGED.
AB105.117R: NOT_CREATED.
TLC: NOT_RERUN.
PR #89: PRESERVED.
PR #92: PRESERVED.
PR #93: diagnostic-only/draft; do not merge as canonical Kafka source.

## Next action

The cache/snapshot identity boundary is now covered for this experiment. Do not repeat the same diagnostic. Next investigate the remaining publication/causal boundary with a methodologically distinct test, explicitly separating:
1. writer completion;
2. publication/currentness of StandardAuthorizerData;
3. authorization decision path;
4. any synchronization edge that could establish JMM happens-before.

Any new result must preserve UNKNOWN if no direct causal witness is obtained.
