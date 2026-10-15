import type { HomeView } from "./homeViewTypes";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { ProposalSpaceState } from "@/features/proposal/model/proposalViewTypes";
import { getPendingProposalCount } from "@/features/proposal/model/proposalSelectors";

// 화면 확인용 예시. 실제 일정·건수·담당자 정보가 아니며 API 연결 시 교체한다.
export function getMockHomeData(
  records: readonly RecordView[],
  proposals: ProposalSpaceState,
  space: CareSpaceView,
): HomeView {
  return {
    pendingCount: getPendingProposalCount(proposals, space),
    recentNews: [...records]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 1)
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
    upcomingSchedules: proposals.items
      .filter((item) => item.kind === "schedule" && !item.needsReconfirmation)
      .map((item) => ({
        id: item.id,
        title: item.title,
        statusLabel: "예정",
        meta: `${item.value} · ${item.meta}`,
        body: proposals.proposals.some(
          (proposal) =>
            proposal.targetId === item.id &&
            (proposal.status === "review" || proposal.status === "requested"),
        )
          ? "날짜 변경 제안을 확인 중이에요."
          : "현재 확정된 예시 일정이에요.",
      })),
    pastScheduleCount: 1,
    tasks: [
      ...proposals.items
        .filter((item) => item.kind === "task" && !item.needsReconfirmation)
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: `${item.value} · ${item.meta}`,
        })),
      {
        id: "mock-task-2",
        title: "재진 동행",
        description: "담당 미정 · 미시작",
      },
    ],
    questions: proposals.items
      .filter((item) => item.kind === "question" && !item.needsReconfirmation)
      .map((item) => ({
        id: item.id,
        title: item.fields.content,
        description: "미확인",
      })),
    recentChanges: [
      ...proposals.results
        .filter(
          (result) =>
            result.decision === "applied" &&
            result.proposals.some((proposal) => !proposal.sourceDeleted),
        )
        .slice()
        .reverse()
        .map((result) => ({
          id: result.id,
          title: `${result.actor.name}님이 ${result.proposals.find((proposal) => !proposal.sourceDeleted)!.title}${result.proposals.filter((proposal) => !proposal.sourceDeleted).length > 1 ? " 외 항목" : ""}을 반영했어요.`,
          description: formatRecordDate(result.createdAt),
        })),
      {
        id: "mock-change-1",
        title: "수진님이 혈압 기록 준비를 맡았어요.",
        description: "오늘 오전 9:00",
      },
    ],
  };
}
