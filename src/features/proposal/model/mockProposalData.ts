import type { ProposalSpaceState } from "./proposalViewTypes";

export function getMockProposalData(): ProposalSpaceState {
  return { proposals: [], requests: [], results: [], items: [] };
}
