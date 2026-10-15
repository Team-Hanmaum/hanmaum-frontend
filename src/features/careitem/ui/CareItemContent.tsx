import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { Notice } from "@/components/feedback";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { CareItemView } from "../model/careItemViewTypes";
import { careAssignee, careStatusLabel } from "../model/careItemSelectors";
import { formatCareDate, formatCareTime } from "../model/careItemFields";

function DetailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-hm-12 rounded-hm-16 bg-hm-bg-surface p-hm-20">
      <h2 className="text-hm-body-small text-hm-text-secondary">{label}</h2>
      <p className="text-hm-body-default whitespace-pre-wrap">{children}</p>
    </section>
  );
}

export function CareItemContent({
  item,
  space,
}: {
  item: CareItemView;
  space: CareSpaceView;
}) {
  if (item.needsReconfirmation)
    return (
      <>
        <Badge
          className="self-start"
          label="재확인 필요"
          tone="error"
        />
        <h1 className="text-hm-title-page">내용을 다시 확인해 주세요</h1>
        <Notice
          title="홈과 새 공유에서 제외돼요"
          body="이 항목의 유효 근거가 없어 내용을 보여드릴 수 없어요. 소유자가 새로 확인한 내용을 반영해야 해요."
        />
      </>
    );
  const { kind, fields } = item;
  const canChangeTask =
    space.role === "owner" ||
    space.members.some(
      (member) => member.self && member.id === fields.assigneeId,
    );
  return (
    <>
      <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20 wrap-anywhere">
        <Badge
          className="self-start"
          label={careStatusLabel(item)}
          tone={
            item.status === "scheduled" ||
            item.status === "unconfirmed" ||
            item.status === "not-started" ||
            item.status === "in-progress"
              ? "brand"
              : "neutral"
          }
        />
        <h1 className="text-hm-heading-section">{item.title}</h1>
        {kind === "schedule" ? (
          <p className="text-hm-body-emphasis">
            {formatCareDate(fields.date)}
            <br />
            {formatCareTime(fields.time)}
          </p>
        ) : (
          <>
            {kind === "task" && (
              <p className="text-hm-body-emphasis">
                담당자 {careAssignee(item, space.members)}
              </p>
            )}
            {kind === "observation" && (
              <p className="text-hm-body-emphasis">
                {fields.date ? formatCareDate(fields.date) : "관찰 시점 미정"}
              </p>
            )}
            {kind === "guidance" && (
              <p className="text-hm-body-emphasis">
                {fields.location || "기관 미정"}
              </p>
            )}
            {kind === "question" ? (
              <>
                <p className="text-hm-body-emphasis">
                  {item.status === "confirmed"
                    ? `${item.answer?.confirmedBy ?? "소유자"}님이 확인했어요`
                    : "아직 확인된 답이 없어요"}
                </p>
                <p className="text-hm-body-default whitespace-pre-wrap">
                  {item.status === "confirmed"
                    ? item.answer?.content
                    : "알고 있는 가족이 답과 근거를 남겨 주세요."}
                </p>
              </>
            ) : (
              fields.content && (
                <p className="text-hm-body-default whitespace-pre-wrap">
                  {fields.content}
                </p>
              )
            )}
          </>
        )}
      </section>
      {kind === "schedule" && (
        <DetailSection label="장소">
          {fields.location || "등록된 장소가 없어요"}
        </DetailSection>
      )}
      {kind === "task" && (
        <DetailSection label="기한">
          {fields.dueDate
            ? formatCareDate(fields.dueDate)
            : "정해진 기한이 없어요"}
        </DetailSection>
      )}
      {kind === "guidance" && (
        <DetailSection label="안내받은 날짜">
          {fields.date ? formatCareDate(fields.date) : "안내 날짜 미정"}
        </DetailSection>
      )}
      {kind === "task" && item.status !== "completed" && (
        <Notice
          tone={canChangeTask ? "info" : "neutral"}
          title={
            canChangeTask ? "준비를 마쳤나요?" : "담당자에게 상태를 확인해요"
          }
          body={
            canChangeTask
              ? "진행 시작을 누르지 않아도 바로 완료로 표시할 수 있어요. 상태 변경 화면은 준비 중이에요."
              : "소유자 또는 담당자는 바로 상태를 바꿀 수 있어요. 다른 가족은 변경을 요청해 주세요. 상태 변경 화면은 준비 중이에요."
          }
        />
      )}
      {kind === "question" && item.status === "unconfirmed" && (
        <Notice
          title="답변 후 소유자가 확인해요"
          body="가족이 답변을 남기면 소유자가 확인한 뒤 ‘확인됨’으로 바뀌어요. 답변 화면은 준비 중이에요."
        />
      )}
    </>
  );
}
