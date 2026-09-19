const RENDER_CAUSES = Object.freeze({ MESH_MISSING:"MESH_MISSING", NOT_IN_SCENE:"NOT_IN_SCENE", HIDDEN:"HIDDEN", OFFSCREEN:"OFFSCREEN", OK:"OK", UNCONFIRMED:"UNCONFIRMED" });

export function classifyRenderProbe(probe = {}) {
  if (probe.exists === false) return RENDER_CAUSES.MESH_MISSING;
  if (probe.inScene === false) return RENDER_CAUSES.NOT_IN_SCENE;
  if (probe.visible === false) return RENDER_CAUSES.HIDDEN;
  if (probe.onScreen === false) return RENDER_CAUSES.OFFSCREEN;
  if (probe.exists === true && probe.inScene === true && probe.visible === true && probe.onScreen === true) return RENDER_CAUSES.OK;
  return RENDER_CAUSES.UNCONFIRMED;
}

export function buildRenderEvidence(probe = {}) {
  return { causeCode: classifyRenderProbe(probe), exists:probe.exists??null, inScene:probe.inScene??null, visible:probe.visible??null, onScreen:probe.onScreen??null, renderer:probe.renderer??null, sceneChildren:probe.sceneChildren??null };
}
