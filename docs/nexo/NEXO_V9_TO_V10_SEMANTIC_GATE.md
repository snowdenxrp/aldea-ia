# V9 → V10 Semantic Gate — 2026-09-23

V9 source inspection found the previously identified historical-authority contradiction still present in the stored file (`NoCommitDuringInvalidAuthority`). This is now treated as a hard gate: V10 must not inherit it.

## Gate decisions

1. Historical `COMMITTED` state is durable history, not proof of currently valid authority.
2. Current authority is required at admission/release/commit transition points.
3. Revocation fences active work and invalidates pending release authorization.
4. Lease generation is temporal ownership fencing, not truth about external effects.
5. Lease expiry changes coordination state only.
6. Evidence validity is independently evaluated and may survive a lease takeover if still fresh and context-compatible.
7. STOP cannot be cleared by lease expiry, takeover, restart, or recovery acquisition.

## Hard prohibitions

V10 must not encode any of these equivalences:

`COMMITTED => authority currently valid`

`lease expired => effect absent`

`new generation => new authority`

`takeover => evidence invalid`

`restart => release`

`STOP verified => external effect cancelled`

## Promotion criteria for V10

Before calling the model a candidate for formal checking:
- source syntax must be self-contained;
- all finite domains must be defined;
- no known contradictory invariant/action pair may remain;
- lease expiry/takeover must be explicit;
- stale-owner guards must be explicit;
- STOP/release ordering must be explicit;
- transition obligations must be distinguished from state invariants.

Status: GATE ACTIVE.
