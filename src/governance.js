// Gobernanza emergente: las normas se proponen, se votan y se conservan por experiencia.
// No existe una constitución prefijada; las decisiones nacen de instituciones ya existentes.

export function normalizeGovernanceWorld(world) {
  world.governance ??= { proposals: [], decisions: [] };
  world.governance.proposals ??= [];
  world.governance.decisions ??= [];
  return world.governance;
}

export function advanceGovernanceDay(simulation) {
  const governance = normalizeGovernanceWorld(simulation.world);
  const institutions = simulation.world.institutions ?? [];
  for (const institution of institutions) {
    if (institution.type !== "commons" || institution.members.length < 3) continue;
    const recent = institution.history?.slice(-7) ?? [];
    const latest = recent[recent.length - 1];
    const imbalance = latest && latest.withdrawals > latest.contributions;
    const existing = governance.proposals.find(p => p.status === "open" && p.institutionId === institution.id);
    if (imbalance && !existing) {
      const proposal = {
        id: "proposal-" + (governance.proposals.length + 1),
        institutionId: institution.id,
        createdDay: simulation.day,
        type: "reserve_sharing",
        value: Math.max(0.05, Number(institution.norms.reserveSharing ?? 0.25) - 0.05),
        status: "open",
        votes: []
      };
      governance.proposals.push(proposal);
      simulation.events.push({
        id: "governance-event-" + simulation.events.length,
        day: simulation.day, hour: 0, type: "norm_proposed",
        description: "La comunidad propuso ajustar la regla de reparto de su reserva.",
        participants: institution.members.slice()
      });
    }
  }

  for (const proposal of governance.proposals.filter(p => p.status === "open")) {
    const institution = institutions.find(i => i.id === p.institutionId);
    if (!institution) { proposal.status = "rejected"; continue; }
    for (const memberId of institution.members) {
      if (proposal.votes.some(v => v.agentId === memberId)) continue;
      const agent = simulation.agents.find(a => a.id === memberId && a.alive);
      if (!agent) continue;
      const rels = agent.relationships ?? [];
      const trust = rels.reduce((s,r) => s + Number(r.trust ?? 0), 0) / Math.max(1, rels.length);
      const fairnessNeed = agent.needs.hunger < 45 ? 0.3 : 0;
      const approve = Number(proposal.value) < Number(institution.norms.reserveSharing ?? 0.25)
        ? trust + fairnessNeed >= 0.2
        : trust >= 0.35;
      proposal.votes.push({ agentId: agent.id, approve });
    }
    const total = institution.members.length;
    if (proposal.votes.length >= total) {
      const approvals = proposal.votes.filter(v => v.approve).length;
      proposal.status = approvals * 2 > total ? "accepted" : "rejected";
      if (proposal.status === "accepted") institution.norms.reserveSharing = proposal.value;
      governance.decisions.push({
        proposalId: proposal.id, institutionId: institution.id, day: simulation.day,
        result: proposal.status, approvals, total
      });
      if (governance.decisions.length > 500) governance.decisions = governance.decisions.slice(-500);
    }
  }
  governance.proposals = governance.proposals.slice(-200);
}

export function governanceSummary(world) {
  const g = normalizeGovernanceWorld(world);
  return {
    openProposals: g.proposals.filter(p => p.status === "open").length,
    accepted: g.decisions.filter(d => d.result === "accepted").length,
    rejected: g.decisions.filter(d => d.result === "rejected").length
  };
}
