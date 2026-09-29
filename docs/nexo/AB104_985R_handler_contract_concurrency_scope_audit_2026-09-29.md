# AB104.985R — handler contract concurrency assumption is not a runtime lock

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does the CloudFormation resource-handler contract's assumption of no concurrent interaction amount to an enforcement mechanism that prevents concurrent actors, or is it only a precondition under which handler correctness is specified?

## Fresh evidence
AWS states that the resource handler contract applies assuming no other concurrent interaction on the resource. The contract requires create/update SUCCESS only after desired-state properties have been applied and explains that desired-state stabilization includes handling eventual consistency. AWS also documents that runtime stabilization is optional and that dependent resources may be created concurrently under CloudFormation's deployment strategies. Contract tests validate handler behavior and live state, but the documented contract assumption itself is not presented as a global lock or fencing mechanism.

## Findings
1. The phrase “assuming no other concurrent interaction” is a contract precondition, not evidence of a universal runtime lock.
2. Contract tests establish compliance with specified handler behavior; they do not transform the contract assumption into global mutual exclusion.
3. CloudFormation can intentionally create dependent resources concurrently, so concurrency exists at the orchestration level even when a particular handler contract reasons about one resource in isolation.
4. Therefore handler correctness under its contract and global serialization across actors/domains are separate claims.
5. A provider may enforce stronger per-resource concurrency or conflict controls; such controls must be separately evidenced and scoped.
6. A later SUCCESS therefore remains evidence about the handler operation under its stated assumptions; it does not retroactively prove that no external actor touched the resource during the interval.
7. No new top-level interaction class is justified. The finding reinforces I7/I19/I21/I22 and classes 7, 8, 9, 17, 18, 19.

## Anti-collapse
CONTRACT_PRECONDITION != RUNTIME_LOCK
CONTRACT_TEST_PASS != GLOBAL_SERIALIZATION
HANDLER_CORRECTNESS != GLOBAL_HISTORY_CORRECTNESS
ORCHESTRATOR_CONCURRENCY != HANDLER_EXCLUSIVITY
LOCAL_CONFLICT_CONTROL != GLOBAL_FENCING
SUCCESS != NO_CONCURRENT_ACTOR
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 7, 8, 9, 17, 18, 19.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.985R distinguishes a documented concurrency assumption from an enforced serialization primitive. CloudFormation's handler contract can define correctness under a no-concurrent-interaction precondition, while global concurrency control requires independent evidence. Nexo must never infer a lock, fencing epoch, or global serialization guarantee merely from contract compliance or terminal SUCCESS.
