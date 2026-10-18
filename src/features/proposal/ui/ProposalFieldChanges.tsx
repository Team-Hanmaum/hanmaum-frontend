import type { ReactNode } from "react";
import { Comparison } from "@/components/ui";
import {
  formatCareDate,
  formatCareTime,
} from "@/features/careitem/model/careItemFields";
import type { CareItemFields } from "@/features/careitem/model/careItemViewTypes";
import type { ProposalView } from "../model/proposalViewTypes";

export function ProposalFieldChanges({
  proposal,
  members = [],
  beforeLabel = "현재",
  afterLabel = "반영할 제안",
  fallback = null,
}: {
  proposal: ProposalView;
  members?: readonly { id: string; name: string }[];
  beforeLabel?: string;
  afterLabel?: string;
  fallback?: ReactNode;
}) {
  const { beforeFields: before, afterFields: after } = proposal;
  if (!after || proposal.operation === "link") return fallback;
  const labels: Partial<Record<keyof CareItemFields, string>> =
    proposal.kind === "schedule"
      ? { title: "이름", date: "날짜", time: "시간", location: "장소" }
      : proposal.kind === "task"
        ? { content: "내용", assigneeId: "담당자", dueDate: "기한" }
        : { content: "내용" };
  const changedKeys = (Object.keys(labels) as (keyof CareItemFields)[]).filter(
    (key) => before?.[key] !== after[key] && (before?.[key] || after[key]),
  );
  if (!changedKeys.length) return fallback;
  function display(key: keyof CareItemFields, value?: string) {
    if (!value) return key === "assigneeId" ? "미지정" : "없음";
    if (key === "date" || key === "dueDate") return formatCareDate(value);
    if (key === "time") return formatCareTime(value);
    if (key === "assigneeId")
      return (
        members.find((member) => member.id === value)?.name ?? "선택한 가족"
      );
    return value;
  }
  return (
    <div className="flex w-full flex-col gap-hm-12">
      {changedKeys.map((key) => (
        <Comparison
          key={key}
          beforeLabel={`${beforeLabel} · ${labels[key]}`}
          beforeValue={display(key, before?.[key])}
          afterLabel={afterLabel}
          afterValue={display(key, after[key])}
        />
      ))}
    </div>
  );
}
