# NCS — STOP finding: caller-controlled Proxy traps cross the Core data boundary

Date: 2026-10-17  
Branch: `ncs-clean-architecture`  
Status: architecture decision required; no code change made.

## Why this finding matters

Recent M0 work rejects ordinary accessor properties and avoids dispatch through a caller-controlled array `.find`. Those protections do not establish that inspection of an arbitrary caller-owned JavaScript object graph is side-effect free.

## Source evidence

- `src/nexo/core/contracts.mjs` at the current branch head calls `Object.getPrototypeOf(value)`, `Reflect.ownKeys(value)`, and `Object.getOwnPropertyDescriptor(value, key)` from `assertDeepFreezable()`. `assertContractInput()` invokes that validator on caller-owned input before constructor field reads.
- `src/nexo/core/reconciliation.mjs` uses the same reflective operations in `assertPlainRecordShape()` and `assertPlainData()`.
- A JavaScript `Proxy` can define `getPrototypeOf`, `ownKeys`, and `getOwnPropertyDescriptor` traps. These reflective operations can therefore execute caller-supplied trap code before validation returns. This is a language/runtime property, not fixed by rejecting ordinary getters or avoiding `.find()`.

This report records source-level analysis; no CI test has been added or claimed for this finding.

## Architectural decision needed

The current in-process-object boundary cannot honestly promise that validation of arbitrary caller-controlled objects never invokes caller code. Before adding more defensive patches, decide the intended trust boundary:

1. **Serialized-data boundary:** accept a canonical wire representation (for example, bounded JSON text/bytes), parse it inside the trusted boundary, then validate the newly parsed graph. Define encoding, size/depth limits, duplicate-key handling, number semantics, and error outcomes before selecting this design.
2. **Trusted in-process caller boundary:** explicitly constrain who can call these constructors/reconciliation functions and treat their inputs as same-process trusted objects; do not claim hostile-object isolation for Proxy traps.
3. Another owner-approved root design with equivalent enforceable properties.

Option 1 is a candidate, not a selected decision. It may require a coherent contract/API redesign across Core constructors and reconciliation, not a narrow patch to a single validator. Do not silently mix serialized and live-object trust models.

## Next actions

- Review the existing MASTER/Core architecture and input call sites to identify which boundary is actually intended to receive untrusted data.
- Map current callers before selecting the wire contract; preserve current contract semantics and explicit INVALID/UNRESOLVED/UNKNOWN outcomes.
- If no approved trust boundary exists, record the decision as unresolved and stop before refactoring.
- Only after the boundary is selected, write a migration design and targeted regressions; run focused CI and read back source/tests.
- Do not add a Proxy rejection helper that itself uses reflective operations and falsely claims to detect all proxies.

## Activation and evidence limits

This finding does not establish an exploitable deployed path or prove that production inputs are adversarial. It establishes that the current reflection-based validators cannot guarantee zero caller-code execution for arbitrary Proxy inputs. STEP 7 remains **OPEN / STOP / UNKNOWN**; protected effects remain STOP. No authority, commissioning, deployment, or device wiring is authorized.
