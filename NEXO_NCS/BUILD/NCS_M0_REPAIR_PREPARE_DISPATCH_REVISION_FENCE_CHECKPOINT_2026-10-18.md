# NCS M0 — Repair preparation and conditional dispatch fence

Date: 2026-10-18  
Code/test head: [`64f8329aef2ba050e9600227e2661f56fb75e21d`](https://github.com/snowdenxrp/aldea-ia/commit/64f8329aef2ba050e9600227e2661f56fb75e21d)

## Implemented

### 1. Revision derived from strict persisted state

`scripts/nexo-repair-preparation.mjs` exports `prepareRepairAgainstPersistedState()`. It loads the actual environment through `loadStateStrict()`, obtains `stateRevision` from that snapshot, and asks the standalone Nexo continuity owner to commit PREPARED with that value. Callers no longer need to supply the revision number themselves to this preparation helper.

The owner enforces that new `repair_agent_state`, `repair_agent_needs`, and `repair_resource_state` intents contain a valid revision. Existing PREPARED entries cannot be rebound to a different revision. Legacy entries without a bound revision remain unresolved/UNKNOWN.

### 2. Dispatch only from durable PREPARED

`scripts/nexo-repair-dispatch.mjs` exports `dispatchPreparedRepair()`. It requires an owner and idempotency key, loads the Nexo continuity snapshot, and derives the operation from exactly one matching `prepared` journal entry. It does not trust a caller-provided action/target object as the journal identity.

It then:
1. strictly loads the persisted environment;
2. blocks before mutation if its durable `stateRevision` differs from the revision bound to PREPARED;
3. executes only one of the three convergent repair actions against that loaded state;
4. persists a changed state through the existing `persistState()` lock and expected-revision check, using `loadStateStrict` for the comparison;
5. leaves the Nexo journal PREPARED. It does not claim terminal settlement.

A concurrent environment writer that wins after the strict read should cause the conditional persistence to reject the stale expected revision; the in-memory mutation is not committed as the authoritative file. Persist/write ambiguity returns blocked UNKNOWN rather than success.

## Regression coverage

The restart test now exercises:
- strict snapshot → PREPARED revision binding;
- prepared-journal-derived dispatch;
- successful conditional environment persistence from revision 0 to 1;
- stale PREPARED dispatch refusal after the durable revision advances;
- refusal to dispatch an idempotency key that has no durable PREPARED entry;
- separate Nexo journal remaining PREPARED after environment persistence and simulated restart.

## Exact-head CI

Workflows were triggered on the exact code/test head; verify final conclusions before treating as PASS:
- Mission/restart: [39132820121](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820121)
- Semantic validation: [39132820068](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820068)
- Outcome classification: [39132820026](https://github.com/snowdenxrp/aldea-ia/actions/runs/39132820026)

## Remaining boundary

This is a **repair-only** conditional dispatch path, not a complete runtime migration and not settlement. The two files remain separate persistence domains. If the environment write succeeds but the process stops before terminal Nexo settlement, PREPARED remains unresolved; the existing read-only verifier is not yet authorized to settle it. No non-idempotent action is dispatched through this helper.

Next: verify exact-head CI, add any missing crash cut around conditional write failure/commit ambiguity, then design a narrowly scoped owner settlement that consumes repository-derived evidence and uses continuity `commitIfCurrent`. Do not add a generic transaction wrapper or claim cross-file atomicity. M0 incomplete; protected effects STOP; STEP 7 OPEN / STOP / UNKNOWN.
