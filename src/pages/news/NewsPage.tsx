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

export function NewsPage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useNavigate();
  const records = useMockRecords(space);
  const proposals = useMockProposals(space);
  const [state, setState] = useMockScreenState(newsListStates, "default");
  return (
    <NewsList
      records={getRecordsWithProposals(records, proposals)}
      pendingCount={getPendingProposalCount(proposals, space)}
      state={state}
      onCreate={() => void navigate(newsCreatePath(space.id))}
      onOpen={(id) => void navigate(newsDetailPath(space.id, id))}
      onReview={() => void navigate(proposalListPath(space.id))}
      onRetry={() => setState("default")}
    />
  );
}
