import { VALIDATION, createValidationResult } from "./contracts.mjs";

const REQUIREMENT_STATES = Object.freeze(["SATISFIED", "FAILED", "UNKNOWN"]);

function validState(value) {
  return REQUIREMENT_STATES.includes(value);
}

function sameValue(a, b) {
  try {
    const canonicalJson = value => JSON.stringify(value, (_, item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        return Object.fromEntries(
          Object.keys(item).sort().map(key => [key, item[key]])
        );
      }
      return item;
    });
    return canonicalJson(a) === canonicalJson(b);
  } catch {
    // Cyclic or otherwise non-JSON-comparable inputs are not proof of equality.
    return null;
  }
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

      if (claim.target !== null) {
        if (context.target === undefined) {
          return createValidationResult(VALIDATION.FAIL, {
            reasons: ["claim target does not match authoritative validation target"]
          });
        }
        const targetMatches = sameValue(claim.target, context.target);
        if (targetMatches === null) {
          return createValidationResult(VALIDATION.UNKNOWN, {
            reasons: ["claim target cannot be safely compared with validation target"]
          });
        }
        if (!targetMatches) {
          return createValidationResult(VALIDATION.FAIL, {
            reasons: ["claim target does not match authoritative validation target"]
          });
        }
      }

      if (claim.targetIncarnation !== null) {
        if (context.targetIncarnation === undefined) {
          return createValidationResult(VALIDATION.FAIL, {
            reasons: ["claim target incarnation does not match authoritative validation incarnation"]
          });
        }
        const incarnationMatches = sameValue(claim.targetIncarnation, context.targetIncarnation);
        if (incarnationMatches === null) {
          return createValidationResult(VALIDATION.UNKNOWN, {
            reasons: ["claim target incarnation cannot be safely compared with validation incarnation"]
          });
        }
        if (!incarnationMatches) {
          return createValidationResult(VALIDATION.FAIL, {
            reasons: ["claim target incarnation does not match authoritative validation incarnation"]
          });
        }
      }

      if (claim.policyContext !== null) {
        if (context.policyContext === undefined) {
          return createValidationResult(VALIDATION.UNKNOWN, {
            reasons: ["claim policy/config context is unavailable"]
          });
        }
        const policyContextMatches = sameValue(claim.policyContext, context.policyContext);
        if (policyContextMatches === null) {
          return createValidationResult(VALIDATION.UNKNOWN, {
            reasons: ["claim policy/config context cannot be safely compared with validation context"]
          });
        }
        if (!policyContextMatches) {
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

      const claimCriticalCollections = [
        ["authoritativeReads", claim.authoritativeReads],
        ["dependencies", claim.dependencies],
        ["predicateDependencies", claim.predicateDependencies],
        ["causalInputs", claim.causalInputs]
      ];
      if (claimCriticalCollections.some(([, items]) => !Array.isArray(items))) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["candidate claim-critical collections are malformed"]
        });
      }

      const claimCriticalItems = [
        ...claim.authoritativeReads,
        ...claim.dependencies,
        ...claim.predicateDependencies,
        ...claim.causalInputs
      ];
      const malformedRequiredItems = claimCriticalItems.filter(item =>
        item?.required !== false &&
        (!item || typeof item.id !== "string" || item.id.trim().length === 0)
      );
      if (malformedRequiredItems.length > 0) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["required claim-critical item has no valid identifier"],
          evidence: malformedRequiredItems.map((_, index) => `malformed-claim-item[${index}]`)
        });
      }

      const requiredIds = claimCriticalItems
        .filter(item => item && typeof item.id === "string" && item.required !== false)
        .map(item => item.id);

      const requiredIdSet = new Set(requiredIds);
      const seenRequiredIds = new Set();
      const duplicateRequiredIds = new Set();
      for (const requirement of context.requirements) {
        if (!requirement || typeof requirement.id !== "string" || !requiredIdSet.has(requirement.id)) {
          continue;
        }
        if (seenRequiredIds.has(requirement.id)) duplicateRequiredIds.add(requirement.id);
        seenRequiredIds.add(requirement.id);
      }
      if (duplicateRequiredIds.size > 0) {
        return createValidationResult(VALIDATION.UNKNOWN, {
          reasons: ["required validation evidence contains duplicate identifiers"],
          evidence: [...duplicateRequiredIds]
        });
      }

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
        // Only claim-critical requirements can change this claim's decision.
        // Unrelated requirements may be present in a wider validation context.
        if (!requirement || !requiredIds.includes(requirement.id)) continue;

        if (!validState(requirement.status)) {
          unknown.push(requirementFailure(requirement, index));
          continue;
        }

        if (requirement.authoritative !== true ||
            typeof requirement.source !== "string" ||
            requirement.source.trim().length === 0 ||
            ["cache", "helper", "derived"].includes(requirement.source.trim().toLowerCase())) {
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

      const evidence = [...new Set(requiredIds)];

      return createValidationResult(VALIDATION.PASS, { evidence });
    }
  });
}
