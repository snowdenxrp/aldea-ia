# NEXO AB105 G0 — Next Hypothesis: local ACL state publication

Date: 2026-10-02

## Why this is a distinct hypothesis

The completed G0 propagation discriminator tested whether a NEW producer request could be authorized after controller-side WRITE revocation while the target broker still retained the WRITE ACL locally. It was not observed.

The next question is narrower and mechanistic: how is the target broker's current ACL state made visible to concurrent request threads during ACL mutation?

## Pinned source evidence

Kafka revision:
99b940733a9f6bc409457dba7108f08421d81e42

StandardAuthorizer:
- data is a volatile StandardAuthorizerData reference.
- authorize() snapshots StandardAuthorizerData curData = data and authorizes from that snapshot.
- addAcl() and removeAcl() call data.addAcl() / data.removeAcl() directly rather than replacing the outer volatile data reference.

StandardAuthorizerData:
- aclCache is a mutable field, not volatile.
- AclCache itself is immutable; add/remove create a new AclCache instance and assign it to aclCache.
- authorize() reads the current aclCache through findAclRule().
- The class comment says it is not thread-safe.
- StandardAuthorizer's comment describes a read-write-lock synchronization model, but the pinned implementation shown here does not itself expose such a lock around add/remove/authorize.

## Epistemic boundary

This is a SOURCE-LEVEL HYPOTHESIS, not evidence of a Kafka bug.

The observed G0 result remains:
- IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
- STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
- EXPLOITABILITY=UNKNOWN
- GENERALIZATION=UNKNOWN
- PRODUCTION_IMPACT=UNKNOWN
- SECURITY_CONCLUSION=NOT_ESTABLISHED

The source structure alone does NOT establish a Java memory-visibility failure. Kafka's metadata/event-thread execution model may provide the required synchronization externally.

## Required next experiment

Do not repeat the previous two-broker timing experiment unchanged.

A new test should instrument a target broker to distinguish:
1. ACL mutation event completion,
2. target aclCache state publication,
3. concurrent request-thread authorization observation.

The test must record:
- exact thread/context of ACL removal callback,
- exact local ACL state observed by the authorization thread,
- whether the authorization thread can observe the pre-removal immutable AclCache after removal has completed,
- request authorization result,
- append result,
- and a bounded repetition count if a race is tested.

Any observation of stale state must be tied to a concrete synchronization boundary. A mere delayed observation is not sufficient.

No architecture conclusion is permitted from this hypothesis alone.