import { useNavigate, useOutletContext, useSearchParams } from "react-router";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { proposalTabs } from "@/features/proposal/model/proposalViewTypes";
import { proposalListStates } from "@/features/proposal/model/proposalScreenStates";
import { ProposalList } from "@/features/proposal/ui/ProposalList";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  newsDetailPath,
  proposalRequestPath,
  proposalResultPath,
  proposalReviewPath,
  spacePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function ProposalListPage() {
  const space = useOutletContext<CareSpaceView>();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status =
    proposalTabs.find((tab) => tab.value === params.get("status"))?.value ??
    "review";
  const [state, setState] = useMockScreenState(proposalListStates, "default");
  const onBack = useBackNavigation(spacePath(space.id, "news"));
  return (
    <ProposalPageLayout
      title="확인할 내용"
      spaceId={space.id}
      onBack={onBack}
      tabs
      preview={{
        value: state,
        options: proposalListStates,
        onChange: setState,
      }}
    >
      <ProposalList
        space={space}
        data={data}
        records={records}
        status={status}
        state={state}
        onStatus={(value) => {
          void setParams(
            (previous) => {
              const next = new URLSearchParams(previous);
              next.set("status", value);
              return next;
            },
            { preventScrollReset: true },
          );
        }}
        onReview={(id) => void navigate(proposalReviewPath(space.id, id))}
        onRequest={(id) => void navigate(proposalRequestPath(space.id, id))}
        onResult={(id) => void navigate(proposalResultPath(space.id, id))}
        onSource={(id) => void navigate(newsDetailPath(space.id, id))}
        onNews={() => void navigate(spacePath(space.id, "news"))}
        onRetry={() => setState("default")}
      />
    </ProposalPageLayout>
  );
}
