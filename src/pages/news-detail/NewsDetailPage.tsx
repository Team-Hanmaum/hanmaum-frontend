import { useState } from "react";
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
import { NewsDetail } from "@/features/record/ui/NewsDetail";
import {
  RecordPendingSheet,
  type RecordPendingAction,
} from "@/features/record/ui/RecordPendingSheet";
import { SpaceBottomNavigation } from "@/routes/layouts/SpaceBottomNavigation";
import { spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function NewsDetailPage() {
  const space = useOutletContext<CareSpaceView>();
  const { recordId = "" } = useParams();
  const records = useMockRecords(space);
  const record = records.find((item) => item.id === recordId);
  const navigate = useNavigate();
  const listPath = spacePath(space.id, "news");
  const onBack = useBackNavigation(listPath);
  const options = record?.proposal
    ? newsDetailStates
    : newsDetailStates.filter((item) => item.value !== "review");
  const [state, setState] = useMockScreenState(options, "default");
  const [action, setAction] = useState<RecordPendingAction>(null);
  const { pending, retry } = useMockRecordAnalysis(space, recordId, () =>
    setState("default"),
  );
  const status = state === "default" ? record?.analysisStatus : state;
  const hasSecondary = status === "review" || status === "failed";
  const onList = () => void navigate(listPath);
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
                      : status === "review"
                        ? () => setAction("review")
                        : onList
                  }
                  loading={pending}
                  loadingLabel="분석을 다시 준비하고 있어요"
                >
                  {status === "failed"
                    ? "분석 다시 시도"
                    : status === "review"
                      ? "확인할 내용 보기"
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
            <SpaceBottomNavigation
              spaceId={space.id}
              active="news"
            />
          </FixedBottomArea>
        }
      >
        {record && status ? (
          <NewsDetail
            record={record}
            status={status}
            owner={space.role === "owner"}
            onDelete={() => setAction("delete")}
          />
        ) : (
          <>
            <h1 className="sr-only">소식 상세</h1>
            <ErrorState
              reason="load-error"
              title="화면 확인용 소식이 없어요"
              body="새로고침하면 직접 남긴 Mock 소식은 초기화돼요. 목록에서 소식을 다시 선택해 주세요."
              actionLabel="소식 목록으로"
              onAction={onList}
            />
          </>
        )}
      </DetailLayout>
      <RecordPendingSheet
        action={action}
        onClose={() => setAction(null)}
      />
    </>
  );
}
