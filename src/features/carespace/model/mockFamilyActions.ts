import {
  mockProposals,
  publishMockCareState,
} from "@/features/proposal/model/mockProposals";
import { mockRecords } from "@/features/record/model/mockRecords";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { mockCareSpaces } from "./mockCareSpaces";
import { unfinishedMemberTasks } from "./familySelectors";

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
    const state = mockProposals.getForSpace(space);
    const released = unfinishedMemberTasks(state.items, memberId);
    const ids = new Set(released.map((item) => item.id));
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
    });
    mockCareSpaces.updateMembers(
      space.id,
      space.members.filter((entry) => entry.id !== memberId),
    );
    return { ok: true, name: member.name, released: released.length };
  },
};
