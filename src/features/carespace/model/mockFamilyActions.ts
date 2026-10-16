import {
  mockProposals,
  publishMockCareState,
} from "@/features/proposal/model/mockProposals";
import { mockRecords } from "@/features/record/model/mockRecords";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { mockCareSpaces } from "./mockCareSpaces";
import { unfinishedMemberTasks } from "./familySelectors";
import type { CareSpaceView } from "./careSpaceViewTypes";
import { reviseProposal } from "@/features/proposal/model/proposalDrafts";

function releaseAssignments(space: CareSpaceView, memberId: string) {
  const state = mockProposals.getForSpace(space);
  const ids = new Set(
    unfinishedMemberTasks(state.items, memberId).map((item) => item.id),
  );
  mockRecords.retain(space);
  publishMockCareState(space.id, {
    ...state,
    items: state.items.map((item) =>
      ids.has(item.id)
        ? {
            ...item,
            version: item.version + 1,
            fields: { ...item.fields, assigneeId: "" },
          }
        : item,
    ),
    // 제출 시점의 요청·결과 이력은 유지하고 현재 대기 제안만 갱신한다.
    proposals: state.proposals.map((proposal) =>
      proposal.kind === "task" &&
      proposal.operation !== "link" &&
      (proposal.status === "review" || proposal.status === "requested") &&
      proposal.afterFields?.assigneeId === memberId
        ? {
            ...reviseProposal(
              proposal,
              { ...proposal.afterFields, assigneeId: "" },
              space,
            ),
            edited: proposal.edited,
          }
        : proposal,
    ),
  });
  return ids.size;
}

export type FamilyActionResult =
  | { ok: true; name: string; released: number }
  | { ok: false; message: string; reason: "permission" | "missing" | "owner" };

export function currentFamilySpace(spaceId: string) {
  if (!isMockPreviewEnabled) return undefined;
  return mockCareSpaces
    .getSnapshot()
    .spaces.find(
      (space) =>
        space.id === spaceId &&
        space.members.some(
          (member) => member.self && member.role === space.role,
        ),
    );
}

// API 없이 메모리만 갱신한다. 지연 처리 종료 시 현재 참여·역할·대상을 재조회한다.
export const mockFamilyActions = {
  leave(spaceId: string): FamilyActionResult {
    const space = currentFamilySpace(spaceId);
    if (!space)
      return {
        ok: false,
        reason: "permission",
        message: "현재 참여 중인 공간을 다시 확인해 주세요.",
      };
    if (space.role === "owner")
      return {
        ok: false,
        reason: "owner",
        message: "소유권을 이전하거나 공간 삭제를 먼저 진행해 주세요.",
      };
    const endParticipation = mockCareSpaces.prepareEndParticipation(
      space.id,
      "left",
    )!;
    const self = space.members.find((member) => member.self)!;
    const released = releaseAssignments(space, self.id);
    endParticipation();
    return { ok: true, name: space.subjectLabel, released };
  },
  deleteSpace(spaceId: string): FamilyActionResult {
    const space = currentFamilySpace(spaceId);
    if (!space || space.role !== "owner")
      return {
        ok: false,
        reason: "permission",
        message: "현재 소유자만 공간을 삭제할 수 있어요.",
      };
    const endParticipation = mockCareSpaces.prepareEndParticipation(
      space.id,
      "deleted",
    )!;
    mockRecords.discardSpace(space.id);
    mockProposals.discardSpace(space.id);
    endParticipation();
    return { ok: true, name: space.subjectLabel, released: 0 };
  },
  transfer(spaceId: string, memberId: string): FamilyActionResult {
    const space = currentFamilySpace(spaceId);
    if (!space || space.role !== "owner")
      return {
        ok: false,
        reason: "permission",
        message: "현재 소유자만 소유권을 이전할 수 있어요.",
      };
    const member = space.members.find((entry) => entry.id === memberId);
    if (!member)
      return {
        ok: false,
        reason: "missing",
        message: "선택한 가족의 참여가 종료됐어요. 다른 가족을 선택해 주세요.",
      };
    if (member.self || member.role !== "member")
      return {
        ok: false,
        reason: "owner",
        message: "현재 함께하는 다른 구성원 한 명을 선택해 주세요.",
      };
    // 소유자에 따라 합성 데이터가 다시 생성되지 않도록 현재 데이터를 먼저 확보한다.
    mockRecords.retain(space);
    mockProposals.getForSpace(space);
    mockCareSpaces.updateMembers(
      space.id,
      space.members.map((entry) => ({
        ...entry,
        role: entry.id === memberId ? "owner" : "member",
      })),
    );
    return { ok: true, name: member.name, released: 0 };
  },
  removeMember(spaceId: string, memberId: string): FamilyActionResult {
    const space = currentFamilySpace(spaceId);
    if (!space || space.role !== "owner")
      return {
        ok: false,
        reason: "permission",
        message: "현재 소유자만 구성원을 내보낼 수 있어요.",
      };
    const member = space.members.find((entry) => entry.id === memberId);
    if (!member)
      return {
        ok: false,
        reason: "missing",
        message: "이미 참여가 종료된 가족이에요.",
      };
    if (member.self || member.role === "owner")
      return {
        ok: false,
        reason: "owner",
        message: "소유자는 내보내기 대상이 아니에요.",
      };
    const released = releaseAssignments(space, memberId);
    mockCareSpaces.updateMembers(
      space.id,
      space.members.filter((entry) => entry.id !== memberId),
    );
    return { ok: true, name: member.name, released };
  },
};
