# NCS M0 — Verifier registry accessor guard — 2026-10-22

## Finding

`createNexoContinuityOwner({ effectVerifiers })` enumerated verifier configuration with `Object.entries(effectVerifiers)`. `Object.entries` reads property values, so an accessor-backed registry entry could execute caller-provided getter code during owner construction, before any reconciliation request.

This was a real constructor-input boundary issue. It did not demonstrate authorization bypass or effect execution.

## Change

The owner now:
- requires the verifier registry to have `Object.prototype` or `null` as its prototype;
- enumerates own keys and rejects symbol keys;
- reads each property descriptor and requires an enumerable data property;
- validates the descriptor's value is a function before registering it;
- never evaluates registry getters during validation.

Proxy traps remain executable by JavaScript semantics during reflection; this guard is not a sandbox against hostile same-process Proxy code. The verifier registry remains configuration, not proof of authority or a trust anchor.

## Regression

Added to `tests/nexo/continuity-contract.test.mjs`: an accessor-backed `repair_agent_state` verifier registry must throw `NEXO_EFFECT_VERIFIER_REGISTRY_INVALID` while the getter invocation counter remains false.

## Commits

- Runtime: `d65245bdbcc20cdee7ebf315d6a65f162bcb894d`
- Regression: `796219c48fda52dd51e9eec4fa696cb48ec88096`

## CI evidence

On runtime commit `d65245bdbcc20cdee7ebf315d6a65f162bcb894d`, all 7 triggered workflows were confirmed successful:
- [Effect and settlement contract regressions](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861061988)
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861062010)
- [Bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861061995)
- [Integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861061947)
- [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861062137)
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861061944)
- [Repair settlement crash cuts](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861062106)
- [Chronicle native vertical](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861062041)

On regression commit `796219c48fda52dd51e9eec4fa696cb48ec88096`, the 5 workflows triggered for that SHA were confirmed successful:
- [STEP 5 outcome classification](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074339)
- [STEP 4 semantic validation](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074402)
- [Deterministic persistence tests](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074344)
- [Integrated acceptance regression](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074399)
- [Bounded mission admission and restart continuity](https://github.com/snowdenxrp/aldea-ia/actions/runs/39861074353)

These are the triggered workflows listed above, not a claim that every repository workflow ran.

## Scope / current gate

This protects verifier configuration registration against ordinary accessor properties. It does not authenticate verifier code, establish legitimate ownership, evaluate constitutional authorization, or enable effect dispatch. M0 remains incomplete; authorization remains `NOT_EVALUATED`; owner-root proof remains `PENDING/UNKNOWN`; protected effects remain `STOP`.

## Next work

Continue targeted review of public input boundaries and data returned from injected adapters, only where a concrete read-before-validation or resource-boundary defect can be shown. Add a regression before each runtime fix, verify the exact resulting SHA and triggered CI, and update STATUS. Do not add arbitrary global quotas or treat same-process hostile Proxy traps as sandboxable.
