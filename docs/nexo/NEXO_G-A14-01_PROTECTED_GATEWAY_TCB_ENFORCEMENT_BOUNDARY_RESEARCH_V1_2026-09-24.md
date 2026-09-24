# NEXO G-A14-01 — Protected Gateway TCB and Enforcement Boundary
## Research Delta V1 — 2026-09-24

Status: DESIGN RESEARCH / CODE STUDY / ADVERSARIAL
No implementation. No formal proof.

## 1. Question
Can a protected gateway serve as the universal enforcement point for safety-relevant effects without becoming an unmanageably large TCB or leaving unsafe bypasses?

## 2. Evidence studied
Linux Landlock is a useful negative/positive case: enforcement is in the kernel, rules are monotonic (only additional restrictions can be added), and the documentation explicitly warns that user-space enforcement can suffer race/inconsistent-state problems. It also documents concrete limitations such as pre-existing file descriptors escaping later path restrictions. cite turn0search1 turn0search3

Kubernetes admission is a useful control-plane analogue: admission is an enforcement point, but it has bounded timeouts, failure policies, reinvocation, side-effect reconciliation, and dependency loops. This demonstrates that a gateway is not automatically authoritative merely because requests pass through it. cite turn0search0 turn0search2 turn0search4 turn0search5

Fuchsia's component capability routing shows another useful pattern: capabilities can be routed between components, and tooling can inspect the route and its source. This supports auditable capability topology, but routing correctness still depends on the platform enforcement boundary. cite turn0search9

## 3. Central conclusion
A gateway can be a strong enforcement boundary only if every safety-relevant effect is forced through it or through a separately equivalent protected boundary.

Therefore:

UNIVERSAL GATEWAY
is not a property of architecture diagrams.

It is a property requiring:
1. complete effect-path enumeration;
2. structural prevention of bypass;
3. protected authorization validation;
4. currentness/fence validation;
5. exact target/effect binding;
6. durable evidence of admission;
7. explicit handling of gateway failure.

## 4. Gateway TCB minimization
The gateway should not contain:
- planning;
- model inference;
- ordinary memory;
- analytics;
- UI;
- optimization;
- large policy authoring logic;
- provider-specific business logic where avoidable.

Candidate gateway responsibilities:
- authenticate caller identity;
- validate capability/authority context;
- validate operation/effect identity;
- validate target binding;
- validate footprint epoch;
- validate authority epoch/fence;
- validate STOP;
- validate VersionSet/policy/invariant context;
- perform final protected admission;
- issue or validate provider-bound effect identity;
- durably record admission result;
- emit context-bound evidence.

This keeps the safety decision surface small.

## 5. Gateway is not world truth
Even a successful gateway admission proves at most that the protected system authorized an effect attempt under a particular context.

It does not prove:
- provider accepted it;
- provider executed it;
- remote effect occurred;
- effect was not duplicated;
- effect was reversed;
- world state matches expectation.

Those remain effect identity + reconciliation + evidence concerns.

## 6. Bypass taxonomy
Every safety-relevant effect path must be classified:

B0 Gateway-mediated
B1 Equivalent protected boundary
B2 External provider direct path with enforceable contract
B3 Unenforceable/direct path
B4 Emergency physical path

B2/B3/B4 require explicit semantics; they cannot be silently treated as B0.

For B3, protected architecture must conservatively treat authority enforcement as incomplete and restrict/hold the affected release.

## 7. Hidden bypasses
Potential bypass classes:
- direct network access;
- raw device access;
- filesystem/control socket;
- provider SDK called outside gateway;
- admin/debug interface;
- emergency code path;
- recovery code path;
- migration tool;
- plugin mechanism;
- cached connection/session;
- pre-existing handle/capability;
- side-channel control path.

A gateway claim is invalid if an unmodeled bypass can create the same protected effect.

## 8. Pre-existing handle problem
Landlock documents that some restrictions do not retroactively restrict resources obtained before sandboxing. cite turn0search3

Nexo analogue:
A provider connection/session/handle acquired before capability restriction may retain authority.

Therefore footprint enforcement must account for:
- existing handles;
- existing sessions;
- delegated capabilities;
- cached credentials;
- queued commands;
- in-flight effects.

"New requests go through the gateway" is insufficient.

## 9. Revocation semantics
Gateway revocation can prevent new admitted effects, but cannot necessarily cancel an already submitted remote effect.

Therefore:
REVOCATION
→ BLOCK NEW ADMISSION

does not imply:
REVOCATION
→ REMOTE EFFECT CANCELLED.

The latter remains provider-specific reconciliation.

## 10. Gateway failure
If gateway availability is required for safety admission, failure should not silently become success.

Candidate semantics:
GATEWAY_UNAVAILABLE
→ no new independent safety-critical effect admission.

Existing effects:
→ preserve lifecycle/UNKNOWN/reconciliation state.

This is distinct from general availability policy for non-safety functions.

## 11. Gateway timeout
Timeout creates an ambiguous result:
- request may have reached provider;
- provider may have accepted;
- gateway may have crashed before durable response.

Therefore:
TIMEOUT
≠
NO_EFFECT

The existing stable operation_id/effect_key and reconciliation protocol remains mandatory.

## 12. Gateway retry
Retry must reuse protected effect identity where semantics are retry-safe.

NEW ATTEMPT
≠
NEW EFFECT.

If outcome is UNKNOWN, a new operation ID cannot be used to erase the old effect.

## 13. Gateway-side effects
The gateway itself may:
- reserve resources;
- increment epochs;
- allocate provider handles;
- emit durable intent;
- acquire fencing.

These are safety-relevant effects and require explicit lifecycle/recovery semantics.

Kubernetes admission demonstrates why side effects during an admission chain require reconciliation when later validation can reject the request. cite turn0search2 turn0search5

## 14. Gateway and dynamic footprint
Gateway admission must validate the final concrete footprint, not merely planner declarations.

Candidate final check:
operation_id
effect_key
target fingerprint
resource bindings
provider domain
footprint_epoch
authority epoch
VersionSet
PolicyBaseline
InvariantBaseline
STOP/fence
recovery/decommission status
dependency closure assurance.

Only after this check can it create provider-bound admission.

## 15. Emergency STOP
STOP should not depend solely on the ordinary gateway path.

If the gateway itself is compromised or unavailable, a separate STOP path may be required.

But that path becomes:
- another protected enforcement boundary;
- part of the STOP TCB;
- subject to evidence/verification;
- subject to reconciliation.

Therefore emergency path is not an exception from architecture; it is an explicitly modeled second boundary.

## 16. Provider adapters
A universal gateway does not require universal provider semantics.

Provider adapters can translate:
PROTECTED EFFECT BINDING
→ provider-specific invocation.

But the adapter must not be allowed to silently widen:
- target;
- parameters;
- authority;
- effect identity;
- provider domain.

A changed provider mapping invalidates affected VersionSet/adapter evidence.

## 17. Gateway minimality test
A candidate gateway remains tractable if its correctness can be stated mostly as:
- validate;
- compare;
- fence;
- reject;
- linearize;
- durably record;
- emit evidence.

If the gateway begins planning, interpreting arbitrary model output, discovering unrestricted dependencies, or implementing large provider-specific workflows, TCB size grows and the architectural boundary weakens.

## 18. Gateway completeness proof
To claim gateway universality, Nexo needs an effect-path inventory:

EffectClass
→ entry points
→ provider adapters
→ direct paths
→ handles/sessions
→ emergency paths
→ recovery/migration paths
→ enforcement boundary
→ evidence path.

Completeness of this inventory is itself a claim and must be versioned/audited.

Unknown effect path:
→ cannot claim universal gateway coverage.

## 19. New contracts
PSC-81 — Gateway Enforcement Boundary
PSC-82 — Effect-Path Completeness
PSC-83 — Gateway Minimality
PSC-84 — Pre-existing Handle Closure
PSC-85 — Gateway Failure Closed
PSC-86 — Gateway Timeout Unknown
PSC-87 — Emergency Path Explicitness
PSC-88 — Provider Adapter Non-Widening

## 20. New invariants
INV-GA14-01-93:
No safety-relevant effect is considered gateway-covered unless every known path to that effect is either gateway-mediated or governed by an equivalent protected boundary.

INV-GA14-01-94:
Unknown effect path prevents a universal gateway claim.

INV-GA14-01-95:
Gateway authorization does not prove external-world outcome.

INV-GA14-01-96:
Gateway failure cannot authorize a new safety-critical effect.

INV-GA14-01-97:
Pre-existing handles/sessions/capabilities are part of the effect-path closure.

INV-GA14-01-98:
Gateway timeout preserves effect UNKNOWN semantics.

INV-GA14-01-99:
Emergency enforcement paths are explicitly modeled protected boundaries.

INV-GA14-01-100:
Provider adapters cannot silently widen the protected effect binding.

## 21. Mini-audit
No contradiction found with A01-A14 or previous G-A14-01 deltas.

Important negative result:
A gateway does not automatically reduce the TCB. It reduces the TCB only if the gateway can be kept small AND bypass paths are structurally controlled.

The most dangerous false assumption is:
"all API calls go through the gateway, therefore all effects are controlled."

Pre-existing handles, direct provider paths, emergency paths, recovery tools, and queued/in-flight effects invalidate that inference.

## 22. Status
Gateway boundary: DESIGN REFINED.
Gateway universality: OPEN.
Gateway minimality: DESIGNABLE.
Effect-path completeness: OPEN.
Emergency path: DESIGN REFINED.
Provider adapters: OPEN.
Formal verification: NOT PROVEN.
Implementation: NOT STARTED.

Next research target:
Study concrete gateway/broker patterns and direct-device/provider exceptions, then build an adversarial effect-path inventory model. The goal is to determine whether Nexo should require a single gateway, multiple equivalent protected boundaries, or a capability-gated effect mesh with explicit coverage proofs.
