# NEXO NCS — Biometric Authentication Candidate Boundary
Date: 2026-10-08
Status: DESIGN CANDIDATE ONLY — NOT SELECTED, NOT IMPLEMENTED

## Owner proposal
Kevin asked whether Nexo could recognize him through his unique fingerprint or facial recognition, potentially connected to the phone's screen-unlock mechanism.

## Technical finding
Android provides app-level biometric authentication through BiometricPrompt. For sensitive authorization, an app can bind a cryptographic operation to successful authentication using Android Keystore and an authentication-bound key. Depending on device capabilities and configured authenticator class, supported methods differ. A screen-unlock event alone is not equivalent to a fresh, app-verifiable authorization for a specific Nexo action.

Official reference: https://developer.android.com/identity/sign-in/biometric-auth
Android security overview: https://source.android.com/docs/security/features/biometric

## Distinctions that must remain explicit
1. **Biometric match:** the platform reports successful authentication under its own biometric policy.
2. **App-bound proof:** Nexo's app can require authentication to use a protected cryptographic key; a narrowly scoped challenge or operation could be bound to that proof.
3. **Owner/action attribution:** Nexo must still bind the proof to the exact action, Constitution version/hash, commissioning context, freshness, and intended scope.
4. **Protected enforcement:** proof of authentication does not prove that all privileged paths enforce the decision or that the app/OS is uncompromised.

## Candidate value
Biometric authentication may be a useful factor within the already identified current-phone candidate, especially if a cryptographic operation is authentication-bound. It is more defensible than trusting a plain app flag saying “screen unlocked,” but it is not by itself a genesis trust root and does not establish independent enrollment legitimacy.

## Failure and attack conditions to preserve
- Device allows weak face recognition or another authenticator class insufficient for the intended claim.
- Device credential fallback silently broadens what counts as owner approval.
- An already-unlocked device/session is treated as fresh approval for a different action.
- Biometric enrollment changes, key invalidation, device restore, app reinstall, OS compromise, overlay/UI substitution, malware, or stolen/unlocked device.
- A successful biometric prompt is replayed or detached from the exact request/Constitution/commissioning payload.
- User authenticates but the presented action differs from the cryptographically bound action.
- Platform says authentication succeeded but protected Core cannot independently verify the resulting evidence or enforce it.
- Recovery, revocation, currentness, and succession remain undefined.

## Required contract if evaluated further
Any candidate must define:
- accepted authenticator strength and whether device-credential fallback is allowed;
- fresh per-operation authentication requirements;
- a hardware-backed/authentication-bound key where the platform supports and proves it;
- exact action and Constitution/commissioning-context binding;
- enrollment and biometric-change lifecycle behavior;
- freshness, replay resistance, revocation/recovery behavior, and dependency/failure domain;
- what evidence protected Core actually verifies and what it cannot claim;
- UNKNOWN/STOP behavior whenever proof, freshness, binding, or enforcement is absent.

## Decision
No mechanism selected. No app, key, API, protocol, device property, or enrollment ceremony implemented or authorized. Biometrics are a candidate authentication factor, not proof by themselves that the genesis root exists. Genesis Trust Foundation, Constitution Authority Context, protected commissioning, and production effects remain BLOCKED/UNKNOWN. Do not reopen broad Android/device research; evaluate only this concrete candidate against existing gates if the owner chooses to continue.
