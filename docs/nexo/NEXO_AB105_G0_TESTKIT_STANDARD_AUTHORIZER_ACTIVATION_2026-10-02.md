# AB105 G0 — StandardAuthorizer TestKit activation finding

Date: 2026-10-02 UTC
Pinned Kafka revision: 99b940733a9f6bc409457dba7108f08421d81e42

## New verified source finding

KafkaClusterTestKit contains an explicit authorizer configuration path. In its server-property setup, when plain SASL is enabled, it sets:
- ServerConfigs.AUTHORIZER_CLASS_NAME_CONFIG = StandardAuthorizer.class.getName()
- StandardAuthorizer.ALLOW_EVERYONE_IF_NO_ACL_IS_FOUND_CONFIG = false
- StandardAuthorizer.SUPER_USERS_CONFIG = User:<Kafka plain admin>

Therefore the real TestKit path can activate StandardAuthorizer without replacing the authorizer with a fake implementation, provided the diagnostic uses the corresponding plain-SASL configuration.

## Consequence for the next experiment

The previous design gap "how to activate StandardAuthorizer in KafkaClusterTestKit" is now resolved at source level.

Required next construction:
1. Use KafkaClusterTestKit with the supported plain-SASL path.
2. Ensure the test principal is distinct from the configured superuser.
3. Create a target topic and explicit WRITE/metadata ACLs using real Admin operations.
4. Obtain a real producer/request path as the non-superuser.
5. Delete only WRITE through real Admin D0.
6. Observe broker metadata publication and issue a NEW request after D0 without waiting on the authorization result.
7. Capture the actual RPC authorization result separately from controller completion and local ACL observations.
8. Preserve an in-flight pre-D0 request only as a control, not as evidence of post-D0 stale authorization.

## Epistemic state

TESTKIT_STANDARD_AUTHORIZER_ACTIVATION=SOURCE_CONFIRMED
REAL_RPC_PATH=AVAILABLE_IN_TESTKIT
PUBLISHER_TO_RPC_VISIBILITY=UNKNOWN
PRODUCTION_PATH_TEST=NOT_PERFORMED
STALE_PROPAGATION_AUTHORIZATION=NOT_OBSERVED_IN_G0
IN_FLIGHT_AUTHORIZATION_WINDOW=OBSERVED
EXPLOITABILITY=UNKNOWN
GENERALIZATION=UNKNOWN
PRODUCTION_IMPACT=UNKNOWN
SECURITY_CONCLUSION=NOT_ESTABLISHED

AB105.116R remains canonical. Do not create AB105.117R while the semantic/attainability audit remains open.
