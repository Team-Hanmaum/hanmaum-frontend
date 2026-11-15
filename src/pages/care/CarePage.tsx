import { PageTitleWithAction } from "@/components/layout";
import { MenuRow, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareItems } from "@/features/careitem/model/useCareQueries";
import { scheduleDayOffset } from "@/features/careitem/model/scheduleDayOffset";
import { ScheduleCountdownBadge } from "@/features/careitem/ui/ScheduleCountdownBadge";
import {
  careStatusTabs,
  careTypeTabs,
  type CareListStatus,
} from "@/features/careitem/model/careItemSelectors";
import {
  displayCareValue,
  itemLabels,
} from "@/features/careitem/model/careReadView";
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
  const now = new Date();
  const row = (item: CareSummary, inReconfirmationList: boolean) => (
    <MenuRow
      key={item.itemId}
      icon={null}
      className="min-h-hm-touch-min! rounded-none py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle focus-visible:z-10"
      title={item.title ?? `내용이 제거된 ${itemLabels[item.itemType]}`}
      badge={
        item.needsReconfirmation && !inReconfirmationList
          ? "재확인 필요"
          : item.needsConflictReview
            ? "내용 확인 필요"
            : undefined
      }
      description={careListDescription(item, filter.status)}
      trailing={
        item.itemType === "SCHEDULE" &&
        filter.status === "upcoming" &&
        !item.needsReconfirmation && (
          <ScheduleCountdownBadge
            daysUntil={scheduleDayOffset(item.fields?.scheduledDate, now)}
          />
        )
      }
      onClick={() =>
        void navigate(withReturn(careItemPath(space.spaceId, item.itemId)))
      }
    />
  );
  const renderList = (items: CareSummary[], reconfirmation = false) => (
    <div
      className={`divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface ${reconfirmation ? "border border-hm-border-default" : ""}`}
    >
      {reconfirmation && (
        <h2 className="rounded-t-hm-16 bg-hm-bg-brand-subtle px-hm-16 py-hm-8 text-hm-body-small font-bold text-hm-text-brand">
          다시 확인할 내용
        </h2>
      )}
      {items.map((item) => row(item, reconfirmation))}
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
        {query.data.reconfirmationItems.length > 0 &&
          renderList(query.data.reconfirmationItems, true)}
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
      <PageTitleWithAction
        title="돌봄"
        action={{
          label: "제안·요청",
          onClick: () =>
            void navigate(
              withReturn(proposalListPath(space.spaceId, "review", "care")),
            ),
        }}
      />
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
