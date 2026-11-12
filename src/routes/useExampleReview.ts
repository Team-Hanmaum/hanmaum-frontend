import { useLocation, useParams } from "react-router";
import { readProposalConfirmation } from "@/features/proposal/model/proposalConfirmation";

export function useExampleReview() {
  const params = useParams();
  const { state } = useLocation();
  const confirmation = readProposalConfirmation(state);
  return (
    Object.values(params).some((id) => id?.startsWith("mock-")) ||
    confirmation?.selection.some((entry) => entry.id.startsWith("mock-")) ===
      true
  );
}
