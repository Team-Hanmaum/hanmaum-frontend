import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { Badge, Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { useProposalRouteSelection } from "@/routes/useProposalRouteSelection";
import { proposalStatusLabel } from "@/features/proposal/model/proposalViewTypes";
import { ProposalSummaryCard } from "@/features/proposal/ui/ProposalSummaryCard";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalReview } from "@/features/proposal/ui/ProposalReview";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  newsDetailPath,
  proposalConfirmPath,
  proposalListPath,
  proposalResultPath,
  proposalEvidencePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function ProposalRequestPage() {
  const space = useOutletContext<CareSpaceView>();
  const { requestId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const content = params.get("view") === "content";
  const request = data.requests.find(
    (item) =>
      item.id === requestId &&
      (space.role === "owner" ||
        item.author.id === space.members.find((member) => member.self)?.id),
  );
  const remaining = data.proposals.filter(
    (item) =>
      item.requestId === request?.id &&
      item.status === "requested" &&
      !item.sourceDeleted,
  );
  const { selected, toggle } = useProposalRouteSelection(remaining, data);
  const owner = space.role === "owner";
  const onBack = useBackNavigation(proposalListPath(space.id, "requested"));
  const onSource = (id: string) => void navigate(newsDetailPath(space.id, id));
  const awaiting = remaining.length > 0;
  const removed = request?.proposals.every(
    (proposal) => proposal.sourceDeleted,
  );
  const ownerName =
    space.members.find((member) => member.role === "owner")?.name ?? "소유자";
  const onView = () =>
    void setParams(content ? {} : { view: "content" }, {
      preventScrollReset: false,
    });
  const review = owner && awaiting;
  return (
    <ProposalPageLayout
      title={review ? "요청 검토" : content ? "요청한 내용" : "요청 상태"}
      spaceId={space.id}
      onBack={onBack}
      tabs={!review}
      actions={
        request && (
          <>
            {review ? (
              <Button
                disabled={!selected.length}
                onClick={() =>
                  void navigate(proposalConfirmPath(space.id), {
                    state: { requestId, selection: selected },
                  })
                }
              >
                반영할 내용 확인
              </Button>
            ) : (
              <Button onClick={onView}>
                {content ? "요청 상태 보기" : "요청한 내용 다시 보기"}
              </Button>
            )}
            <TextAction
              onClick={() =>
                void navigate(proposalListPath(space.id, "requested"))
              }
            >
              요청 목록으로
            </TextAction>
          </>
        )
      }
    >
      {!request ? (
        <EmptyState
          title="요청을 확인할 수 없어요"
          body="현재 공간의 요청을 다시 선택해 주세요. 새로고침하면 직접 보낸 Mock 요청은 초기화돼요."
          action={{
            label: "요청 목록으로",
            onClick: () =>
              void navigate(proposalListPath(space.id, "requested")),
          }}
        />
      ) : review ? (
        <ProposalReview
          subjectLabel={space.subjectLabel}
          owner
          proposals={remaining}
          data={data}
          records={records}
          selected={selected}
          onSelect={toggle}
          onSource={onSource}
          busy={false}
          requestError={false}
          onCompare={(id) => void navigate(proposalEvidencePath(space.id, id))}
        />
      ) : (
        <>
          <Badge
            label={removed ? "원본 삭제" : awaiting ? "승인 요청" : "처리 완료"}
            tone="brand"
          />
          <h1 className="text-hm-title-page whitespace-pre-line">
            {removed
              ? "원본 삭제로 요청 내용을 제거했어요"
              : awaiting
                ? content
                  ? "이미 반영을\n요청한 내용이에요"
                  : "반영을 요청했어요"
                : "요청 처리 결과를 확인해 주세요"}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {removed
              ? "삭제된 내용은 표시하지 않으며 현재 정보에 반영할 수 없어요."
              : awaiting
                ? `${ownerName}님의 확인을 기다리고 있어요.`
                : "소유자가 결정한 내용을 항목별로 확인할 수 있어요."}
          </p>
          {request.proposals.map((proposal) => {
            const current = data.proposals.find(
              (item) => item.id === proposal.id,
            );
            return (
              <ProposalSummaryCard
                members={space.members}
                key={proposal.id}
                proposal={{ ...proposal, beforeLabel: "요청 당시 정보" }}
                label={
                  current?.sourceDeleted
                    ? "원본 삭제"
                    : current
                      ? proposalStatusLabel(current.status)
                      : "요청 내용"
                }
                afterLabel="요청한 내용"
                meta={proposal.context}
                action={
                  current?.resultId
                    ? {
                        label: "처리 결과 보기",
                        onClick: () =>
                          void navigate(
                            proposalResultPath(space.id, current.resultId!),
                          ),
                      }
                    : undefined
                }
              />
            );
          })}
          <p className="text-hm-body-small text-hm-text-secondary">
            요청: {request.author.name} · {formatRecordDate(request.createdAt)}
          </p>
          {content && (
            <ProposalSources
              proposals={request.proposals}
              records={records}
              onSource={onSource}
            />
          )}
          {awaiting && (
            <Notice
              title="아직 반영되지 않은 내용이 있어요"
              body="요청만으로 현재 정보가 바뀌지 않아요. 소유자가 반영하면 변경된 내용을 볼 수 있어요."
            />
          )}
        </>
      )}
    </ProposalPageLayout>
  );
}
