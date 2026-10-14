import { useSearchParams } from "react-router";
import { useProposalSelection } from "@/features/proposal/model/useProposalSelection";
import type {
  ProposalSpaceState,
  ProposalView,
} from "@/features/proposal/model/proposalViewTypes";

// 근거·원본을 읽고 돌아와도 사용자가 선택하지 않은 제안을 자동 선택하지 않는다.
export function useProposalRouteSelection(
  proposals: readonly ProposalView[],
  data: ProposalSpaceState,
) {
  const [params, setParams] = useSearchParams();
  const initialIds = params.has("selected")
    ? params.getAll("selected")
    : undefined;
  const { selected, toggle } = useProposalSelection(
    proposals,
    data,
    initialIds,
  );
  function toggleSelection(id: string, checked: boolean) {
    toggle(id, checked);
    const ids = selected
      .filter((entry) => entry.id !== id)
      .map((entry) => entry.id);
    if (checked) ids.push(id);
    void setParams(
      (previous) => {
        previous.delete("selected");
        // 빈 값으로 '모두 해제'와 최초 진입을 구분한다.
        for (const selectedId of ids.length ? ids : [""])
          previous.append("selected", selectedId);
        return previous;
      },
      { replace: true, preventScrollReset: true },
    );
  }
  return { selected, toggle: toggleSelection };
}
