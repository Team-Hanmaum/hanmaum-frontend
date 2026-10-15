import { useNavigate, useOutletContext } from "react-router";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { CareList } from "@/features/careitem/ui/CareList";
import { careListStates } from "@/features/careitem/model/careScreenStates";
import { useCareNow } from "@/features/careitem/model/useCareNow";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { getCarePendingProposals } from "@/features/proposal/model/proposalSelectors";
import { CarePendingNotice } from "@/features/proposal/ui/CarePendingNotice";
import { useCareListFilter } from "@/routes/useCareListFilter";
import { useCareProposalNavigation } from "@/routes/useCareProposalNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { careItemPath, careRequestsPath } from "@/routes/paths";
import { MenuRow } from "@/components/ui";

export function CarePage() {
  const space = useOutletContext<CareSpaceView>();
  const data = useMockProposals(space);
  const { filter, setType, setStatus } = useCareListFilter();
  const [state, setState] = useMockScreenState(careListStates, "default");
  const navigate = useNavigate();
  const onProposal = useCareProposalNavigation(space.id);
  const now = useCareNow();
  return (
    <>
      <MenuRow
        icon="news-brand"
        title="돌봄 요청·변경 확인"
        description="직접 남긴 요청과 반영 결과"
        onClick={() => void navigate(careRequestsPath(space.id))}
      />
      <CareList
        items={data.items}
        members={space.members}
        filter={filter}
        state={state}
        now={now}
        onType={setType}
        onStatus={setStatus}
        onOpen={(id) => void navigate(careItemPath(space.id, id))}
        onRetry={() => setState("default")}
        proposalNotice={(item) => (
          <CarePendingNotice
            proposals={getCarePendingProposals(data, item.id, space)}
            onOpen={onProposal}
          />
        )}
      />
    </>
  );
}
