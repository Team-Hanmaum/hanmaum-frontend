import { useRef } from "react";
import { EmptyState, ErrorState, Notice } from "@/components/feedback";
import { SectionHeader } from "@/components/layout";
import { Button, Spinner, type BadgeProps } from "@/components/ui";
import { formatRecordTime, groupRecordsByDay } from "../model/recordDates";
import type { RecordView } from "../model/recordViewTypes";
import type { NewsListState } from "../model/newsScreenStates";
import { NewsPreviewCard } from "./NewsPreviewCard";
import type { NewsStatus } from "./NewsCard";
import { sortNewsRecords } from "../model/newsPagination";

const previewBadges: Partial<
  Record<NewsStatus, Pick<BadgeProps, "label" | "tone">>
> = {
  analyzing: { label: "분석 중", tone: "neutral" },
  review: { label: "검토 대기", tone: "brand" },
  pending: { label: "승인 대기", tone: "neutral" },
  failed: { label: "분석 실패", tone: "error" },
};

export function NewsList({
  records,
  state,
  onCreate,
  onOpen,
  onRetry,
  onMore,
  paging,
}: {
  records: readonly RecordView[];
  state: NewsListState;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onRetry: () => void;
  onMore: () => void;
  // 서버 커서 페이지: 불러온 소식을 모두 표시하고 다음 페이지 유무는 서버 응답을 따른다.
  paging: { hasNext: boolean; loading: boolean };
}) {
  const nextFocusIndex = useRef<number | null>(null);
  const visible = sortNewsRecords(records);
  const indexById = new Map(visible.map((record, index) => [record.id, index]));
  function showMore() {
    nextFocusIndex.current = visible.length;
    onMore();
  }
  if (state === "loading")
    return (
      <>
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
            className="flex flex-col gap-hm-12"
            aria-label={group.label}
          >
            <SectionHeader title={group.label} />
            <div className="flex flex-col gap-hm-8">
              {group.records.map((record) => (
                <NewsPreviewCard
                  key={record.id}
                  title={
                    record.title === "가족 소식" ? undefined : record.title
                  }
                  author={{
                    name: record.author.name,
                    profileImageUrl: record.author.profileImageUrl,
                    isMine: record.author.self,
                  }}
                  time={formatRecordTime(record.createdAt)}
                  body={record.body}
                  badge={
                    previewBadges[
                      record.proposalSummary?.status ?? record.analysisStatus
                    ]
                  }
                  onOpen={() => onOpen(record.id)}
                  ref={(element) => {
                    if (
                      element &&
                      nextFocusIndex.current === indexById.get(record.id)
                    ) {
                      nextFocusIndex.current = null;
                      element.focus({ preventScroll: true });
                    }
                  }}
                />
              ))}
            </div>
          </section>
        ))
      )}
      {!empty && state !== "error" && (
        <div className="flex flex-col gap-hm-12">
          <p
            role="status"
            className="sr-only"
          >
            {`불러온 소식 ${visible.length}건`}
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
                loading={paging.loading}
                loadingLabel="이전 소식을 불러오고 있어요"
              >
                나머지 소식 다시 불러오기
              </Button>
            </>
          ) : paging.hasNext ? (
            <Button
              variant="secondary"
              onClick={showMore}
              loading={paging.loading}
              loadingLabel="이전 소식을 불러오고 있어요"
            >
              이전 소식 더 보기
            </Button>
          ) : null}
        </div>
      )}
    </>
  );
}
