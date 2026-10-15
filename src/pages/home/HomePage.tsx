import { useNavigate, useOutletContext } from "react-router";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { HomeContent } from "@/features/dashboard/ui/HomeContent";
import { homeScreenStates } from "@/features/dashboard/model/homeScreenStates";
import { getMockHomeData } from "@/features/dashboard/model/mockHomeData";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { getRecordsWithProposals } from "@/features/proposal/model/proposalSelectors";
import {
  spacePath,
  spaceInvitePath,
  newsDetailPath,
  proposalListPath,
  proposalResultPath,
  careChangePath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { careItemPath, careListPath } from "@/routes/paths";
import { useCareNow } from "@/features/careitem/model/useCareNow";

export function HomePage() {
  const space = useOutletContext<CareSpaceView>();
  const records = useMockRecords(space);
  const proposals = useMockProposals(space);
  const navigate = useNavigate();
  const now = useCareNow();
  const data = getMockHomeData(
    getRecordsWithProposals(records, proposals),
    proposals,
    space,
    now,
  );
  const defaultState =
    space.empty &&
    !records.length &&
    !proposals.items.length &&
    !data.pendingCount
      ? "empty"
      : "default";
  const [state, setState] = useMockScreenState(homeScreenStates, defaultState);
  return (
    <HomeContent
      space={space}
      data={data}
      state={state}
      onFamily={() => void navigate(spacePath(space.id, "family"))}
      onInvite={() => void navigate(spaceInvitePath(space.id))}
      onNews={() => void navigate(spacePath(space.id, "news"))}
      onOpenNews={(id) => void navigate(newsDetailPath(space.id, id))}
      onCare={(filter) => void navigate(careListPath(space.id, filter))}
      onOpenCare={(id) => void navigate(careItemPath(space.id, id))}
      onPending={() => void navigate(proposalListPath(space.id))}
      onHistory={() => void navigate(proposalListPath(space.id, "applied"))}
      onChange={(id) =>
        void navigate(
          proposals.careChanges?.some((change) => change.id === id)
            ? careChangePath(space.id, id)
            : proposalResultPath(space.id, id),
        )
      }
      onRetry={() => setState(defaultState)}
    />
  );
}
