import { useParams } from "react-router";
import { Button, Icon, MenuRow } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import {
  useCareHistory,
  useCareHistoryDetail,
  useCareEvidence,
} from "@/features/careitem/model/useCareQueries";
import type { CareHistoryDetail } from "@/features/careitem/api/careReadTypes";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import {
  authorName,
  displayCareValue,
  fieldLabels,
  flattenCareValues,
  formatServerTime,
  readCareText,
} from "@/features/careitem/model/careReadView";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, careHistoryPath, newsDetailPath } from "@/routes/paths";

function historyLabel(kind: string) {
  switch (kind) {
    case "CREATE":
      return "최초 등록";
    case "ASSIGNEE_CHANGE":
      return "담당자 변경";
    case "STATUS_CHANGE":
      return "상태 변경";
    case "RECONFIRM":
      return "재확인";
    case "DELETE":
      return "항목 삭제";
    default:
      return "내용 변경";
  }
}

function HistoryValues({
  value,
  members,
}: {
  value: CareHistoryDetail;
  members?: Parameters<typeof displayCareValue>[2];
}) {
  const { before, after, previousVersion } = value;
  if (!before || !after || previousVersion === null) {
    return (
      <section className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface px-hm-16 py-hm-12">
        <h2 className="text-hm-body-emphasis">
          {previousVersion === null
            ? "등록한 내용"
            : after
              ? "변경 후 기록"
              : "변경 전 기록"}
        </h2>
        <CareFieldList
          values={after ?? before}
          members={members}
          emptyText="표시할 수 있는 내용이 없어요."
        />
      </section>
    );
  }

  const previous = flattenCareValues(before);
  const current = flattenCareValues(after);
  const changedKeys = Object.keys(fieldLabels).filter(
    (key) => readCareText(previous[key]) !== readCareText(current[key]),
  );
  if (!changedKeys.length) {
    return (
      <p className="text-hm-body-small text-hm-text-secondary">
        변경된 값이 없어요.
      </p>
    );
  }

  const columns = "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-hm-8";
  return (
    <section
      aria-label="바뀐 항목"
      className="rounded-hm-16 bg-hm-bg-surface px-hm-16 py-hm-12"
    >
      <div
        aria-hidden="true"
        className={`${columns} py-hm-4 text-hm-caption-default text-hm-text-secondary`}
      >
        <span>변경 전</span>
        <span className="size-5" />
        <span className="text-hm-text-brand">변경 후</span>
      </div>
      <div className="divide-y divide-hm-divider-default">
        {changedKeys.map((key) => (
          <div
            key={key}
            className={`${columns} py-hm-12`}
          >
            <h3 className="col-span-3 text-hm-body-small font-bold">
              {fieldLabels[key]}
            </h3>
            <p className="text-hm-body-default wrap-anywhere whitespace-pre-wrap text-hm-text-secondary">
              <span className="sr-only">변경 전 </span>
              {displayCareValue(key, previous[key], members)}
            </p>
            <span>
              <Icon name="arrow-right-secondary" />
            </span>
            <p className="text-hm-body-emphasis wrap-anywhere whitespace-pre-wrap text-hm-text-brand">
              <span className="sr-only">변경 후 </span>
              {displayCareValue(key, current[key], members)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CareHistoryPage() {
  const { space } = useSpaceContext();
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
  const entry = list.data?.items.find((item) => item.version === historyId);
  return (
    <ProposalPageLayout
      title="변경 이력"
      spaceId={space.spaceId}
      onBack={back}
    >
      <h1 className="text-hm-title-page">
        {historyId
          ? value?.previousVersion === null
            ? "최초 등록"
            : entry
              ? historyLabel(entry.changeKind)
              : "변경 전후 확인"
          : "돌봄 정보가 바뀐 내역"}
      </h1>
      {historyId ? (
        !value || detail.isError ? (
          <ReviewQueryState
            error={detail.error}
            retry={() => void detail.refetch()}
          />
        ) : (
          <>
            <p className="text-hm-body-small text-hm-text-secondary">
              {authorName(value.changedBy)} ·{" "}
              <time dateTime={value.changedAt}>
                {formatServerTime(value.changedAt)}
              </time>
            </p>
            {value.redactedFields.length > 0 && (
              <Notice
                title="제거된 내용은 표시하지 않아요"
                body="현재 공개할 수 있는 변경 전후 내용만 표시해요."
              />
            )}
            <HistoryValues
              value={value}
              members={members.data}
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
        <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
          {list.data.items.map((entry) => (
            <MenuRow
              key={entry.version}
              icon={null}
              className="min-h-hm-touch-min rounded-none px-hm-16 py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle"
              title={historyLabel(entry.changeKind)}
              description={`${authorName(entry.changedBy)} · ${formatServerTime(entry.changedAt)}`}
              onClick={() =>
                void navigate(
                  withReturn(
                    careHistoryPath(space.spaceId, itemId, entry.version),
                  ),
                )
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="변경 이력이 없어요"
          body="반영된 변경을 이곳에서 확인할 수 있어요."
        />
      )}
    </ProposalPageLayout>
  );
}
