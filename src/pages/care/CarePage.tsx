import { Badge, MenuRow, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareItems } from "@/features/careitem/model/useCareQueries";
import {
  careStatusTabs,
  careTypeTabs,
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
      icon="care-brand"
      title={item.title ?? "내용이 제거된 항목"}
      badge={
        item.needsReconfirmation
          ? "재확인 필요"
          : item.needsConflictReview
            ? "내용 확인 필요"
            : undefined
      }
      description={[
        itemLabels[item.itemType],
        displayCareValue("status", item.status),
        item.itemType === "TASK"
          ? item.assigneeDisplayName || "담당자 미지정"
          : item.fields?.scheduledDate,
      ]
        .filter((v) => typeof v === "string")
        .join(" · ")}
      onClick={() =>
        void navigate(withReturn(careItemPath(space.spaceId, item.itemId)))
      }
    />
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
          <section className="flex flex-col gap-hm-12">
            <Badge label="다시 확인할 내용" />
            {query.data.reconfirmationItems.map(row)}
          </section>
        )}
        {query.data.items.length ? (
          query.data.items.map(row)
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
      <MenuRow
        title="제안·가족 요청 확인"
        icon="news-brand"
        description="검토할 내용과 처리 결과"
        onClick={() =>
          void navigate(withReturn(proposalListPath(space.spaceId)))
        }
      />
      <h1 className="text-hm-title-page">돌봄</h1>
      <Tabs
        label="돌봄 종류"
        value={filter.type}
        onValueChange={setType}
        items={careTypeTabs.map((tab) => ({
          ...tab,
          content:
            tab.value === filter.type ? (
              statusTabs.length ? (
                <Tabs
                  label="돌봄 상태"
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
