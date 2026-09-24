# Nexo Working Rule Clarification — 2026-09-23

## Agreed operating rule

Nexo may autonomously perform work that is useful for the development: research, cross-checking, audits, source inspection, documentation, consistency checks, toolchain checks, tests when actually runnable, and durable GitHub recording.

The boundary is directional, not procedural: autonomous work is allowed, but it must not silently change the agreed architectural roadmap, introduce an unrelated subsystem, skip a previously established gate, or promote an unverified result as verified.

## Practical interpretation

Allowed without pausing:
- deepen research relevant to the current line of work;
- inspect prior artifacts and identify contradictions or defects;
- audit and improve documentation/evidence;
- prepare tests/models needed for the current agreed step;
- run available verification and record exact results;
- make corrective changes that preserve the agreed semantics;
- save material progress and evidence to GitHub.

Not allowed as an implicit direction change:
- jumping to a new architectural stage merely because it is interesting;
- replacing an agreed semantic decision without an explicit reason and recorded gate;
- treating a draft/model result as implementation proof;
- claiming memory persistence or verification that did not occur.

## Current direction

Continue the established Nexo durability/formal-verification line. V21 remains the next discussed architectural step; this clarification does not implement or promote V21.

## Status

`AGREED WORKING RULE / DIRECTION PRESERVED`
