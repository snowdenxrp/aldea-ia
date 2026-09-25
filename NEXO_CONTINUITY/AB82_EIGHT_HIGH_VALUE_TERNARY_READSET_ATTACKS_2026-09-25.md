# AB82 — EIGHT HIGH-VALUE TERNARY READ-SET ATTACKS — 2026-09-25

Status: RESEARCH ONLY. No implementation, semantic freeze, TLC/TLAPS, or formal verification.

AB82 executes the eight highest-value AB54 ternary attacks at the schema level. It does not invent missing protocol rules and does not claim exhaustive protocol closure.

## Method

For each attack:
1. equalize all AB51 lower-arity retained facts;
2. use AB54's explicit protocol read-set;
3. identify whether a genuinely irreducible ternary predicate is explicitly read;
4. if not decidable because transition legality/post-state/domain is incomplete, preserve UNKNOWN;
5. do not treat absence of a named joint field as proof of non-readability.

## Results

| # | Triple | Explicit joint ternary read? | Complete C2/C3/C6? | Classification |
|---|---|---|---|---|
| 1 | POLICY_CHANGE + DELEGATION_CHANGE + ADMIT | No explicit arbitrary ternary predicate; dependencies are policy/delegation/binding based | No | UNKNOWN |
| 2 | DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT | No explicit arbitrary ternary predicate; reads delegation/incarnation/linkage | No | UNKNOWN |
| 3 | LEASE_RENEW + POLICY_CHANGE + ADMIT | No explicit arbitrary ternary predicate; renewal + policy compatibility are named separately | No | UNKNOWN |
| 4 | LEASE_EXPIRE + RETRY + ADMIT | No explicit arbitrary ternary predicate; expiry + attempt/retry binding are named separately | No | UNKNOWN |
| 5 | DECIDE + AUTH_REVOKE + ADMIT | No explicit arbitrary ternary predicate; decision context and current authority are separate | No | UNKNOWN |
| 6 | RECHECK + MUTATION + ADMIT | No explicit arbitrary ternary predicate; exact fact-set/mutation/result linkage is required but incomplete | No | UNKNOWN |
| 7 | RETRY + LEASE_CONSUME + ADMIT | No explicit arbitrary ternary predicate; attempt and replay/consumption are separate reads | No | UNKNOWN |
| 8 | RESOURCE_REINCARNATE + LEASE_RENEW + ADMIT | No explicit arbitrary ternary predicate; incarnation and renewal semantics are separate | No | UNKNOWN |

## Interpretation

The eight attacks do NOT produce a concrete P_AA ternary collision.

They also do NOT establish that no ternary collision exists.

The strongest bounded conclusion is:

- the currently explicit AB54 read-set vocabulary does not itself expose an arbitrary irreducible ternary predicate;
- however, several transitions still have unresolved legality, post-state, invalidation propagation, and exhaustive successor-domain semantics;
- therefore protocol residual classification remains UNKNOWN rather than NOT_FOUND.

## Important distinction

AB52 proved a mathematical lower-arity gap. AB54 supplied explicit named transition reads. AB82 shows that none of the eight highest-value attacks can presently be promoted from that mathematical gap to a concrete P_AA residual using only the recovered explicit read-set vocabulary.

This is a bounded schema-level negative result, not a theorem of ternary sufficiency.

## Gate

Do not:
- declare ternary sufficiency;
- eliminate HistorySupport;
- merge LeaseBridge with AdmissionBindingClass;
- expand to arbitrary four-event relations;
- begin semantic freeze;
- modify AB61/AB65 semantics.

## Next exact action

Recover or formalize the smallest missing transition law for one attack, preferably RECHECK + MUTATION + ADMIT or LEASE_RENEW + POLICY_CHANGE + ADMIT, while preserving UNKNOWN for every unresolved field. If no such law exists in prior evidence, record the protocol-semantic boundary explicitly before any broader enumeration.
