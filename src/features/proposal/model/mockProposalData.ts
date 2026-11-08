import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { ProposalSpaceState, ProposalView } from "./proposalViewTypes";
import { withProposalExamples } from "./mockProposalExamples";

export function getMockProposalData(space: CareSpaceView): ProposalSpaceState {
  if (space.empty)
    return { proposals: [], requests: [], results: [], items: [] };
  const schedule: ProposalView = {
    id: "mock-proposal-1",
    recordId: "mock-record-1",
    targetId: "mock-schedule-1",
    kind: "schedule",
    title: "내과 재진",
    typeLabel: "일정 변경",
    beforeLabel: "현재 날짜",
    beforeValue: "10월 15일",
    afterLabel: "제안 날짜",
    afterValue: "10월 20일",
    context: "2026년 · 오전 10:00 · 예정\n날짜만 변경하는 제안이에요.",
    targetVersion: 1,
    status: "review",
  };
  const batchSchedule: ProposalView = {
    ...schedule,
    id: "mock-proposal-2",
    recordId: "mock-record-batch",
    targetId: "mock-schedule-batch",
    title: "정형외과 재진",
    beforeValue: "10월 16일",
    afterValue: "10월 21일",
    context: "2026년 · 오후 2:00 · 예정\n날짜만 변경하는 제안이에요.",
  };
  const task: ProposalView = {
    id: "mock-proposal-3",
    recordId: "mock-record-batch",
    targetId: "mock-task-1",
    kind: "task",
    title: "혈압 기록 준비",
    typeLabel: "할 일 변경",
    beforeLabel: "현재 내용",
    beforeValue: "최근 3일 기록",
    afterLabel: "제안 내용",
    afterValue: "최근 일주일 기록",
    context: "준비할 기록의 범위만 변경하는 제안이에요.",
    targetVersion: 1,
    status: "review",
  };
  const requested: ProposalView = {
    ...task,
    id: "mock-proposal-requested",
    recordId: "mock-record-request",
    targetId: "mock-task-request",
    title: "재진 준비물",
    beforeValue: "진료 의뢰서",
    afterValue: "진료 의뢰서와 복용약 목록",
    status: "requested",
    requestId: "mock-request-1",
    context: "준비물에 복용약 목록을 추가하는 제안이에요.",
  };
  const requester = space.members.find((member) => member.role === "member")!;
  return withProposalExamples(space, {
    proposals: [schedule, batchSchedule, task, requested],
    requests: [
      {
        id: "mock-request-1",
        author: { id: requester.id, name: requester.name },
        createdAt: Date.parse("2026-09-30T10:25:00+09:00"),
        proposals: [{ ...requested }],
      },
    ],
    results: [],
    items: [
      {
        id: schedule.targetId,
        kind: "schedule",
        createdAt: Date.parse("2026-09-27T09:00:00+09:00"),
        title: schedule.title,
        value: schedule.beforeValue,
        meta: "2026년 · 오전 10:00 · 예정",
        version: 1,
      },
      {
        id: batchSchedule.targetId,
        kind: "schedule",
        createdAt: Date.parse("2026-09-27T10:00:00+09:00"),
        title: batchSchedule.title,
        value: batchSchedule.beforeValue,
        meta: "2026년 · 오후 2:00 · 예정",
        version: 1,
      },
      {
        id: task.targetId,
        kind: "task",
        createdAt: Date.parse("2026-09-27T11:00:00+09:00"),
        title: task.title,
        value: task.beforeValue,
        meta: "미시작",
        version: 1,
      },
      {
        id: requested.targetId,
        kind: "task",
        createdAt: Date.parse("2026-09-27T12:00:00+09:00"),
        title: requested.title,
        value: requested.beforeValue,
        meta: "미시작",
        version: 1,
      },
    ],
  });
}
