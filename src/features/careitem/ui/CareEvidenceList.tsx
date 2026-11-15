import { Button, Icon } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareEvidence } from "../model/useCareQueries";
import {
  formatServerTime,
  parseCareEvidenceValues,
} from "../model/careReadView";
import { CareFieldList } from "./CareFieldList";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { newsDetailPath } from "@/routes/paths";

export function CareEvidenceList({
  spaceId,
  itemId,
  expanded = false,
}: {
  spaceId: string;
  itemId: string;
  expanded?: boolean;
}) {
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const query = useCareEvidence(spaceId, itemId);
  const members = useSpaceMembers(spaceId);
  return (
    <div className="flex flex-col gap-hm-12">
      {!query.data || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : query.data.items.length ? (
        query.data.items.map((e) => {
          const fieldList = (
            <CareFieldList
              values={
                e.status === "VALID" && e.kind !== "RECORD_QUOTE"
                  ? parseCareEvidenceValues(e.text)
                  : null
              }
              members={members.data}
              emptyText="표시할 수 있는 내용이 없어요."
            />
          );
          return (
            <article
              key={e.evidenceId}
              className="flex flex-col gap-hm-12 rounded-hm-16 bg-hm-bg-surface p-hm-16"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-hm-12 gap-y-hm-4">
                <h2 className="text-hm-body-emphasis">
                  {e.status === "REDACTED"
                    ? "내용 제거됨"
                    : e.kind === "RECORD_QUOTE"
                      ? "가족 소식"
                      : e.kind === "DIRECT_INPUT"
                        ? "직접 입력"
                        : "연결된 근거"}
                </h2>
                {e.createdAt && (
                  <time
                    dateTime={e.createdAt}
                    className="text-hm-caption-default text-hm-text-secondary"
                  >
                    {formatServerTime(e.createdAt)}
                  </time>
                )}
              </div>
              {e.status === "REDACTED" ? (
                <p className="text-hm-body-small text-hm-text-secondary">
                  삭제되거나 공개할 수 없는 내용이에요.
                </p>
              ) : e.kind === "RECORD_QUOTE" ? (
                <blockquote className="border-l-2 border-hm-border-default pl-hm-12 text-hm-body-default wrap-anywhere whitespace-pre-wrap">
                  {e.text ?? "표시할 수 있는 인용이 없어요."}
                </blockquote>
              ) : expanded ? (
                fieldList
              ) : (
                <details className="group">
                  <summary className="hm-focus-ring flex min-h-hm-touch-min cursor-pointer list-none items-center justify-between gap-hm-8 rounded-hm-8 text-hm-body-small font-bold text-hm-text-brand [&::-webkit-details-marker]:hidden">
                    {e.kind === "DIRECT_INPUT"
                      ? "입력 내용 보기"
                      : "근거 내용 보기"}
                    <span className="inline-flex group-open:rotate-90">
                      <Icon name="chevron-right-secondary" />
                    </span>
                  </summary>
                  {fieldList}
                </details>
              )}
              {e.recordId && e.status === "VALID" && (
                <Button
                  variant="secondary"
                  className="min-h-hm-touch-min self-start py-hm-8"
                  onClick={() =>
                    void navigate(
                      withReturn(newsDetailPath(spaceId, e.recordId!)),
                    )
                  }
                >
                  소식 원본 보기
                </Button>
              )}
            </article>
          );
        })
      ) : (
        <EmptyState
          title="연결된 근거가 없어요"
          body="아직 표시할 자료가 없어요."
        />
      )}
    </div>
  );
}
