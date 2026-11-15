import { useParams } from "react-router";
import { Button, Icon } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareEvidence } from "@/features/careitem/model/useCareQueries";
import {
  formatServerTime,
  parseCareEvidenceValues,
} from "@/features/careitem/model/careReadView";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, newsDetailPath } from "@/routes/paths";
export function CareSourcesPage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const query = useCareEvidence(space.spaceId, itemId);
  const members = useSpaceMembers(space.spaceId);
  const back = useBackNavigation(
    withReturn(careItemPath(space.spaceId, itemId)),
  );
  return (
    <ProposalPageLayout
      title="근거 보기"
      spaceId={space.spaceId}
      onBack={back}
    >
      <h1 className="text-hm-title-page">돌봄 정보의 근거</h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        기록할 때 참고한 자료라 현재 내용과 다를 수 있어요.
      </p>
      {!query.data || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : query.data.items.length ? (
        query.data.items.map((e) => (
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
                <CareFieldList
                  values={parseCareEvidenceValues(e.text)}
                  members={members.data}
                  emptyText="표시할 수 있는 내용이 없어요."
                />
              </details>
            )}
            {e.recordId && e.status === "VALID" && (
              <Button
                variant="secondary"
                className="min-h-hm-touch-min self-start py-hm-8"
                onClick={() =>
                  void navigate(
                    withReturn(newsDetailPath(space.spaceId, e.recordId!)),
                  )
                }
              >
                소식 원본 보기
              </Button>
            )}
          </article>
        ))
      ) : (
        <EmptyState
          title="연결된 근거가 없어요"
          body="아직 표시할 자료가 없어요."
        />
      )}
    </ProposalPageLayout>
  );
}
