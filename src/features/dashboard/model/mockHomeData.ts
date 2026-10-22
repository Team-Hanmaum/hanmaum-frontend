import type { HomeView } from "./homeViewTypes";
import { homePreviewLimits } from "./homePreviewLimits";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { ProposalSpaceState } from "@/features/proposal/model/proposalViewTypes";
import { getPendingProposalCount } from "@/features/proposal/model/proposalSelectors";
import { careChangeTitle } from "@/features/careitem/model/careChangeRules";
import {
  careAssignee,
  careCardMeta,
  careStatusLabel,
  selectCareItems,
} from "@/features/careitem/model/careItemSelectors";

// 화면 확인용 예시. 실제 일정·건수·담당자 정보가 아니며 API 연결 시 교체한다.
export function getMockHomeData(
  records: readonly RecordView[],
  proposals: ProposalSpaceState,
  space: CareSpaceView,
  now = Date.now(),
): HomeView {
  const upcomingSchedules = selectCareItems(
    proposals.items,
    { type: "schedule", status: "upcoming" },
    now,
  );
  const tasks = selectCareItems(
    proposals.items,
    { type: "task", status: "remaining" },
    now,
  );
  const questions = selectCareItems(
    proposals.items,
    { type: "question", status: "unconfirmed" },
    now,
  );
  const recentChanges = [
    ...proposals.results
      .filter(
        (result) =>
          result.decision === "applied" &&
          result.proposals.some((proposal) => !proposal.sourceDeleted),
      )
      .map((result) => ({
        id: result.id,
        title: `${result.actor.name}님이 ${result.proposals.find((proposal) => !proposal.sourceDeleted)!.title}${result.proposals.filter((proposal) => !proposal.sourceDeleted).length > 1 ? " 외 항목" : ""} 내용을 반영했어요.`,
        description: formatRecordDate(result.createdAt),
        createdAt: result.createdAt,
      })),
    ...(proposals.careChanges ?? [])
      .filter((change) => change.status === "applied" && !change.redacted)
      .map((change) => ({
        id: change.id,
        title: `${change.decidedBy?.name ?? change.author.name}님이 ${careChangeTitle(change.draft)} 처리를 완료했어요.`,
        description: formatRecordDate(change.decidedAt ?? change.createdAt),
        createdAt: change.decidedAt ?? change.createdAt,
      })),
  ].sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
  return {
    pendingCount: getPendingProposalCount(proposals, space),
    totalCounts: {
      recentNews: records.length,
      upcomingSchedules: upcomingSchedules.length,
      tasks: tasks.length,
      questions: questions.length,
      recentChanges: recentChanges.length,
    },
    recentNews: [...records]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, homePreviewLimits.recentNews)
      .map((record) => ({
        id: record.id,
        title: record.title,
        author: `${record.author.name} · ${formatRecordDate(record.createdAt)}`,
        body: record.body,
        status: record.proposalSummary?.status ?? record.analysisStatus,
        statusMessage:
          record.proposalSummary?.message ??
          (record.analysisStatus === "review"
            ? "변경 제안 1건을 확인해 주세요."
            : undefined),
      })),
    upcomingSchedules: upcomingSchedules
      .slice(0, homePreviewLimits.upcomingSchedules)
      .map((item) => ({
        id: item.id,
        title: item.title,
        statusLabel: careStatusLabel(item),
        meta: careCardMeta(item, space.members),
        body: proposals.proposals.some(
          (proposal) =>
            proposal.targetId === item.id &&
            !proposal.sourceDeleted &&
            (proposal.status === "review" || proposal.status === "requested"),
        )
          ? "날짜 변경 제안을 확인 중이에요."
          : "현재 확정된 예시 일정이에요.",
      })),
    pastScheduleCount: selectCareItems(
      proposals.items,
      { type: "schedule", status: "past" },
      now,
    ).length,
    tasks: tasks.slice(0, homePreviewLimits.tasks).map((item) => ({
      id: item.id,
      title: item.title,
      description: `담당자 ${careAssignee(item, space.members)} · ${careStatusLabel(item)}`,
    })),
    questions: questions.slice(0, homePreviewLimits.questions).map((item) => ({
      id: item.id,
      title: item.fields.content,
      description: "미확인",
    })),
    recentChanges: recentChanges.slice(0, homePreviewLimits.recentChanges),
  };
}
