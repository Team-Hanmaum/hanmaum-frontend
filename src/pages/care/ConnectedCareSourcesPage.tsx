import { useParams } from "react-router";
import { Button, Badge } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareEvidence } from "@/features/careitem/model/useCareQueries";
import { formatServerTime } from "@/features/careitem/model/careReadView";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, newsDetailPath } from "@/routes/paths";
export function ConnectedCareSourcesPage() {
  const { space } = useConnectedSpace();
  const { itemId = "" } = useParams();
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const query = useCareEvidence(space.spaceId, itemId);
  const back = useBackNavigation(
    withReturn(careItemPath(space.spaceId, itemId)),
  );
  return (
    <ProposalPageLayout
      connected
      title="근거 보기"
      spaceId={space.spaceId}
      onBack={back}
    >
      <h1 className="text-hm-heading-page">돌봄 정보의 근거</h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        연결된 자료예요. 각 자료가 현재 정보의 모든 필드를 뒷받침하는 것은
        아니에요.
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
            className="flex flex-col gap-hm-16 rounded-hm-14 bg-hm-bg-surface p-hm-20"
          >
            <Badge
              label={
                e.status === "REDACTED"
                  ? "내용 제거됨"
                  : e.kind === "RECORD_QUOTE"
                    ? "가족 소식"
                    : e.kind === "DIRECT_INPUT"
                      ? "직접 입력"
                      : "연결된 근거"
              }
            />
            <p className="text-hm-body-default wrap-anywhere whitespace-pre-wrap">
              {e.status === "REDACTED"
                ? "삭제되거나 공개할 수 없는 내용이에요."
                : (e.text ?? "내용 없음")}
            </p>
            {e.createdAt && (
              <p className="text-hm-caption-default">
                {formatServerTime(e.createdAt)}
              </p>
            )}
            {e.recordId && e.status === "VALID" && (
              <Button
                variant="secondary"
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
