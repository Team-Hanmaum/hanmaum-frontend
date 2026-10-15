import { useState } from "react";
import type {
  ProposalSelection,
  ProposalSpaceState,
  ProposalView,
} from "./proposalViewTypes";

export function useProposalSelection(
  proposals: readonly ProposalView[],
  data: ProposalSpaceState,
  initialIds?: readonly string[],
) {
  const [selection, setSelection] = useState<ProposalSelection[]>(() =>
    proposals
      .filter((proposal) => !initialIds || initialIds.includes(proposal.id))
      .map((proposal) => ({
        id: proposal.id,
        revision: proposal.revision ?? 0,
        version:
          data.items.find((item) => item.id === proposal.targetId)?.version ??
          proposal.targetVersion,
      })),
  );
  const selected = selection.filter((item) =>
    proposals.some((proposal) => proposal.id === item.id),
  );
  function toggle(id: string, checked: boolean) {
    const proposal = proposals.find((item) => item.id === id);
    if (!proposal) return;
    setSelection((previous) =>
      checked
        ? [
            ...previous.filter((item) => item.id !== id),
            {
              id,
              revision: proposal.revision ?? 0,
              version:
                data.items.find((item) => item.id === proposal.targetId)
                  ?.version ?? proposal.targetVersion,
            },
          ]
        : previous.filter((item) => item.id !== id),
    );
  }
  return { selected, toggle };
}
