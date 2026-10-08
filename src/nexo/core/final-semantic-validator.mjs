import { VALIDATION, createValidationResult } from "./contracts.mjs";

const REQUIREMENT_STATES = Object.freeze(["SATISFIED", "FAILED", "UNKNOWN"]);

function validState(value) {
  return REQUIREMENT_STATES.includes(value);
}

function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function requirementFailure(requirement, index) {
  return requirement.id ?? `requirement[${index}]`;
}

/**
 * STEP 4 — Final Semantic Validator.
 *
 * The validator does not discover authority by itself and does not mutate
 * canonical state. It evaluates an explicit validation context containing
 * authoritative requirement results.
 *
 * Each requirement must positively identify its authority source and state.
 * Helper/cache/derived-only evidence is never sufficient for SATISFIED.
 */
export function createFinalSemanticValidator() {
  return Object.freeze({
    validate(candidate, context = {}) {
      if (!candidate?.claim || typeof candidate.claim.claimId !== "string") {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["candidate claim identity is missing"]
        });
      }

      const { claim } = candidate;

      if (context.claimId !== claim.claimId) {
        return createValidationResult(VALIDATION.FAIL, {
          reasons: ["validation context claim identity mismatch"]
        });
      }

      if (claim.target !== null &&
          (context.target === undefined || !sameValue(claim.target, context.target))) {
        return createValidationResult(VALIDATION.FAIL, {
          reasons: ["claim target does not match authoritative validation target"]
        });
      }

      if (claim.targetIncarnation !== null &&
          (context.targetIncarnation === undefined ||
           !sameValue(claim.targetIncarnation, context.targetIncarnation))) {
        return createValidationResult(VALIDATION.FAIL, {
          reasons: ["claim target incarnation does not match authoritative validation incarnation"]
        });
      }

      if (claim.policyContext !== null) {
        if (context.policyContext === undefined) {
          return createValidationResult(VALIDATION.UNKNOWN, {
            reasons: ["claim policy/config context is unavailable"]
          });
        }
        if (!sameValue(claim.policyContext, context.policyContext)) {
          return createValidationResult(VALIDATION.FAIL, {
            reasons: ["claim policy/config context does not match authoritative validation context"]
          });
        }
      }

      if (!Array.isArray(context.requirements)) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["authoritative validation requirements are unavailable"]
        });
      }

      const requiredIds = [
        ...claim.authoritativeReads,
        ...claim.dependencies,
        ...claim.predicateDependencies,
        ...claim.causalInputs
      ]
        .filter(item => item && typeof item.id === "string" && item.required !== false)
        .map(item => item.id);

      const byId = new Map(
        context.requirements
          .filter(item => item && typeof item.id === "string")
          .map(item => [item.id, item])
      );

      const missing = [];
      const failed = [];
      const unknown = [];
      const nonAuthoritative = [];

      for (const [index, requirement] of context.requirements.entries()) {
        if (!validState(requirement.status)) {
          unknown.push(requirementFailure(requirement, index));
          continue;
        }

        if (requiredIds.includes(requirement.id) &&
            (requirement.authoritative !== true ||
             ["cache", "helper", "derived"].includes(requirement.source))) {
          nonAuthoritative.push(requirement.id);
          continue;
        }

        if (requirement.status === "FAILED") failed.push(requirement.id);
        if (requirement.status === "UNKNOWN") unknown.push(requirement.id);
      }

      for (const id of requiredIds) {
        const requirement = byId.get(id);
        if (!requirement) missing.push(id);
      }

      if (nonAuthoritative.length > 0) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["required evidence is not authoritative"],
          evidence: nonAuthoritative
        });
      }

      if (missing.length > 0) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["required claim-critical evidence is missing"],
          evidence: missing
        });
      }

      if (failed.length > 0) {
        return createValidationResult(VALIDATION.FAIL, {
          reasons: ["claim-critical predicate or dependency was disproven"],
          evidence: failed
        });
      }

      if (unknown.length > 0) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["required validation evidence is unavailable or indeterminate"],
          evidence: unknown
        });
      }

      const evidence = context.requirements.map(requirement => requirement.id);

      return createValidationResult(VALIDATION.PASS, { evidence });
    }
  });
}
