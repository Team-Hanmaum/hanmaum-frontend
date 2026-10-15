import { useState } from "react";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockAction } from "@/lib/useMockAction";
import { mockProposals } from "./mockProposals";
import type { ProposalFailure, ProposalSelection } from "./proposalViewTypes";

export function useProposalAction(space: CareSpaceView) {
  const { pending, run } = useMockAction();
  const [failure, setFailure] = useState<
    ProposalFailure | "request-error" | null
  >(null);
  function submit(
    selection: readonly ProposalSelection[],
    decision: "request" | "applied" | "rejected",
    onSuccess: (id: string) => void,
    simulation?: "request-error" | "changed",
  ) {
    run(() => {
      if (simulation === "request-error") {
        setFailure("request-error");
        return;
      }
      if (simulation === "changed") {
        setFailure({
          ok: false,
          reason: "changed",
          proposalIds: selection.slice(0, 1).map((item) => item.id),
        });
        return;
      }
      const result = mockProposals.submit(space, selection, decision);
      if (result.ok) {
        setFailure(null);
        onSuccess(result.id);
      } else setFailure(result);
    });
  }
  return { pending, failure, submit };
}
