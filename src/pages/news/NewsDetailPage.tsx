import { useNavigate, useOutletContext, useParams } from "react-router";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { ErrorState } from "@/components/feedback";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { Button, TextAction } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { useMockRecordAnalysis } from "@/features/record/model/useMockRecordAnalysis";
import { newsDetailStates } from "@/features/record/model/newsScreenStates";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { getRecordsWithProposals } from "@/features/proposal/model/proposalSelectors";
import { NewsDetail } from "@/features/record/ui/NewsDetail";
import { SpaceBottomNavigation } from "@/routes/layouts/SpaceBottomNavigation";
import {
  spacePath,
  proposalListPath,
  proposalRequestPath,
  proposalResultPath,
  proposalReviewPath,
  newsDeletePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function NewsDetailPage() {
  const { withdrawing, withReturn, returnToWithdrawal } = useWithdrawalReturn();
  const space = useOutletContext<CareSpaceView>();
  const { recordId = "" } = useParams();
  const records = useMockRecords(space);
  const proposals = useMockProposals(space);
  const deleted = proposals.deletions?.some(
    (entry) => entry.recordId === recordId,
  );
  const record = getRecordsWithProposals(records, proposals).find(
    (item) => item.id === recordId,
  );
  const navigate = useNavigate();
  const listPath = withReturn(spacePath(space.id, "news"));
  const onBack = useBackNavigation(listPath);
  const options = record?.proposal
    ? newsDetailStates
    : newsDetailStates.filter((item) => item.value !== "review");
  const [state, setState] = useMockScreenState(options, "default");
  const { pending, retry } = useMockRecordAnalysis(space, recordId, () =>
    setState("default"),
  );
  const status =
    state === "default" || state === "withdrawn-author"
      ? (record?.proposalSummary?.status ?? record?.analysisStatus)
      : state;
  const hasProposal = Boolean(record?.proposalSummary);
  const hasSecondary =
    hasProposal || status === "review" || status === "failed";
  const onList = () => void navigate(listPath);
  function onProposals() {
    const related = proposals.proposals.filter(
      (item) => item.recordId === recordId,
    );
    const requested = related.find((item) => item.status === "requested");
    const result = related.find((item) => item.resultId);
    const destination = related.some((item) => item.status === "review")
      ? proposalReviewPath(space.id, recordId)
      : requested?.requestId
        ? proposalRequestPath(space.id, requested.requestId)
        : result?.resultId
          ? proposalResultPath(space.id, result.resultId)
          : proposalListPath(space.id);
    void navigate(withReturn(destination));
  }
  return (
    <>
      <DetailLayout
        title="소식 상세"
        onBack={onBack}
        notice={
          <MockStateSelect
            message="상세 UI 예시 · 실제 분석·돌봄 정보 변경 없음"
            value={state}
            options={options}
            onChange={setState}
          />
        }
        footer={
          <FixedBottomArea position="fixed">
            {record && (
              <div className="flex flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
                <Button
                  className="w-full"
                  onClick={
                    status === "failed"
                      ? retry
                      : hasProposal || status === "review"
                        ? onProposals
                        : onList
                  }
                  loading={pending}
                  loadingLabel="분석을 다시 준비하고 있어요"
                >
                  {status === "failed"
                    ? "분석 다시 시도"
                    : hasProposal || status === "review"
                      ? status === "pending"
                        ? "요청 상태 보기"
                        : status === "applied" || status === "rejected"
                          ? "처리 결과 보기"
                          : "확인할 내용 보기"
                      : "소식 목록으로"}
                </Button>
                {hasSecondary && (
                  <TextAction
                    className="w-full"
                    onClick={onList}
                  >
                    소식 목록으로
                  </TextAction>
                )}
              </div>
            )}
            {withdrawing && (
              <TextAction
                className="w-full bg-hm-bg-surface pb-hm-20"
                onClick={returnToWithdrawal}
              >
                탈퇴 절차로 돌아가기
              </TextAction>
            )}
            <SpaceBottomNavigation
              spaceId={space.id}
              active="news"
            />
          </FixedBottomArea>
        }
      >
        {record && status ? (
          <NewsDetail
            record={
              state === "withdrawn-author"
                ? {
                    ...record,
                    author: {
                      id: "mock-withdrawn-author",
                      name: "탈퇴한 사용자",
                      self: false,
                    },
                  }
                : record
            }
            status={status}
            owner={space.role === "owner"}
            onDelete={
              state === "withdrawn-author"
                ? undefined
                : () =>
                    void navigate(
                      withReturn(newsDeletePath(space.id, recordId)),
                    )
            }
          />
        ) : (
          <>
            <h1 className="sr-only">소식 상세</h1>
            <ErrorState
              reason="load-error"
              title={
                deleted ? "이미 삭제된 소식이에요" : "화면 확인용 소식이 없어요"
              }
              body={
                deleted
                  ? "삭제된 원문과 인용 내용은 다시 표시하지 않아요."
                  : "새로고침하면 직접 남긴 Mock 소식은 초기화돼요. 목록에서 소식을 다시 선택해 주세요."
              }
              actionLabel="소식 목록으로"
              onAction={onList}
            />
          </>
        )}
      </DetailLayout>
    </>
  );
}
