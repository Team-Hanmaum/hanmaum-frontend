import { MenuRow, Tabs, TextAction } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareItems } from "@/features/careitem/model/useCareQueries";
import {
  careStatusTabs,
  careTypeTabs,
  type CareListStatus,
} from "@/features/careitem/model/careItemSelectors";
import { displayCareValue } from "@/features/careitem/model/careReadView";
import type {
  ItemType,
  CareSummary,
} from "@/features/careitem/api/careReadTypes";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useCareListFilter } from "@/routes/useCareListFilter";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, proposalListPath } from "@/routes/paths";
const types: Record<string, ItemType> = {
  schedule: "SCHEDULE",
  task: "TASK",
  question: "QUESTION",
  observation: "OBSERVATION",
  guidance: "GUIDANCE",
};

function careListDescription(item: CareSummary, filterStatus?: CareListStatus) {
  const field = (key: string) => {
    const value = item.fields?.[key];
    return typeof value === "string" ? value.trim() : undefined;
  };
  const status = item.status
    ? displayCareValue("status", item.status)
    : undefined;

  switch (item.itemType) {
    case "SCHEDULE":
      return [
        field("scheduledDate"),
        field("scheduledTime"),
        field("location"),
        filterStatus === "closed" ? status : undefined,
      ]
        .filter(Boolean)
        .join(" · ");
    case "TASK":
      return [
        item.assigneeDisplayName || "담당자 미지정",
        field("dueDate"),
        filterStatus === "remaining" ? status : undefined,
      ]
        .filter(Boolean)
        .join(" · ");
    case "OBSERVATION":
      return [field("observedDate"), field("observedTimeText")]
        .filter(Boolean)
        .join(" · ");
    case "GUIDANCE":
      return [field("receivedDate"), field("sourceName")]
        .filter(Boolean)
        .join(" · ");
    case "QUESTION":
      return undefined;
  }
}

export function CarePage() {
  const { space } = useSpaceContext();
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const { filter, setType, setStatus } = useCareListFilter();
  const query = useCareItems(
    space.spaceId,
    types[filter.type],
    filter.status?.toUpperCase(),
  );
  const row = (item: CareSummary) => (
    <MenuRow
      key={item.itemId}
      icon={null}
      className="min-h-hm-touch-min! rounded-none py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle focus-visible:z-10"
      title={item.title ?? "내용이 제거된 항목"}
      badge={
        item.needsReconfirmation
          ? "재확인 필요"
          : item.needsConflictReview
            ? "내용 확인 필요"
            : undefined
      }
      description={careListDescription(item, filter.status)}
      onClick={() =>
        void navigate(withReturn(careItemPath(space.spaceId, item.itemId)))
      }
    />
  );
  const renderList = (items: CareSummary[]) => (
    <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
      {items.map(row)}
    </div>
  );
  const content =
    !query.data || query.isError ? (
      <ReviewQueryState
        error={query.error}
        retry={() => void query.refetch()}
      />
    ) : (
      <div className="flex flex-col gap-hm-16">
        {query.data.reconfirmationItems.length > 0 && (
          <section className="flex flex-col gap-hm-8">
            <h2 className="text-hm-body-emphasis text-hm-text-brand">
              다시 확인할 내용
            </h2>
            {renderList(query.data.reconfirmationItems)}
          </section>
        )}
        {query.data.items.length ? (
          renderList(query.data.items)
        ) : !query.data.reconfirmationItems.length ? (
          <EmptyState
            title="아직 표시할 돌봄 정보가 없어요"
            body="직접 항목을 추가하거나 소식의 제안을 반영하면 이곳에서 확인할 수 있어요."
          />
        ) : null}
      </div>
    );
  const statusTabs = careStatusTabs[filter.type];
  return (
    <>
      <div className="flex items-center justify-between gap-hm-12">
        <h1 className="text-hm-title-page">돌봄</h1>
        <TextAction
          className="shrink-0 px-hm-12 font-bold text-hm-text-brand"
          onClick={() =>
            void navigate(withReturn(proposalListPath(space.spaceId)))
          }
        >
          제안·요청
        </TextAction>
      </div>
      <Tabs
        label="돌봄 종류"
        variant="underline"
        value={filter.type}
        onValueChange={setType}
        items={careTypeTabs.map((tab) => ({
          ...tab,
          content:
            tab.value === filter.type ? (
              statusTabs.length ? (
                <Tabs
                  label="돌봄 상태"
                  variant="pill"
                  value={filter.status ?? ""}
                  onValueChange={setStatus}
                  items={statusTabs.map((status) => ({
                    ...status,
                    content: status.value === filter.status ? content : null,
                  }))}
                />
              ) : (
                content
              )
            ) : null,
        }))}
      />
    </>
  );
}
