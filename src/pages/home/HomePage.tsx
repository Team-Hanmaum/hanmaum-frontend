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
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function HomePage() {
  const space = useOutletContext<CareSpaceView>();
  const records = useMockRecords(space);
  const proposals = useMockProposals(space);
  const navigate = useNavigate();
  const [state, setState] = useMockScreenState(
    homeScreenStates,
    space.empty ? "empty" : "default",
  );
  return (
    <HomeContent
      space={space}
      data={getMockHomeData(
        getRecordsWithProposals(records, proposals),
        proposals,
        space,
      )}
      state={state}
      onFamily={() => void navigate(spacePath(space.id, "family"))}
      onInvite={() => void navigate(spaceInvitePath(space.id))}
      onNews={() => void navigate(spacePath(space.id, "news"))}
      onOpenNews={(id) => void navigate(newsDetailPath(space.id, id))}
      onCare={() => void navigate(spacePath(space.id, "care"))}
      onPending={() => void navigate(proposalListPath(space.id))}
      onHistory={() => void navigate(proposalListPath(space.id, "applied"))}
      onRetry={() => setState(space.empty ? "empty" : "default")}
    />
  );
}
