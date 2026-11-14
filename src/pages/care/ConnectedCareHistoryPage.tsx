import { useParams } from "react-router";
import { Button, MenuRow } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import {
  useCareHistory,
  useCareHistoryDetail,
  useCareEvidence,
} from "@/features/careitem/model/useCareQueries";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import {
  authorName,
  formatServerTime,
} from "@/features/careitem/model/careReadView";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, careHistoryPath, newsDetailPath } from "@/routes/paths";
export function ConnectedCareHistoryPage() {
  const { space } = useConnectedSpace();
  const { itemId = "", historyId = "" } = useParams();
  const { withReturn } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const list = useCareHistory(space.spaceId, itemId);
  const detail = useCareHistoryDetail(space.spaceId, itemId, historyId);
  const evidence = useCareEvidence(space.spaceId, itemId);
  const members = useSpaceMembers(space.spaceId);
  const back = useBackNavigation(
    withReturn(
      historyId
        ? careHistoryPath(space.spaceId, itemId)
        : careItemPath(space.spaceId, itemId),
    ),
  );
  const value = detail.data;
  return (
    <ProposalPageLayout
      title="변경 이력"
      spaceId={space.spaceId}
      onBack={back}
    >
      <h1 className="text-hm-title-page">
        {historyId ? "변경 전후 확인" : "돌봄 정보가 바뀐 내역"}
      </h1>
      {historyId ? (
        !value || detail.isError ? (
          <ReviewQueryState
            error={detail.error}
            retry={() => void detail.refetch()}
          />
        ) : (
          <>
            <p className="text-hm-body-small">
              {authorName(value.changedBy)} ·{" "}
              {formatServerTime(value.changedAt)}
            </p>
            {value.redactedFields.length > 0 && (
              <Notice
                title="제거된 내용은 표시하지 않아요"
                body="현재 공개할 수 있는 변경 전후 내용만 표시해요."
              />
            )}
            <CareValuesView
              before={value.before}
              values={value.after}
              members={members.data}
              beforeLabel="변경 전"
              afterLabel="변경 후"
            />
            {evidence.data?.items
              .filter(
                (e) =>
                  value.evidenceIds.includes(e.evidenceId) &&
                  e.recordId &&
                  e.status === "VALID",
              )
              .map((e) => (
                <Button
                  key={e.evidenceId}
                  variant="secondary"
                  onClick={() =>
                    void navigate(
                      withReturn(newsDetailPath(space.spaceId, e.recordId!)),
                    )
                  }
                >
                  연결된 소식 보기
                </Button>
              ))}
            {evidence.isError && (
              <Notice
                tone="error"
                title="연결된 출처를 불러오지 못했어요"
                body="다시 조회해 주세요."
                action={{
                  label: "다시 확인",
                  onClick: () => void evidence.refetch(),
                }}
              />
            )}
          </>
        )
      ) : !list.data || list.isError ? (
        <ReviewQueryState
          error={list.error}
          retry={() => void list.refetch()}
        />
      ) : list.data.items.length ? (
        list.data.items.map((entry) => (
          <MenuRow
            key={entry.version}
            icon="news-brand"
            title={`변경 이력 ${entry.version}`}
            description={`${authorName(entry.changedBy)} · ${formatServerTime(entry.changedAt)}`}
            onClick={() =>
              void navigate(
                withReturn(
                  careHistoryPath(space.spaceId, itemId, entry.version),
                ),
              )
            }
          />
        ))
      ) : (
        <EmptyState
          title="변경 이력이 없어요"
          body="반영된 변경을 이곳에서 확인할 수 있어요."
        />
      )}
    </ProposalPageLayout>
  );
}
