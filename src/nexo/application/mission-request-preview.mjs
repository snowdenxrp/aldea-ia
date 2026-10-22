import { assertContractInput } from "../core/contracts.mjs";
import { assertNexoMissionAdmission } from "../core/mission-admission-contract.mjs";
import { previewNexoMissionDraft } from "./continuity-queries.mjs";

/**
 * Validate the boundary between untrusted user intent and a separately supplied
 * mission proposal. This does not interpret intent or claim that the proposal
 * matches it. Intent is deliberately not forwarded to the mission validator.
 */
export async function previewNexoMissionRequest(continuityPath, requestEnvelope) {
  const fail = (code) => ({
    status: "blocked", code,
    requestInterpretation: "NOT_PERFORMED",
    intentDraftAlignment: "NOT_EVALUATED",
    authorization: "NOT_EVALUATED",
    dispatchAttempted: false, persisted: false
  });
  try {
    assertNexoMissionAdmission(requestEnvelope, { requestIntent: true });
    assertContractInput(requestEnvelope, "Nexo mission request");
    const keys = Reflect.ownKeys(requestEnvelope);
    if (keys.some(key => key !== "intent" && key !== "missionDraft") ||
        typeof requestEnvelope.intent !== "string" || !requestEnvelope.intent.trim() ||
        !requestEnvelope.missionDraft || typeof requestEnvelope.missionDraft !== "object" ||
        Array.isArray(requestEnvelope.missionDraft)) {
      return fail("NEXO_MISSION_REQUEST_INVALID");
    }
    // Intent remains untrusted data: no model, command, action, or dispatch is
    // inferred from its contents. Only the separately supplied draft is checked.
    const preview = await previewNexoMissionDraft(continuityPath, requestEnvelope.missionDraft);
    return { ...preview, requestInterpretation: "NOT_PERFORMED", intentDraftAlignment: "NOT_EVALUATED" };
  } catch (error) {
    const code = [
      "NEXO_MISSION_ADMISSION_RESOURCE_LIMIT_EXCEEDED",
      "NEXO_MISSION_REQUEST_INTENT_RESOURCE_LIMIT_EXCEEDED"
    ].includes(error?.code) ? error.code : "NEXO_MISSION_REQUEST_INVALID";
    return fail(code);
  }
}
