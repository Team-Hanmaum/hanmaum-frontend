import { emptyCareFields } from "@/features/careitem/model/careItemFields";
import type { CareItemView } from "@/features/careitem/model/careItemViewTypes";
import { initialCareStatus } from "@/features/careitem/model/careItemSelectors";
import { getMockCareItems } from "@/features/careitem/model/mockCareItems";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { ProposalSpaceState, ProposalView } from "./proposalViewTypes";

// Figma의 추가·근거 연결 유형을 확인하기 위한 고정 예시. 입력한 소식의 AI 분석이 아니다.
export function withProposalExamples(
  space: CareSpaceView,
  seed: Omit<ProposalSpaceState, "items"> & {
    items: Omit<CareItemView, "fields" | "evidence" | "status">[];
  },
): ProposalSpaceState {
  const owner = space.members.find((member) => member.role === "owner")!;
  const items: CareItemView[] = seed.items.map((item) => {
    const fields = {
      ...emptyCareFields,
      title: item.title,
      content: item.kind === "schedule" ? "" : item.value,
      assigneeId: item.kind === "task" ? owner.id : "",
      ...(item.kind === "schedule"
        ? {
            date: item.id === "mock-schedule-1" ? "2026-10-15" : "2026-10-16",
            time: item.id === "mock-schedule-1" ? "10:00" : "14:00",
          }
        : {}),
    };
    return {
      ...item,
      status: initialCareStatus(item.kind),
      fields,
      evidence: [
        {
          id: `seed-${item.id}`,
          author: owner.name,
          createdAt: Date.parse("2026-09-27T19:10:00+09:00"),
          directContent: `${item.title} · ${item.value}을 직접 확인했어요.`,
          fields: { ...fields },
        },
      ],
    };
  });
  const proposals = seed.proposals.map((proposal) => {
    const before = items.find((item) => item.id === proposal.targetId)!.fields;
    return {
      ...proposal,
      revision: 0,
      beforeFields: { ...before },
      afterFields: {
        ...before,
        ...(proposal.kind === "schedule"
          ? {
              date:
                proposal.id === "mock-proposal-1" ? "2026-10-20" : "2026-10-21",
            }
          : { content: proposal.afterValue }),
      },
    };
  });
  const questionFields = {
    ...emptyCareFields,
    title: "센터를 토요일에도 이용할 수 있나요?",
    content: "센터를 토요일에도 이용할 수 있나요?",
  };
  items.push({
    id: "mock-question-1",
    kind: "question",
    createdAt: Date.parse("2026-09-28T14:10:00+09:00"),
    status: "unconfirmed",
    title: questionFields.title,
    value: questionFields.content,
    fields: questionFields,
    version: 1,
    meta: "미확인",
    evidence: [
      {
        id: "seed-question",
        recordId: "mock-record-3",
        author: owner.name,
        createdAt: Date.parse("2026-09-28T14:10:00+09:00"),
        fields: { ...questionFields },
      },
    ],
  });
  const additions: ProposalView[] = [
    {
      kind: "question",
      title: "센터를 토요일에도 이용할 수 있나요?",
      typeLabel: "질문 추가",
      afterValue: "센터를 토요일에도 이용할 수 있나요?",
    },
    {
      kind: "observation",
      title: "점심 식사 관찰",
      typeLabel: "관찰 추가",
      afterValue: "점심을 평소의 절반 정도 드셨어요.",
    },
    {
      kind: "guidance",
      title: "센터 이용 안내",
      typeLabel: "안내 추가",
      afterValue: "센터에서 월요일에 이용 안내문을 보내준다고 해요.",
    },
  ].map((entry, index) => ({
    ...entry,
    kind: entry.kind as ProposalView["kind"],
    id: `mock-proposal-type-${index}`,
    recordId: `mock-record-type-${index}`,
    targetId: `mock-item-type-${index}`,
    operation: "create",
    beforeLabel: "현재 정보",
    beforeValue: "아직 등록되지 않았어요",
    afterLabel: "제안 내용",
    context: "소유자가 반영한 뒤 현재 돌봄 정보에 추가돼요.",
    targetVersion: 0,
    revision: 0,
    status: "review",
    afterFields: {
      ...emptyCareFields,
      title: entry.title,
      content: entry.afterValue,
    },
  }));
  const schedule = items[0];
  const link: ProposalView = {
    ...proposals[0],
    id: "mock-proposal-link",
    recordId: "mock-record-link",
    operation: "link",
    typeLabel: "근거 연결",
    afterValue: schedule.value,
    afterFields: { ...schedule.fields },
    context: "일정 값은 바꾸지 않고 이 소식을 기존 일정의 근거로 연결해요.",
  };
  return {
    ...seed,
    items: [...items, ...getMockCareItems(space.members)],
    proposals: [...proposals, ...additions, link],
    requests: seed.requests.map((request) => ({
      ...request,
      proposals: request.proposals.map((proposal) =>
        proposals.find((item) => item.id === proposal.id)!,
      ),
    })),
  };
}
