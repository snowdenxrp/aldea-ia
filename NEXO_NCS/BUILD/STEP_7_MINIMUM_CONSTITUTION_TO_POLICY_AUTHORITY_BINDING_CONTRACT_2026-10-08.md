# STEP 7 — Minimum Constitution-to-Policy Authority Binding Contract — 2026-10-08

Status: DESIGN CANDIDATE — ATTACK REQUIRED

## Direct MASTER basis
The consolidated architecture defines Constitution as the immutable/versioned root of rules, including domains of authority, trust roots, mandatory gates, amendment rules and policy-related controls. It also defines the chain `TRUST ANCHOR → IDENTITY → AUTHORITY → CAPABILITY → POLICY → WORLD REVALIDATION → EXECUTION → VERIFICATION` and the invariant `COGNITION ≠ AUTHORITY ≠ EXECUTION ≠ VERIFICATION`.

Therefore Policy Authority cannot originate inside the Policy object, provider, resolver, or model.

## Minimum semantic contract
A Constitution-to-Policy binding must establish:
1. Constitution identity: constitution id/version/hash actually governing the decision.
2. Policy identity: policy id/semanticVersion/hash actually bound to that constitutional regime.
3. Authority domain: the constitutional authority domain that is permitted to govern this policy class/scope.
4. Applicability relation: the governed relation that permits the policy to apply to the actual mission/claim context.
5. Validity constraints: constitutional/policy conditions that make the binding current, including expiry where required.
6. Required dependency relation: policy/authority dependencies whose validity is necessary for the binding.
7. Establishment provenance: evidence that the binding was established through the protected Core authority path.

## What this contract does NOT mean
It does not itself authorize a concrete action.
It does not admit a mission candidate.
It does not prove a claim.
It does not execute or commit.
It does not prove external-world outcome.
It does not replace final validation or current authority checks.

## Critical separation
Constitutional authority is the root of permission to recognize/govern a Policy. Policy semantics determine requirements/eligibility and constrain decisions. A Policy being validly bound does not make every action under it authorized.

## Unknown behavior
Missing constitution identity, policy binding, authority-domain applicability, required dependency, or current validity => UNKNOWN/HOLD/REVALIDATE. No fallback permissive interpretation.

## Evolution rule
Policy semantics can evolve independently only through the constitutional amendment/versioning rules. Policy semantic version does not itself elevate authority. Changing policy content/hash invalidates dependent assurance according to governed rules.

## No new mechanism
No new SelectorAuthority, provider trust flag, operation ID, queue, retry, tombstone, epoch, fence, or compatibility wrapper is introduced by this contract.