function clone(value) {
  return value == null ? value : structuredClone(value);
}

export function createNexoModelRouter({
  local,
  remote = null,
  connectivity = async () => ({ online: false }),
  localPolicy = null
} = {}) {
  if (!local?.chat) throw new Error("Nexo model router requires a local model");
  let lastRoute = "local";

  const route = async ({ requireInternet = false, task = "general" } = {}) => {
    const network = await connectivity();
    if (requireInternet && network.online && remote?.chat) {
      lastRoute = "remote";
      return { provider: "remote", model: remote.model, client: remote };
    }
    lastRoute = "local";
    const profile = localPolicy?.select({ task });
    return { provider: "local", model: profile?.id || local.model, profile, client: local };
  };

  const chat = async (request = {}) => {
    const selected = await route(request);
    return selected.client.chat(request);
  };

  const status = async () => {
    const localStatus = await local.health();
    let remoteStatus = { online: false, provider: "remote", configured: Boolean(remote) };
    if (remote?.health) remoteStatus = await remote.health();
    const network = await connectivity();
    return {
      online: Boolean(network.online),
      lastRoute,
      local: localStatus,
      remote: remoteStatus,
      offlineReady: Boolean(localStatus.online)
    };
  };

  return Object.freeze({ chat, route, status });
}
