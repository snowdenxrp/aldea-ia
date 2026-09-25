# NEXO AB30 — P_AA 2/3-EVENT DEPENDENCY TABLES, UNKNOWN SEMANTICS, AND KERNEL FACTORIZATION ATTACK V1 — 2026-09-24

Status: RESEARCH ONLY. No implementation. No TLA+ execution. No TLC execution. No formal proof claimed.

## 1. External methodology cross-check
Lamport's Auxiliary Variables paper explicitly describes history variables as a way to retain past behavior needed for refinement mappings, and distinguishes them from stuttering variables. Lamport's material also describes refinement as a mapping between implementation behavior and a higher-level specification. The Reduction Theorem is specifically intended to reason about a fine-grained specification using a coarser-grained one. These are methodological constraints, not proof of this model.

## 2. Two-event dependency table
| Event pair | Direct P_AA order may matter? | Required binding condition | Main reason |
|---|---|---|---|
| AuthorityRevoke / Admit | YES | same authority context | admission before/after revocation |
| EpochAdvance / Admit | YES | same epoch-bound authority | stale/current epoch distinction |
| DelegationChange / Admit | YES | affected delegation chain | delegation validity |
| PolicyChange / Admit | YES | affected policy context | compatibility |
| ResourceReincarnate / Admit | YES | same resource | incarnation mismatch |
| LeaseExpire / Admit | YES | same bridge/lease | freshness/expiry |
| LeaseIssue / Admit | YES | same bridge | decision-to-admission bridge |
| Retry / Admit | YES | same operation/attempt relation | actual attempt binding |
| Decide / Admit | CONDITIONAL | same decision/bridge | protocol linearization |
| Abort / Admit | CONDITIONAL | same pending admission | existence/linkage semantics |
| AuthorityRevoke / PolicyChange | CONDITIONAL | shared authority/policy dependency | joint invalidation |
| DelegationChange / PolicyChange | CONDITIONAL | shared admission context | combined validity |
| DelegationChange / Reincarnate | CONDITIONAL | shared bridge/resource | bridge invalidation |
| PolicyChange / LeaseExpire | CONDITIONAL | same lease/policy context | protocol-specific validity |
| Retry / LeaseExpire | CONDITIONAL | same attempt/bridge | replay/expiry interaction |
| unrelated events | NO unless future binding creates dependency | none initially | candidate stuttering/irrelevance |

## 3. Three-event joint dependency table
| Events | Pairwise appearance | Joint risk | Required treatment |
|---|---|---|---|
| PolicyChange + DelegationChange + Admit | each can appear independently irrelevant under some state | combined invalidation can change witness validity | preserve joint closure |
| DelegationChange + Reincarnate + Admit | pairwise effects may be masked | bridge can become invalid through two independent dimensions | preserve both bindings and order |
| LeaseIssue + PolicyChange + Admit | lease may look structurally valid | policy can invalidate bridge before admission | retain issuance/invalidating order |
| LeaseExpire + Retry + Admit | each can be separated by attempt | retry may not inherit old bridge | retain attempt and bridge history |
| Decide + Revoke + Admit | decision may be historically valid | decision cannot bypass later authority invalidation unless protocol says so | retain protocol/order semantics |
| PolicyChange + DelegationChange + Reincarnate | final state may be same across permutations | different intermediate validity can produce different admission result | do not collapse by final state |

## 4. UNKNOWN is not an ordinary truth value
Candidate semantic domains must distinguish world/claim truth from epistemic support.
Use a typed assessment rather than Boolean:
TRUE_JUSTIFIED — required concrete/abstract obligations established.
FALSE — a concrete or sound abstract countercondition establishes violation.
UNKNOWN — available representation cannot establish truth or falsity.

UNKNOWN must not be interpreted as FALSE, TRUE, or SUCCESS/FAILURE.
It is an epistemic assessment state.

## 5. UNKNOWN transition rule
If a transition destroys a distinction required by P_AA but does not establish a counterexample, the abstract result becomes UNKNOWN rather than FALSE.
If a transition restores sufficient evidence, the result may return from UNKNOWN to TRUE_JUSTIFIED.
Thus claim assessment is not necessarily monotonic under information loss or restoration.

## 6. Unknown countermodels
CM-AA211 — missing revocation order yields UNKNOWN, not FALSE.
CM-AA212 — missing admission linkage yields UNKNOWN, not TRUE.
CM-AA213 — missing lease-consumption history yields UNKNOWN.
CM-AA214 — incomplete policy history yields UNKNOWN.
CM-AA215 — incomplete delegation history yields UNKNOWN.
CM-AA216 — unknown incarnation transition yields UNKNOWN.
CM-AA217 — unknown boundary history yields UNKNOWN.
CM-AA218 — current valid state incorrectly used to infer historical admission validity.
CM-AA219 — current invalid state incorrectly used to infer historical admission invalidity.
CM-AA220 — UNKNOWN collapsed into a safety violation without a sound counterexample.

## 7. Observation function attack
The admission-keyed observation structure is stronger than a global Boolean because each actual admission has its own binding and history.
However, observation must not accidentally reveal more than P_AA requires.
Candidate:
`Obs_AA(h) = { admission_id -> Assessment_AA }`
where Assessment_AA contains only claim-relevant status plus required provenance flags.

If admission identity itself is not relevant to a future continuation, identity may later be quotiented. That quotient is not assumed yet.

## 8. Kernel factorization attack
Candidate:
`K_AA = AA_Norm + LeaseBridge + AdmissionBindingClass + ResidualOrder`

Test for ResidualOrder = empty:
1. all P_AA-relevant order facts recoverable from AdmissionBindingClass;
2. all protocol order facts recoverable from LeaseBridge;
3. replay/consumption order recoverable from bridge state/history;
4. invalidation order recoverable from authority/policy/delegation/incarnation semantics;
5. every future P_AA continuation remains equivalent.

Failure of any condition leaves a non-empty ResidualOrder.

## 9. Factorization countermodels
CM-AA221 — same binding class, different revoke/admit order.
CM-AA222 — same lease bridge fields, different replay order.
CM-AA223 — same lease and binding, different policy transition order.
CM-AA224 — same lease and binding, different delegation transition order.
CM-AA225 — same lease and binding, different incarnation boundary order.
CM-AA226 — same current normalized state, different historical invalidation order.
CM-AA227 — same bridge, different decision/admission linearization.
CM-AA228 — same binding and bridge, different retry ordering.
CM-AA229 — same current observation, different future order support.
CM-AA230 — same all visible fields, different hidden event multiplicity affecting replay.

## 10. Preliminary result of factorization attack
The attack does not establish that ResidualOrder is empty.
At minimum, replay consumption, invalidation ordering, and decision/admission linearization remain candidates for residual history unless their semantics are fully encoded in LeaseBridge or AdmissionBindingClass.

Therefore no component may yet be deleted from the kernel.

## 11. Refinement consequence
History variables remain legitimate candidates rather than implementation state. Lamport explicitly notes that auxiliary variables may be added to permit construction of a refinement mapping and need not be implemented. citeturn0search24

That means the eventual TLA+ model may contain history variables even if the real implementation does not store the same representation, provided the refinement construction is valid.

## 12. Bounded exploration consequence
The next finite model should not merely enumerate timestamps. It should enumerate bounded event instances and their legal partial orders, bindings, and protocol classes.
This is still bounded exploration. It cannot establish general completeness.

## 13. Result
AB30 produces explicit two-event and three-event dependency tables, attacks the UNKNOWN semantics, and tests whether order can be completely factored into the other kernel components.
Current result: UNKNOWN is a distinct epistemic assessment; order factorization is not closed; ResidualOrder remains a live semantic candidate.

## 14. AB31 frontier
1. Build the complete event-pair matrix including all bindings and protocol classes.
2. Construct minimal 3-event countermodels for every conditional pair.
3. Formalize UNKNOWN as a three-valued/typed claim assessment without allowing truth collapse.
4. Determine whether ResidualOrder can be encoded entirely in LeaseBridge plus AdmissionBindingClass plus auxiliary history.
5. Define the smallest finite bounded domains and event-instance cardinalities.
6. Draft the abstract state/action vocabulary only if the above survives.