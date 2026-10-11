# STEP 7 — Initial Genesis Threat Assumptions and Establishment-Path Comparison — 2026-10-11

Status: DESIGN ONLY — NO ASSUMPTION ACCEPTED — NO ROOT/VERIFIER/CHANNEL SELECTED — PROTECTED COMMISSIONING STOP

## Purpose

Continue the bounded next action from the initial owner-recognition path comparison. The owner reports no remembered pre-existing credential/medium but commits to doing the necessary work to build Nexo. This record turns the existing independent-recognition requirement (IR-1) and Genesis Trust Foundation gate into a minimum threat/assumption set and compares the two strongest path classes without selecting one.

This is not a new generic trust abstraction. It reuses:
- `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md`
- `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`
- `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`
- `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`
- `STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`
- `STEP_7_COMMISSIONING_DEPLOYMENT_FAILURE_CLAIM_INVENTORY_2026-10-11.md`

## Minimum claim

Before an uncommissioned Nexo instance accepts Kevin's initial constitutional authorization, a justified recognition boundary must establish that:
- the approver is Kevin acting deliberately and with informed intent;
- approval refers to the exact Constitution content/version, commissioning context, initial scope and one named protected transition;
- the recognition basis was not created, selected, authenticated or redefined solely by the uncommissioned candidate that consumes it;
- required provenance, freshness, replay protection, currentness/revocation and recovery status are established under a justified basis;
- a verifier cannot self-authorize or rewrite its own legitimacy rules;
- the final protected boundary enforces the exact accepted transition, and bypasses are within the stated claim boundary.

This claim does not mean a successful ceremony grants general mission, policy, execution, recovery or succession authority. Genesis recognition and constitutional authority remain distinct.

## Minimum threat and assumption set

Each proposed path must explicitly classify each row as verified, assumed, excluded from the threat model, or UNKNOWN. Silence is not acceptance.

| Threat / property | Minimum question | Consequence if not established |
|---|---|---|
| Candidate self-bootstrap | Can uncommissioned Nexo declare its own root, verifier, approval or provenance valid? | Reject that basis; UNKNOWN/STOP. |
| Presentation substitution | Can the displayed Constitution differ from the exact bytes/context submitted for approval? | Approval does not bind; UNKNOWN/STOP. |
| Approval forgery/replay | Can another process or old event produce, alter or replay approval? | No protected transition. |
| Verifier compromise | Can the candidate or same compromised component alter the verification rules or trust anchor? | Independence not established. |
| Currentness/revocation | Can an offline/rollback path accept a revoked, superseded or stale authority? | Remain UNKNOWN unless a bounded offline rule is justified. |
| Shared failure domain | Do presentation, approval, verifier, storage, recovery or enforcement share a compromise dependency? | Name it and bound the claim; otherwise UNKNOWN. |
| Recovery/replacement | Can a backup, recovery operator, replacement device or restored snapshot silently regain authority? | No recovery-to-authority promotion. |
| Final effect enforcement | Is the last controllable boundary identified, and can candidate Nexo bypass it? | Ceremony/log/signature is not enough; protected activation stays blocked. |
| Human factors | Can Kevin inspect the full relevant context, understand the scope, and intentionally approve rather than merely unlock/continue? | Do not interpret generic interaction as consent. |
| Lifecycle and loss | How are revocation, lost/replaced devices, compromised credentials and interrupted setup handled? | No indefinite or implicit authority. |

A threat excluded by assumption is not technically solved. The exclusion must be narrow, understandable, explicitly accepted by Kevin before use, and recorded as an environmental assumption with residual risk.

## Path comparison

### Path H — Human-supervised genesis with bounded environmental assumptions

**Potential contribution:** Kevin reviews the exact constitutional content/context and explicitly authorizes a narrowly scoped initial transition. This can provide evidence of human intent.

**Required assumptions if considered:** the presentation and approval path is not compromised in the ways that would allow substitution or forgery; the exact reviewed material is cryptographically/content-bound to what the verifier consumes; the verifier and final effect boundary do not simply trust caller-provided claims; currentness/replay/lifecycle and failure handling are defined.

**Hard limit:** if the same uncommissioned host/app controls both what Kevin sees and what the verifier accepts, the ceremony cannot claim resistance to that host's compromise. A signature or hash can bind data to a key/content, but does not independently establish that the key is legitimate, that Kevin approved it, or that the key remains current.

**Owner decision needed later:** whether to accept any explicitly stated residual environmental assumptions for a bounded first-boot transition. Kevin's general commitment to build Nexo is not acceptance of these assumptions.

**Disposition:** candidate only; not accepted, implemented or proven.

### Path O — Out-of-band establishment of a pre-recognized owner-controlled basis

**Potential contribution:** establish a recognition basis before the candidate asks for authority, so that a separate verifier can validate exact-context approval under known rules.

**Required establishment event:** a non-circular account of why the initial basis itself is recognized. It must identify who/what creates or provisions it, how Kevin verifies its identity and scope, what prevents the commissioning candidate from substituting it, and what independently enforces verification and lifecycle rules.

**Hard limit:** creating a key, QR code, file, hash, signature or “trusted” record within the same untrusted commissioning path merely relocates the circularity. Purchasing a token/device also does not establish its initial legitimacy by itself.

**Potential advantage:** if a real prior or independently provisioned basis and enforcement boundary can be justified, this path can avoid relying solely on an assumption that the candidate host is honest. No such basis is currently evidenced; no technology or provider is selected.

**Disposition:** strongest class to investigate for independent recognition, but remains unproven until its own genesis and enforcement are grounded.

## Comparative decision

| Criterion | Path H | Path O |
|---|---|---|
| Proves Kevin's deliberate intent | Potentially, if exact-context review and approval are trustworthy | Potentially, if the out-of-band approval interaction is trustworthy |
| Avoids circular bootstrap | Only if the accepted assumptions exclude the circular/compromised path and a justified verifier exists | Potentially, but only if initial establishment itself has a non-circular basis |
| Resists compromised candidate presentation host | No, not if that host controls presentation and submission | Potentially, if recognition and enforcement are genuinely independent |
| Requires owner acceptance of assumptions | Yes, explicit and bounded | Still requires explicit residual assumptions, but should reduce dependence on candidate-controlled host |
| Current evidence | No ceremony or verifier implemented | No pre-existing basis/verifier evidenced |
| Decision now | NOT SELECTED | NOT SELECTED |

## Decision and next gate

1. Do not ask Kevin to select hardware or buy anything yet. The present evidence does not justify a specific product or device.
2. Do not treat “do everything necessary” as blanket acceptance of threat assumptions, provider governance, threshold custodians, purchases, credential enrollment or device changes.
3. First identify whether Path O can be grounded in a feasible, owner-verifiable establishment event and a genuinely independent enforcement boundary using resources that actually exist. If not, specify precisely which guarantee is unavailable.
4. Then present Kevin only the real governance choice that remains: whether to accept a narrowly bounded Path H assumption set for a limited initial transition, or to keep protected commissioning blocked while continuing non-protected development until a stronger basis is available.
5. Even if an assumption set is accepted, do not mark Genesis ESTABLISHED until the exact-context binding, verifier, currentness/lifecycle, provenance and final-effect enforcement evidence required by IR-1 is actually demonstrated.

## Current disposition

- Genesis Trust Foundation: UNKNOWN.
- Independent recognition / IR-1: NOT ESTABLISHED.
- Human-supervised ceremony: DESIGN CANDIDATE; assumptions not accepted.
- Out-of-band basis: no concrete basis currently evidenced; establishment path not selected.
- Constitution Authority Context implementation: STOP BEFORE CODE.
- Protected commissioning/effects: BLOCKED.
- Non-protected design: may continue.
- No device commands, installs, credential enrollment, APK/signing changes, physical root/verifier/channel/provider/quorum selection, or protected commissioning occurred.
