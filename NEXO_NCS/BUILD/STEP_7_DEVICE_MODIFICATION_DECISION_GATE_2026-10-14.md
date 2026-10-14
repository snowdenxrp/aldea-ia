# STEP 7 — Device modification decision gate

Date: 2026-10-14  
Branch: `ncs-clean-architecture`  
Status: RESEARCH / DEVICE NOT SELECTED / NO MODIFICATION AUTHORIZED

## 1. Decision question

Does the owner's permission to modify any available handset justify unlocking, rooting, flashing or repurposing a device for STEP 7?

**Decision: not yet.** Permission broadens the options we may evaluate; it is not evidence that a modified handset would provide a stronger trust boundary. First name the security property the modification is meant to provide and prove that the proposed configuration actually provides it.

## 2. Current candidates and evidence limits

| Device | Current role/evidence | Candidate use | Blockers / risks |
|---|---|---|---|
| POCO X7 Pro (2412DPC0AG / rodin; Android 16, HyperOS; user previously reported green Verified Boot) | Current main handset and the only bounded first-ceremony presentation premise. | Keep as the normal Android test/presentation device while preserving its current locked/verified configuration. | No proof it can contain malicious Nexo Core or a compromised OS. Xiaomi says HyperOS bootloader unlock is restricted to approved users and warns unlocking can compromise security and cause data loss. Unlocking could remove useful verified-boot assurances; do not do it merely to make the device “more secure.” |
| Moto G52 (Snapdragon 680, 6 GB / 256 GB per owner) | Spare handset; community indexes report custom-ROM options for the G52, but exact variant and installable build/bootloader eligibility have not been verified against authoritative device-specific instructions. | Most plausible spare for a later isolated experiment if an exact supported configuration and recovery path can be proven. | Custom ROM availability is not proof of a hardened or independently trusted OS. Bootloader unlock normally wipes data and changes the verified-boot trust state. Exact model/region/carrier eligibility and practical flashing path remain UNKNOWN. |
| Moto E22i (Helio G37, 2 GB RAM; work device per owner) | Low-memory spare; exact firmware/variant and bootloader eligibility not verified. | Could be a low-cost compatibility test only if needed and safe to repurpose. | Limited memory, work-device context, uncertain supported OS path, and no established security advantage. Do not wipe or flash as the default experiment. |

## 3. Source-backed constraints

- Android's bootloader guidance explains that unlocking permits flashing images and requires an explicit physical confirmation; devices are generally shipped locked, and unlocking triggers a data reset. An unlocked device has a different security posture than a locked, verified-boot device. Source: https://source.android.com/docs/core/architecture/bootloader/locking_unlocking
- Xiaomi's HyperOS unlock guidance says unlock permissions are restricted to eligible users and warns of security/data-leakage risks; the device must not be assumed unlockable just because a tutorial exists. Source: https://new.c.mi.com/global/user/dfcddc8b34e9f412fb779148fd2d8548/replies (Xiaomi's official community rules surfaced in the cited page; confirm the current official application flow before any future action).
- Motorola's official support says most recent devices may be eligible, with restrictions including some carrier-specific models; exact eligibility must be checked for the exact model. Source: https://es-latam.support.motorola.com/app/answers/detail/a_id/89973/~/%C2%BFqu%C3%A9-dispositivos-son-compatibles-con-el-programa-de-desbloqueo-de-bootloader%3F
- A community index reports multiple ROM options for Moto G52, but this is discovery evidence only, not a selection or assurance claim. Source: https://thecustomrom.com/devices/motorola/rhode

No exact bootloader-unlock eligibility, custom OS build, secure update chain, verified-boot re-lock path, rollback protection or full recovery procedure has been established for any of these three devices in this pass.

## 4. Important distinction: modification is not hardening by itself

Rooting or unlocking can make an experiment easier while making the device less suitable as a security anchor. Installing a custom ROM is only a security improvement if the entire chain—source/build provenance, signing keys, boot verification, updates, rollback handling, recovery and operational maintenance—is better specified and evidenced than the stock configuration. A second phone running copied files or the same account/software supply chain is not automatically an independent verifier.

A device can be useful for **testing** without being trusted to **authorize**. Keep those roles separate.

## 5. Gate before any destructive operation

Before any unlock/root/flash/wipe or dedicated-device conversion, require a separate, device-specific plan containing:

1. Exact model number, region/carrier variant, codename and current firmware.
2. The precise security property sought and the threat it is meant to resist.
3. Authoritative unlock eligibility and exact supported image/recovery instructions for that variant.
4. A verified recovery/unbrick path, required host tooling and cable/OTG feasibility; the owner currently has no PC, so do not assume ordinary PC-based flashing instructions are executable.
5. Data-loss, account/FRP, warranty/support, boot/DRM, connectivity and update consequences.
6. The resulting bootloader/Verified Boot state and whether it can be securely re-locked with the intended keys.
7. A reason this device/configuration is a better failure domain than leaving the POCO stock and locked.

If any item is unknown, do not modify the device yet. Never use unofficial unlock services or exploit/bypass tooling as a substitute for an understood, recoverable security design.

## 6. Current recommendation

- Keep the POCO X7 Pro in its current stock/locked state for now; do not unlock it to solve the Scope A or Genesis trust problem.
- Treat the Moto G52 as a **research candidate**, not selected hardware. First verify the exact variant, official unlock eligibility, actual supported ROM/build and recovery path. Only then compare it against the unchanged stock POCO.
- Keep the Moto E22i out of the primary trust-boundary role unless new evidence makes it useful; its low resources and uncertain OS path do not currently justify modification.
- Continue the Javet Node mode investigation only as a semantics experiment. Neither a custom ROM nor an embedded JS runtime, by itself, establishes a canonical Constitution owner or protected final sink.
- No hardware authenticator purchase/integration, device unlock, root, flash, wipe, APK install or key generation is authorized by this document.

## 7. Disposition

The owner's permission to modify any device is recorded. No handset or operating system is selected as the constitutional trust anchor or production host. Device selection remains OPEN / UNKNOWN.

No device was contacted or modified. No code/tests/keys/Constitution/APK/deployment/runtime authority changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
