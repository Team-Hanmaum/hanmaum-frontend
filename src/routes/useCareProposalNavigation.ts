import { useNavigate } from "react-router";
import type { ProposalView } from "@/features/proposal/model/proposalViewTypes";
import { proposalRequestPath, proposalReviewPath } from "./paths";

export function useCareProposalNavigation(spaceId: string) {
  const navigate = useNavigate();
  return (proposal: ProposalView) =>
    void navigate(
      proposal.status === "requested" && proposal.requestId
        ? proposalRequestPath(spaceId, proposal.requestId)
        : proposalReviewPath(spaceId, proposal.recordId),
    );
}
