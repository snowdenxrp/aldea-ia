import assert from "node:assert/strict";
import { createHash, createPublicKey, generateKeyPairSync, verify } from "node:crypto";

// Known-answer test for the proposed wire encoding only. This public key and
// signature are test fixtures; they are not Nexo's root and no private key is
// included. Hardware integration and independent pin provisioning remain open.
const vector = {
  curve: "prime256v1",
  challengeHex: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
  prefixHex: "4e45584f2d524f4f542d424f4f5453545241502d563100",
  messageHex: "4e45584f2d524f4f542d424f4f5453545241502d563100000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
  publicKeySpkiDerBase64: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAExYXEhw8kHwh4NUIeNOKyidxQHmWlJBXOLe5OBTlEQ2dI8Z8U38Hk4XkSrDvFPAhAKLpxpvBfTsARETqxKrxHsw==",
  fingerprintSha256Hex: "9b10782bbb6fb374fe1ef3f4cf8f4773b9e35e84ebde794e7a2c4f7d1c5e78dc",
  signatureDerBase64: "MEYCIQDpOOZbgIZU8MIsYzTUVegaGxfQ1V+Gf5zRQKcGLQ1n9wIhAIVNVSMZ34sCQdWZ34boFS4sgWEsNw3D3q7pU9BwT0ys"
};

const prefix = Buffer.from("NEXO-ROOT-BOOTSTRAP-V1\0", "ascii");
const challenge = Buffer.from(vector.challengeHex, "hex");
const message = Buffer.concat([prefix, challenge]);
const spki = Buffer.from(vector.publicKeySpkiDerBase64, "base64");
const signature = Buffer.from(vector.signatureDerBase64, "base64");
const publicKey = createPublicKey({ key: spki, type: "spki", format: "der" });

function verifies(key, data, sig) {
  try {
    return verify("sha256", data, { key, dsaEncoding: "der" }, sig);
  } catch {
    return false;
  }
}

assert.equal(publicKey.asymmetricKeyType, "ec");
assert.equal(publicKey.asymmetricKeyDetails?.namedCurve, vector.curve);
assert.equal(prefix.toString("hex"), vector.prefixHex);
assert.equal(message.toString("hex"), vector.messageHex);
assert.equal(message.length, 55);
assert.equal(
  createHash("sha256").update(spki).digest("hex"),
  vector.fingerprintSha256Hex
);
assert.equal(verifies(publicKey, message, signature), true,
  "known-answer ECDSA/SHA-256 signature must verify");

const alteredChallenge = Buffer.from(challenge);
alteredChallenge[31] ^= 1;
assert.equal(verifies(publicKey, Buffer.concat([prefix, alteredChallenge]), signature), false,
  "signature must not verify for a different challenge");

const alteredSignature = Buffer.from(signature);
alteredSignature[10] ^= 1;
assert.equal(verifies(publicKey, message, alteredSignature), false,
  "altered signature must fail");

const { publicKey: differentPublicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
assert.equal(verifies(differentPublicKey, message, signature), false,
  "signature must not verify against a different P-256 key");

assert.equal(verifies(publicKey, message, signature.subarray(0, signature.length - 1)), false,
  "truncated DER signature must fail closed");

console.log("Nexo M0 root bootstrap protocol vector tests passed (software vector only).");
