# STEP 7 — Minimum Real Bootstrap Root Basis Attack — 2026-10-08

Status: ATTACK COMPLETE — DESIGN SURVIVES; IMPLEMENTATION PENDING REAL BASIS

1. Genesis self-authorization: rejected. The bundle cannot be its own authority.
2. Local-state bootstrap: rejected. Nexo memory/state cannot establish its own first trust.
3. Provider bootstrap: rejected. Model/provider remains proposal-only.
4. Integrity-only bootstrap: rejected. Good boot integrity does not by itself establish constitutional authority.
5. External-authority overreach: rejected. The external basis establishes only the bounded bootstrap relation, not unrestricted mission authority.
6. Shared dependency attack: rejected. Apparent external support that depends on the candidate Nexo state fails independence closure.
7. Recovery circularity: rejected. Recovery must retain an independent trust path.
8. Revocation blindness: rejected. Historical bootstrap credentials do not imply currentness.
9. Succession confusion: rejected. A successor root requires an explicit protected transition; it is not a normal version upgrade.
10. Vendor lock-in: rejected. Semantic Core contract does not select the physical mechanism.
11. Availability-as-trust: rejected. Reachability/availability cannot establish authority.
12. Multi-root false independence: rejected. Multiple processes/keys sharing one underlying trust/failure domain do not become independent roots.
13. Emergency escalation: rejected. Emergency recovery authority cannot silently become permanent constitutional authority.
14. Snapshot resurrection: rejected. A recovered genesis snapshot cannot restore current authority without the independent bootstrap/recovery rule.
15. Future mechanism replacement: rejected as a silent migration. Root mechanism replacement must use governed succession.

## Architectural conclusion
The minimum real bootstrap relation is now explicit and does not require inventing a concrete hardware/cloud mechanism prematurely.

Implementation remains blocked until Nexo's deployment threat model chooses an actual bootstrap basis class and the corresponding independent trust path can be represented/tested.

Do not implement a generic `isTrusted` flag or constructor as a substitute.