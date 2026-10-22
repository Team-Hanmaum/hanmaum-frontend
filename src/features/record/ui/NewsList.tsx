import { useRef } from "react";
import { EmptyState, ErrorState, Notice } from "@/components/feedback";
import { SectionHeader } from "@/components/layout";
import { Button, MenuRow, Spinner } from "@/components/ui";
import { formatRecordTime, groupRecordsByDay } from "../model/recordDates";
import type { RecordView } from "../model/recordViewTypes";
import type { NewsListState } from "../model/newsScreenStates";
import { NewsCard } from "./NewsCard";
import { sortNewsRecords } from "../model/newsPagination";

export function NewsList({
  records,
  state,
  onCreate,
  onOpen,
  onReview,
  onRetry,
  pendingCount,
  visibleCount,
  onMore,
}: {
  records: readonly RecordView[];
  state: NewsListState;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onReview: () => void;
  onRetry: () => void;
  pendingCount: number;
  visibleCount: number;
  onMore: () => void;
}) {
  const nextFocus = useRef<string | null>(null);
  const sorted = sortNewsRecords(records);
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visible.length < sorted.length;
  function showMore() {
    nextFocus.current = sorted[visible.length]?.id ?? null;
    onMore();
  }
  if (state === "loading")
    return (
      <>
        <h1 className="text-hm-title-page">소식</h1>
        <div
          role="status"
          aria-label="가족의 소식을 불러오는 중"
        >
          <Spinner />
        </div>
        <Notice
          tone="neutral"
          title="가족의 소식을 불러오고 있어요"
          body="최신 내용을 확인하고 있어요."
        />
      </>
    );
  const empty = state === "empty" || records.length === 0;
  return (
    <>
      <h1 className="text-hm-title-page">가족 소식</h1>
      <MenuRow
        icon="info-brand"
        title={
          !empty && state !== "error" && pendingCount
            ? `확인할 내용 ${pendingCount}건`
            : "확인할 내용"
        }
        description="제안과 가족의 변경 요청"
        onClick={onReview}
      />
      {state === "error" ? (
        <ErrorState
          reason="load-error"
          onAction={onRetry}
        />
      ) : empty ? (
        <EmptyState
          title="아직 남긴 소식이 없어요"
          body={
            "병원에서 들은 이야기나 오늘의 변화를\n가족에게 편하게 남겨 보세요."
          }
          action={{ label: "첫 소식 남기기", onClick: onCreate }}
        />
      ) : (
        groupRecordsByDay(visible).map((group) => (
          <section
            key={group.id}
            className="flex flex-col gap-hm-24"
            aria-label={group.label}
          >
            <SectionHeader title={group.label} />
            {group.records.map((record) => (
              <div
                key={record.id}
                tabIndex={-1}
                aria-label={record.title}
                ref={(element) => {
                  if (element && nextFocus.current === record.id) {
                    nextFocus.current = null;
                    element.focus({ preventScroll: true });
                  }
                }}
              >
                <NewsCard
                  title={record.title}
                  author={`${record.author.name} · ${formatRecordTime(record.createdAt)}`}
                  body={record.body}
                  previewBody
                  status={
                    record.proposalSummary?.status ?? record.analysisStatus
                  }
                  statusMessage={
                    record.proposalSummary?.message ??
                    (record.analysisStatus === "review"
                      ? "변경 제안 1건을 확인해 주세요."
                      : undefined)
                  }
                  actionLabel="소식 자세히 보기"
                  onAction={() => onOpen(record.id)}
                />
              </div>
            ))}
          </section>
        ))
      )}
      {!empty && state !== "error" && (
        <div className="flex flex-col gap-hm-12">
          <p
            role="status"
            className="text-center text-hm-body-small text-hm-text-secondary"
          >
            전체 {records.length}건 중 {visible.length}건
          </p>
          {state === "more-error" ? (
            <>
              <Notice
                tone="neutral"
                title="나머지 소식을 불러오지 못했어요"
                body="지금 보이는 소식은 계속 확인할 수 있어요."
              />
              <Button
                variant="secondary"
                onClick={showMore}
              >
                나머지 소식 다시 불러오기
              </Button>
            </>
          ) : hasMore ? (
            <Button
              variant="secondary"
              onClick={showMore}
            >
              이전 소식 더 보기
            </Button>
          ) : null}
        </div>
      )}
    </>
  );
}
