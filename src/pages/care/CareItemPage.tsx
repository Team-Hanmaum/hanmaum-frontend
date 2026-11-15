import { useParams } from "react-router";
import { Button, Badge, Icon, MenuRow, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import { useSpaceMembers } from "@/features/carespace/model/useSpaceDetail";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import { CareReconfirmationMetadata } from "@/features/careitem/ui/CareReconfirmationMetadata";
import { formatCareDate } from "@/features/careitem/model/careItemFields";
import type {
  CareDetail,
  ItemType,
} from "@/features/careitem/api/careReadTypes";
import {
  careItemTitle,
  displayCareValue,
  itemLabels,
  readCareText,
} from "@/features/careitem/model/careReadView";
import { careTypeTabs } from "@/features/careitem/model/careItemSelectors";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import {
  careSourcesPath,
  careSharePath,
  careHistoryPath,
  careListPath,
  careItemPath,
  careReconfirmPath,
  proposalListPath,
} from "@/routes/paths";

const detailFields: Record<ItemType, readonly string[]> = {
  SCHEDULE: ["location"],
  TASK: ["assigneeMembershipId"],
  QUESTION: ["confirmedAnswer"],
  OBSERVATION: [],
  GUIDANCE: ["sourceName"],
};

function careTiming(item: CareDetail) {
  const field = (key: string) => readCareText(item.fields?.[key]);
  switch (item.itemType) {
    case "SCHEDULE": {
      const date = field("scheduledDate");
      return [date && formatCareDate(date), field("scheduledTime")]
        .filter(Boolean)
        .join(" · ");
    }
    case "TASK": {
      const due = field("dueDate");
      return due ? `기한 ${formatCareDate(due)}` : undefined;
    }
    case "OBSERVATION": {
      const date = field("observedDate");
      return [date && formatCareDate(date), field("observedTimeText")]
        .filter(Boolean)
        .join(" · ");
    }
    case "GUIDANCE": {
      const date = field("receivedDate");
      return date && formatCareDate(date);
    }
  }
}

export function CareItemPage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const query = useCareItem(space.spaceId, itemId);
  const members = useSpaceMembers(space.spaceId);
  const item = query.data;
  const listPath = withReturn(
    careListPath(space.spaceId, {
      type:
        careTypeTabs.find((tab) => tab.value.toUpperCase() === item?.itemType)
          ?.value ?? "schedule",
    }),
  );
  const back = useBackNavigation(listPath);
  const timing = item && careTiming(item);
  const canShare =
    item &&
    !item.needsReconfirmation &&
    item.visibility !== "DELETED" &&
    !item.redactedFields.length;
  const menuRow =
    "min-h-hm-touch-min rounded-none px-hm-16 py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle";
  return (
    <ProposalPageLayout
      title={item ? `${itemLabels[item.itemType]} 상세` : "돌봄 상세"}
      spaceId={space.spaceId}
      onBack={back}
      activeTab="care"
      tabs
    >
      {!item || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <div className="flex flex-col gap-hm-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-hm-12 gap-y-hm-4">
              <h1 className="min-w-0 text-hm-title-page wrap-anywhere">
                {careItemTitle(item)}
              </h1>
              {item.status && !item.needsReconfirmation && (
                <Badge
                  label={displayCareValue("status", item.status)}
                  tone="brand"
                />
              )}
            </div>
            {item.needsReconfirmation && (
              <CareReconfirmationMetadata item={item} />
            )}
            {timing && (
              <p className="text-hm-body-emphasis wrap-anywhere text-hm-text-secondary">
                {timing}
              </p>
            )}
          </div>
          {(item.needsReconfirmation || item.needsConflictReview) && (
            <Notice
              title={
                item.needsReconfirmation
                  ? "원본을 확인할 수 없어요"
                  : "서로 다른 내용이 있어요"
              }
              body={
                item.needsReconfirmation
                  ? "원본을 바탕으로 기록한 정보가 가려졌어요. 공간 소유자가 확인한 내용으로 다시 등록할 수 있어요."
                  : "현재 값과 제안의 근거를 비교해 주세요."
              }
              action={
                item.needsReconfirmation &&
                item.visibility !== "DELETED" &&
                space.role === "OWNER"
                  ? {
                      label: "다시 확인하기",
                      onClick: () =>
                        void navigate(
                          withReturn(careReconfirmPath(space.spaceId, itemId)),
                        ),
                    }
                  : undefined
              }
            />
          )}
          {item.needsConflictReview && (
            <TextAction
              className="self-start text-hm-text-brand"
              onClick={() =>
                void navigate(
                  withReturn(proposalListPath(space.spaceId, "review", "care")),
                )
              }
            >
              제안·요청 확인
            </TextAction>
          )}
          {(readCareText(item.description) ||
            detailFields[item.itemType].some((key) =>
              readCareText(
                key === "confirmedAnswer"
                  ? item.confirmedAnswer
                  : item.fields?.[key],
              ),
            )) && (
            <section className="rounded-hm-16 bg-hm-bg-surface px-hm-16 py-hm-12">
              {readCareText(item.description) && (
                <p className="text-hm-body-default wrap-anywhere whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
              <CareFieldList
                values={item}
                keys={detailFields[item.itemType]}
                members={members.data}
              />
            </section>
          )}
          <div className="flex flex-wrap gap-hm-8">
            <Button
              variant="secondary"
              className="min-h-hm-touch-min px-hm-16 py-hm-8"
              onClick={() =>
                void navigate(
                  withReturn(`${careItemPath(space.spaceId, itemId)}/manage`),
                )
              }
            >
              항목 관리
            </Button>
            {canShare && (
              <TextAction
                className="inline-flex min-h-hm-touch-min items-center gap-hm-8 rounded-hm-10 px-hm-12 font-bold text-hm-text-brand hover:bg-hm-bg-brand-subtle"
                onClick={() =>
                  void navigate(
                    withReturn(careSharePath(space.spaceId, itemId)),
                  )
                }
              >
                <Icon name="link-brand" />
                공유
              </TextAction>
            )}
          </div>
          {item.answers.length > 0 && (
            <section className="flex flex-col gap-hm-12">
              <h2 className="text-hm-heading-section">가족이 남긴 답변</h2>
              {item.answers.map((answer) => (
                <Notice
                  key={answer.answerId}
                  title={answer.answer ?? "내용이 제거된 답변"}
                  body={answer.basis ?? "근거 내용 없음"}
                />
              ))}
            </section>
          )}
          <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
            <MenuRow
              icon={null}
              className={menuRow}
              title="기록 근거"
              onClick={() =>
                void navigate(
                  withReturn(careSourcesPath(space.spaceId, itemId)),
                )
              }
            />
            <MenuRow
              icon={null}
              className={menuRow}
              title="변경 이력"
              onClick={() =>
                void navigate(
                  withReturn(careHistoryPath(space.spaceId, itemId)),
                )
              }
            />
          </div>
        </>
      )}
    </ProposalPageLayout>
  );
}
