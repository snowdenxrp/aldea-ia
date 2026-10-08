# STEP 7 — Independence / Failure-Domain Contract Attack — 2026-10-08

Status: ATTACK COMPLETE — ROOT SEMANTICS SURVIVE

## Adversarial matrix
1. Same root, different keys → DEPENDENT.
2. Same provider, different accounts → DEPENDENT when provider/control plane is material.
3. Same organization, different vendors → potentially DEPENDENT; organizational separation alone is insufficient.
4. Different vendors, same firmware/platform dependency → DEPENDENT when that dependency can invalidate both.
5. Different devices, same recovery authority → DEPENDENT for recovery-related claims.
6. Different verifiers, same appraisal policy/root → DEPENDENT when that policy/root is material.
7. Different network paths, same trust anchor → DEPENDENT.
8. Different keys under one compromised root → DEPENDENT.
9. Same evidence copied to multiple verifiers → not independent evidence.
10. One verifier certifying its own independence → rejected; independence must be established from protected dependency information.
11. Unknown dependency graph → UNKNOWN, never independent by default.
12. New epoch/new key → not automatically independent.
13. Human recovery plus machine root sharing the same recovery authority → not independent.
14. Hardware root plus cloud attestation sharing the same provisioning authority → potentially common-mode; must evaluate the dependency.
15. Two valid compositions with different dependency assumptions → no arbitrary winner; preserve UNKNOWN until governed ordering/succession resolves the conflict.
16. Independence proven for firmware integrity → cannot be reused automatically for constitutional authority.
17. Availability failure → does not change DEPENDENT into INDEPENDENT or UNKNOWN into trusted.
18. Vendor diversity used as a score → rejected as a substitute for dependency closure.

## Important finding
The contract must not attempt to compute 'independence' from superficial diversity. It needs a protected, claim-specific dependency closure supplied/established by an authority outside the composition result itself.

## Implementation gate
Repository still lacks the concrete protected source that can establish this dependency closure for a real bootstrap. Therefore no generic independence engine is implemented.

## Decision
The semantic contract is accepted as the next architectural boundary. The concrete implementation remains PENDING the real bootstrap authority/dependency source.