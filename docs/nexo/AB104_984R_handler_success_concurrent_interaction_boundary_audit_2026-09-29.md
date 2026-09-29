# AB104.984R — handler SUCCESS contract is conditioned on absence of concurrent interaction

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
Does a CloudFormation resource-handler SUCCESS contract itself guarantee that no concurrent actor can mutate the resource between stabilization/Read observations and the terminal result?

## Fresh evidence
AWS's resource type handler contract explicitly states that its requirements are defined assuming no other concurrent interaction on the resource. The same contract requires Create/Update desired-state stabilization and uses Read to verify the requested properties. AWS also documents that runtime-state stabilization concerns whether additional mutating API calls can be made and whether dependent resources can consume the resource. Separately, AWS's CloudFormation troubleshooting documentation describes resources becoming inconsistent with the stack state when rollback is skipped, demonstrating that stack-level status and resource state can diverge when normal reconciliation boundaries are bypassed.

## Findings
1. The handler contract's stated assumption of no concurrent interaction is itself a semantic precondition; SUCCESS cannot be promoted into a universal serialization guarantee against all external actors.
2. Desired-state stabilization verifies the requested properties through the handler's observation boundary, but the contract does not by that statement establish exclusive ownership of the resource against concurrent mutation.
3. Therefore a successful handler result can coexist with a later or concurrent mutation by an actor outside the handler's serialization domain.
4. A provider/resource may expose stronger concurrency controls or conflict detection. If explicitly documented and exercised by the handler, those controls can strengthen the local boundary, but they do not become global serialization automatically.
5. This separates handler correctness under its contract from global history correctness: SUCCESS is evidence about the handler operation under declared assumptions, not proof that no external operation occurred.
6. A concurrent mutation that occurs after the relevant Read but before observation by another actor is a separate temporal/evidence fact; the later state must not be retroactively substituted for the earlier handler evidence.
7. No new top-level interaction class is justified. The result reinforces I7/I19/I21/I22 and classes 7, 8, 9, 11, 17, 18, 19; class 20 remains conditional.

## Anti-collapse
SUCCESS != GLOBAL_SERIALIZATION
HANDLER_CONTRACT != EXCLUSIVE_RESOURCE_OWNERSHIP
READ_VERIFICATION != NO_CONCURRENT_MUTATION
LOCAL_CONFLICT_CONTROL != GLOBAL_ORDER
HANDLER_SUCCESS != COMPLETE_GLOBAL_HISTORY
LATER_STATE != RETROACTIVE_HANDLER_STATE
UNKNOWN != FAILED

## Classification
Primary: I7, I19, I21, I22.
Interactions: classes 7, 8, 9, 11, 17, 18, 19.
Conditional: class 20 where a declared atomic boundary explicitly spans the handler and external actor domains.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.984R establishes an explicit contract boundary: CloudFormation's handler semantics are specified under an assumption of no concurrent interaction. Therefore SUCCESS is not a universal proof of exclusive ownership or global serialization. Nexo must record concurrency assumptions and preserve separate temporal/evidence domains for handler observations and external mutations.
