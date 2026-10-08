import assert from "node:assert/strict";
import { POLICY_CONTEXT_RESOLUTION, resolvePolicyContext } from "../../src/nexo/core/policy-context-resolver.mjs";

const base = {
  policyRef: { id: "policy-1", semanticVersion: "1.0.0", hash: "sha256:test" },
  scope: { mission: "mission-1" },
  identity: { status: "PASS", evidence: ["identity-bound"] },
  applicability: { status: "PASS", evidence: ["scope-applicable"] },
  dependencies: { status: "PASS", evidence: ["deps-complete"] },
  temporal: { status: "PASS", evidence: ["current"] },
  provenance: { status: "PASS", evidence: ["protected-source"] }
};

assert.equal(resolvePolicyContext(base).status, POLICY_CONTEXT_RESOLUTION.VALID);
assert.equal(resolvePolicyContext({ ...base, identity: { status: "FAIL", evidence: ["hash-mismatch"] } }).status, "FAIL");
assert.equal(resolvePolicyContext({ ...base, applicability: { status: "UNKNOWN", evidence: [] } }).status, "UNKNOWN");
assert.equal(resolvePolicyContext({ ...base, dependencies: { status: "UNKNOWN", evidence: [] } }).status, "UNKNOWN");
assert.equal(resolvePolicyContext({ ...base, temporal: { status: "FAIL", evidence: ["expired"] } }).status, "FAIL");
assert.equal(resolvePolicyContext({ ...base, provenance: { status: "UNKNOWN", evidence: ["provider-asserted"] } }).status, "UNKNOWN");
assert.throws(() => resolvePolicyContext({ ...base, applicability: { status: "AUTHORIZED", evidence: [] } }), /invalid status/);

const result = resolvePolicyContext(base);
assert.equal("authorize" in result, false);
assert.equal("commit" in result, false);
assert.equal("safeCommit" in result, false);
assert.throws(() => { result.status = "FAIL"; }, TypeError);

const mutable = { id: "policy-1", semanticVersion: "1.0.0", hash: "sha256:test" };
const isolated = resolvePolicyContext({ ...base, policyRef: mutable });
mutable.hash = "attacker";
assert.equal(isolated.policyRef.hash, "sha256:test");

console.log("NEXO STEP 7 policyContext resolver contract tests: PASS");