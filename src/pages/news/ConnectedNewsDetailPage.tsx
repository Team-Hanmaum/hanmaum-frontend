import { useRef, useState } from "react";
import { useParams } from "react-router";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { Button, TextAction } from "@/components/ui";
import {
  useRecordAnalysis,
  useRecordDetail,
} from "@/features/record/model/useRecords";
import { useRetryRecordAnalysis } from "@/features/record/model/useRecordMutations";
import { toRecordView } from "@/features/record/model/recordView";
import type { RecordDetail } from "@/features/record/api/recordReadTypes";
import { NewsDetail } from "@/features/record/ui/NewsDetail";
import { ApiError } from "@/lib/api";
import { SpaceBottomNavigation } from "@/routes/layouts/SpaceBottomNavigation";
import {
  paths,
  spacePath,
  proposalReviewPath,
  newsDeletePath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

type RetryNotice = { title: string; body: string };

function describeRetryError(error: ApiError): RetryNotice {
  if (
    error.code === "VERSION_CONFLICT" ||
    error.code === "ANALYSIS_STATE_CONFLICT"
  )
    return {
      title: "소식 상태가 바뀌었어요",
      body: "최신 분석 상태를 다시 불러왔어요. 상태를 확인해 주세요.",
    };
  return {
    title: "분석을 다시 요청하지 못했어요",
    body: "남긴 소식은 그대로 있어요. 잠시 후 다시 시도해 주세요.",
  };
}

export function ConnectedNewsDetailPage() {
  const { withdrawing, withReturn, returnToWithdrawal } = useWithdrawalReturn();
  const { space } = useConnectedSpace();
  const { recordId = "" } = useParams();
  const navigate = useAppNavigate();
  const listPath = withReturn(spacePath(space.spaceId, "news"));
  const onBack = useBackNavigation(listPath);
  const detail = useRecordDetail(space.spaceId, recordId);
  const analysis = useRecordAnalysis(
    space.spaceId,
    recordId,
    detail.data?.latestAnalysis,
  );
  const retry = useRetryRecordAnalysis(space.spaceId, recordId);
  const [retryNotice, setRetryNotice] = useState<RetryNotice>();
  // 같은 실패 실행의 재시도 재전송에는 같은 요청 ID를 사용한다.
  const retryAttempt = useRef<{ failedId: string; id: string } | null>(null);
  const onList = () => void navigate(listPath, { motion: "back" });

  // 상세보다 분석 조회가 먼저 끝난 경우 최신 분석 상태와 제안 ID를 우선 표시한다.
  const record: RecordDetail | undefined =
    detail.data &&
    analysis.data &&
    detail.data.latestAnalysis?.analysisId === analysis.data.analysisId
      ? {
          ...detail.data,
          latestAnalysis: {
            analysisId: analysis.data.analysisId,
            status: analysis.data.status,
          },
          proposalIds:
            analysis.data.status === "COMPLETED"
              ? analysis.data.proposalIds
              : detail.data.proposalIds,
        }
      : detail.data;
  const view = record ? toRecordView(record, space.spaceId) : undefined;
  const latest = record?.latestAnalysis;
  const canRetry =
    latest?.status === "FAILED" &&
    analysis.data?.analysisId === latest.analysisId &&
    analysis.data.canRetry;

  function retryAnalysis() {
    if (!record || !latest || retry.isPending) return;
    if (retryAttempt.current?.failedId !== latest.analysisId)
      retryAttempt.current = {
        failedId: latest.analysisId,
        id: crypto.randomUUID(),
      };
    setRetryNotice(undefined);
    retry.mutate(
      {
        failedAnalysisId: latest.analysisId,
        expectedRecordVersion: record.version,
        clientRequestId: retryAttempt.current.id,
      },
      {
        onSuccess: () => {
          retryAttempt.current = null;
        },
        onError: (error) => {
          if (
            error.code === "VERSION_CONFLICT" ||
            error.code === "ANALYSIS_STATE_CONFLICT" ||
            error.code === "IDEMPOTENCY_KEY_REUSED"
          )
            retryAttempt.current = null;
          setRetryNotice(describeRetryError(error));
        },
      },
    );
  }

  const failure = detail.error;
  const missing = failure instanceof ApiError && failure.status === 404;
  const denied = failure instanceof ApiError && failure.status === 403;
  return (
    <DetailLayout
      title="소식 상세"
      onBack={onBack}
      footer={
        <FixedBottomArea position="fixed">
          {view && (
            <div className="flex flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
              {canRetry ? (
                <>
                  <Button
                    className="w-full"
                    onClick={retryAnalysis}
                    loading={retry.isPending}
                    loadingLabel="분석을 다시 요청하고 있어요"
                  >
                    분석 다시 시도
                  </Button>
                  <TextAction
                    className="w-full"
                    onClick={onList}
                  >
                    소식 목록으로
                  </TextAction>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={onList}
                >
                  소식 목록으로
                </Button>
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
            spaceId={space.spaceId}
            active="news"
          />
        </FixedBottomArea>
      }
    >
      {view ? (
        <>
          {retryNotice && (
            <Notice
              tone="error"
              role="alert"
              title={retryNotice.title}
              body={retryNotice.body}
            />
          )}
          {analysis.isError && latest && latest.status !== "COMPLETED" && (
            <Notice
              tone="error"
              role="alert"
              title="분석 상태를 확인하지 못했어요"
              body="남긴 소식은 그대로 있어요. 잠시 후 다시 확인해 주세요."
              action={{
                label: "다시 확인하기",
                onClick: () => void analysis.refetch(),
              }}
            />
          )}
          <NewsDetail
            record={view}
            status={view.analysisStatus}
            owner={space.role === "OWNER"}
            onDelete={
              record?.canDelete
                ? () =>
                    void navigate(
                      withReturn(newsDeletePath(space.spaceId, recordId)),
                    )
                : undefined
            }
          />
          {view.proposalSummary && (
            <Notice
              tone="neutral"
              title="분석으로 만들어진 제안을 확인해 주세요"
              body="제안의 근거와 현재 돌봄 정보를 비교한 뒤 반영하거나 소유자에게 요청할 수 있어요."
              action={{
                label: "제안 검토하기",
                onClick: () =>
                  void navigate(
                    withReturn(proposalReviewPath(space.spaceId, recordId)),
                  ),
              }}
            />
          )}
        </>
      ) : detail.isPending ? (
        <LoadingState label="소식을 불러오고 있어요" />
      ) : (
        <>
          <h1 className="sr-only">소식 상세</h1>
          {missing ? (
            <ErrorState
              reason="load-error"
              title="소식을 찾을 수 없어요"
              body="삭제됐거나 이 공간의 소식이 아니에요."
              actionLabel="소식 목록으로"
              onAction={onList}
            />
          ) : denied ? (
            <ErrorState
              reason="no-permission"
              title="이 공간에 접근할 수 없어요"
              actionLabel="참여 공간 선택"
              onAction={() => void navigate(paths.spaces)}
            />
          ) : (
            <ErrorState
              reason={
                failure instanceof ApiError && failure.kind === "network"
                  ? "offline"
                  : "load-error"
              }
              title="소식을 불러오지 못했어요"
              loading={detail.isFetching}
              onAction={() => void detail.refetch()}
            />
          )}
        </>
      )}
    </DetailLayout>
  );
}
