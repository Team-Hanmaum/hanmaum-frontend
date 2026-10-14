import { useNavigate, useOutletContext, useParams } from "react-router";
import { Button, TextAction } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { useProposalSelection } from "@/features/proposal/model/useProposalSelection";
import { useProposalAction } from "@/features/proposal/model/useProposalAction";
import { proposalReviewStates } from "@/features/proposal/model/proposalScreenStates";
import { ProposalReview } from "@/features/proposal/ui/ProposalReview";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  newsDetailPath,
  proposalConfirmPath,
  proposalListPath,
  proposalRequestPath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function ProposalReviewPage() {
  const space = useOutletContext<CareSpaceView>();
  const { recordId = "" } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const proposals = data.proposals.filter(
    (item) => item.recordId === recordId && item.status === "review",
  );
  const { selected, toggle } = useProposalSelection(proposals, data);
  const { pending, failure, submit } = useProposalAction(space);
  const [state, setState] = useMockScreenState(proposalReviewStates, "default");
  const navigate = useNavigate();
  const onBack = useBackNavigation(proposalListPath(space.id));
  const owner = space.role === "owner";
  const missing = !records.some((item) => item.id === recordId);
  const empty = !proposals.length || missing;
  const requestError = failure === "request-error";
  function proceed() {
    if (!selected.length) return;
    if (owner)
      void navigate(proposalConfirmPath(space.id), {
        state: { selection: selected, recordId },
      });
    else {
      if (requestError) setState("default");
      submit(
        selected,
        "request",
        (id) => void navigate(proposalRequestPath(space.id, id)),
        !requestError && state === "request-error"
          ? "request-error"
          : undefined,
      );
    }
  }
  return (
    <ProposalPageLayout
      title="제안 검토"
      spaceId={space.id}
      onBack={onBack}
      preview={{
        value: state,
        options: proposalReviewStates,
        onChange: setState,
      }}
      actions={
        !empty && (
          <>
            <Button
              className="w-full"
              disabled={!selected.length}
              loading={pending}
              onClick={proceed}
            >
              {owner
                ? "반영할 내용 확인"
                : requestError
                  ? `선택한 ${selected.length}건 다시 요청`
                  : selected.length
                    ? `선택한 ${selected.length}건 반영 요청`
                    : "반영 요청하기"}
            </Button>
            <TextAction
              className="w-full"
              onClick={() => void navigate(proposalListPath(space.id))}
              disabled={pending}
            >
              나중에 확인하기
            </TextAction>
          </>
        )
      }
    >
      {empty ? (
        <EmptyState
          title={missing ? "소식을 확인할 수 없어요" : "검토할 제안이 없어요"}
          body="이미 요청하거나 처리한 내용은 확인할 내용 목록에서 다시 볼 수 있어요."
          action={{
            label: "확인할 내용 목록으로",
            onClick: () =>
              void navigate(proposalListPath(space.id, "requested")),
          }}
        />
      ) : (
        <>
          {failure && failure !== "request-error" && (
            <Notice
              role="alert"
              tone="error"
              title="다시 확인해 주세요"
              body="제안의 상태·원본·현재 정보를 다시 확인해 주세요. 현재 정보는 변경되지 않았어요."
            />
          )}
          <ProposalReview
            subjectLabel={space.subjectLabel}
            owner={owner}
            proposals={proposals}
            data={data}
            records={records}
            selected={selected}
            onSelect={toggle}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
            busy={pending}
            requestError={requestError}
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
