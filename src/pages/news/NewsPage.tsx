import { useNavigate, useOutletContext } from "react-router";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { newsListStates } from "@/features/record/model/newsScreenStates";
import { NewsList } from "@/features/record/ui/NewsList";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import {
  getPendingProposalCount,
  getRecordsWithProposals,
} from "@/features/proposal/model/proposalSelectors";
import { useMockScreenState } from "@/routes/useMockScreenState";
import {
  newsCreatePath,
  newsDetailPath,
  proposalListPath,
} from "@/routes/paths";
import { TextAction } from "@/components/ui";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  pendingSpaceInfoCount,
  useMockSpaceInfoChanges,
} from "@/features/carespace/model/mockSpaceInfoChanges";

export function NewsPage() {
  const { withdrawing, withReturn, returnToWithdrawal } = useWithdrawalReturn();
  const space = useOutletContext<CareSpaceView>();
  const navigate = useNavigate();
  const records = useMockRecords(space);
  const proposals = useMockProposals(space);
  const spaceChanges = useMockSpaceInfoChanges(space.id);
  const [state, setState] = useMockScreenState(newsListStates, "default");
  return (
    <>
      {withdrawing && (
        <TextAction onClick={returnToWithdrawal}>
          탈퇴 절차로 돌아가기
        </TextAction>
      )}
      <NewsList
        records={getRecordsWithProposals(records, proposals)}
        pendingCount={
          getPendingProposalCount(proposals, space) +
          pendingSpaceInfoCount(spaceChanges, space)
        }
        state={state}
        onCreate={() => void navigate(newsCreatePath(space.id))}
        onOpen={(id) => void navigate(withReturn(newsDetailPath(space.id, id)))}
        onReview={() => void navigate(proposalListPath(space.id))}
        onRetry={() => setState("default")}
      />
    </>
  );
}
