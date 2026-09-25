# AB104.23 — Renewal/consumption negative-evidence boundary and historical-law crosscheck — 2026-09-25

Status: RESEARCH ONLY. No protocol law inferred, no semantic freeze, no formal verification.

## Purpose

Continue AB104.22 by directly recovering the strongest historical renewal/lease/replay artifacts that are reachable through GitHub commit history, and record exactly what they do and do not establish.

## Directly recovered evidence

### AB18 — commit 321fc62a8e648809702f2747a89755208f6d9227

AB18 defines a candidate complete LeaseBridge containing:
SubjectBinding, OperationBinding, AttemptBinding, ResourceBinding, ResourceIncarnationBinding, AuthorityContextBinding, PolicyCompatibilityBinding, DelegationValidityBinding, CapabilityScopeBinding, BoundaryBinding, FreshnessValidity, ReplayBinding, TemporalValidity.

It explicitly treats this as a completeness candidate and leaves formal completeness/minimality open. It does not provide a concrete LEASE_RENEW or LEASE_CONSUME transition law.

### AB49 — commit b4dfd5553826073a3099f7e2b8ad11327b6a1781

AB49 names lease interval, expiry, renewal, consumption and replay as allowed HistorySupport primitives and defines L3 renewal semantics, L4 replay/consumption, and L7 renewal authority as separator dimensions.

This is a support-language/separator specification, not a concrete Pre/Post/Frame/Invalidation/AdmissionLink law for those events.

### AB84 — commit 2970b4f336baa9a2e23da8dca5ba0bcc00b52f40

AB84 explicitly audits LEASE_RENEW and records C2 legality, C3 post-state, C4 frame/invalidation and C6 exhaustive successor domain as UNKNOWN. It also records unresolved extension-versus-replacement, expiry eligibility, authority/policy interaction, bridge retention/rebinding and replay/history effects.

### AB85 / AB86 / AB87 recovery chain

The recovered renewal branch confirms that subsequent targeted recovery did not close the renewal law. AB87's crosscheck explicitly retains:
LEASE_RENEW C2=UNKNOWN, C3=UNKNOWN, C4=UNKNOWN, C6=UNKNOWN.

### AB88 / AB92

These establish that event order can be P_AA-relevant for the explicitly modeled invalidation events, while not establishing a ternary collision or completing renewal/consumption semantics.

## Negative-evidence boundary

The reachable historical corpus establishes the semantic dimensions that renewal/consumption must answer, but does not supply an authoritative complete transition law for either event.

Failure to recover a file through a particular GitHub search route is NOT evidence that the file never existed.

The correct status remains:

LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_SEPARATOR = CANDIDATE_ONLY
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
AB65_EXECUTION = NOT_VERIFIED

## Important boundary

Do not import the separate V13/V14/V15 coordination-lease kernel as Nexo P_AA renewal semantics. Those artifacts may provide design precedents for lease expiry/fencing, but are not protocol evidence for this authorization claim.

Do not modify AB61/AB65 semantics to manufacture completeness.

Do not promote ReplayState.consumed_attempts into a protocol rule merely because AB100 can represent it.

## Next exact action

Search the remaining historical source chain for a concrete action contract that explicitly specifies replay/consumption or renewal Pre/Post/Frame/Invalidation/AdmissionLink. If none is recovered, the next bounded research target is reconstructibility from canonical event/order support without adding an oracle.

