# NEXO AB105 G0 Kafka Runtime Continuity — 2026-10-01

## Canonical frozen anchor
- AB105.116R remains frozen and untouched.
- Kafka pinned revision: 99b940733a9f6bc409457dba7108f08421d81e42.
- PR #81 remains open, draft, unmerged.
- Current G0 branch head before this continuity commit: 414f9122d7999618d40d76c8a0c41868ba38d7cf.

## Recovery
The previously reported failed run 36933754051 executed commit 7a863fe2e383d4b3819fb42d429a4cf0e9560c55, not the corrected current head. Its failure was a harness-era NPE in synthetic TargetAuthorizer authorization:
StandardAuthorizerData.authorize -> clientAddress() == null.
This is harness evidence, not Kafka race evidence.

The next run on c7478b24 executed the corrected real-D1 harness but failed at test compilation:
ProducerRecord<>(TOPIC_NAME, 0, new byte[] {2}) inferred the integer partition as key type byte[].
No runtime witness was produced.

## Correction persisted
Commit 414f9122d7999618d40d76c8a0c41868ba38d7cf corrects D1 to:
new ProducerRecord<>(TOPIC_NAME, 0, null, new byte[] {2})
This preserves an explicit partition 0 while matching ProducerRecord<byte[], byte[]> typing.

## Required runtime witness
D1 remains a fresh independent real Kafka Producer authorization path; no TARGET.authorize() synthetic call.
Required order:
A1 observed -> D0 observed/held -> D1 denied -> D2 released and successful -> E baseline/after proving exactly one append.

Expected witness:
G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1

## Epistemic state
- BOOTSTRAP_COMPILE: previously observed SUCCESS.
- G0_HARNESS_COMPILE: corrected again pending current-head execution.
- A1: UNKNOWN for the corrected head.
- D0: UNKNOWN for the corrected head.
- D1: UNKNOWN for the corrected head.
- D2: UNKNOWN for the corrected head.
- E: UNKNOWN for the corrected head.
- EXACT_RACE: UNKNOWN.
- EXPLOITABILITY: UNKNOWN.
- No claim is elevated without a recoverable artifact/witness from the corrected head.

## Next action
Use the workflow run triggered by the current corrected branch head to inspect compile and runtime output and recover the bootstrap evidence artifact. If compilation passes, audit the complete A1 -> D0 -> D1 -> D2 -> E witness before any status elevation.
