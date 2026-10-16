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
import { MenuRow } from "@/components/ui";
import { careRequestsPath } from "@/routes/paths";
import { spaceInfoRequestsPath } from "@/routes/paths";
import { useMockSpaceInfoChanges } from "@/features/carespace/model/mockSpaceInfoChanges";

export function ProposalListPage() {
  const space = useOutletContext<CareSpaceView>();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const spaceChanges = useMockSpaceInfoChanges(space.id);
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
      <MenuRow
        icon="care-brand"
        title="돌봄에서 직접 남긴 요청·변경"
        onClick={() =>
          void navigate(
            `${careRequestsPath(space.id)}?status=${status === "applied" ? "applied" : status === "rejected" ? "rejected" : "requested"}`,
          )
        }
      />
      <MenuRow
        icon="edit"
        title="공간 정보 수정 요청"
        description={`승인 대기 ${spaceChanges.filter((change) => change.status === "requested").length}건`}
        onClick={() =>
          void navigate(
            `${spaceInfoRequestsPath(space.id)}?status=${status === "applied" ? "applied" : status === "rejected" ? "rejected" : "requested"}`,
          )
        }
      />
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
