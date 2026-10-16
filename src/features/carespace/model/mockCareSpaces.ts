import { isMockPreviewEnabled } from "@/lib/mockPreview";
import type { CareSpaceView } from "./careSpaceViewTypes";

const examples: CareSpaceView[] = [
  {
    id: "mock-space-1",
    subjectLabel: "엄마",
    role: "owner",
    empty: false,
    members: [
      { id: "self", name: "수진", role: "owner", self: true },
      { id: "member-1", name: "민수", role: "member" },
      { id: "member-2", name: "지연", role: "member" },
    ],
  },
  {
    id: "mock-space-2",
    subjectLabel: "아빠",
    role: "member",
    empty: false,
    members: [
      { id: "member-2", name: "지연", role: "owner" },
      { id: "self", name: "수진", role: "member", self: true },
    ],
  },
];

// 새로고침하면 초기화되는 UI 예시. 쿠키·스토리지·서버 상태와 분리한다.
type ExitNotice = {
  id: string;
  spaceId: string;
  name: string;
  reason: "left" | "deleted";
};
const departedSpaces = new Map<string, CareSpaceView>();
let snapshot: {
  spaces: CareSpaceView[];
  currentId: string;
  ended: Record<string, "left" | "deleted">;
  lastExit?: ExitNotice;
} = { spaces: isMockPreviewEnabled ? examples : [], currentId: "", ended: {} };
const listeners = new Set<() => void>();
function publish(next: typeof snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}
export const mockCareSpaces = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  select(id: string) {
    if (
      !isMockPreviewEnabled ||
      !snapshot.spaces.some((space) => space.id === id)
    )
      return;
    publish({ ...snapshot, currentId: id });
  },
  // 가족 관리 액션의 현재 권한 검증과 연관 데이터 처리 후 호출한다.
  updateMembers(id: string, members: CareSpaceView["members"]) {
    const self = members.find((member) => member.self);
    if (
      !isMockPreviewEnabled ||
      !self ||
      members.filter((member) => member.role === "owner").length !== 1
    )
      return;
    publish({
      ...snapshot,
      spaces: snapshot.spaces.map((space) =>
        space.id === id ? { ...space, role: self.role, members } : space,
      ),
    });
  },
  // 알림 생성 등 실패할 수 있는 준비를 연관 데이터 변경 전에 끝낸다.
  prepareEndParticipation(id: string, reason: "left" | "deleted") {
    const space = snapshot.spaces.find((entry) => entry.id === id);
    if (!isMockPreviewEnabled || !space) return undefined;
    const notice: ExitNotice = {
      id: crypto.randomUUID(),
      spaceId: id,
      name: `${space.subjectLabel}의 돌봄`,
      reason,
    };
    // 가족 액션의 동기 처리 안에서 준비 직후 실행한다.
    return () => {
      if (reason === "left") departedSpaces.set(id, space);
      else departedSpaces.delete(id);
      publish({
        ...snapshot,
        spaces: snapshot.spaces.filter((entry) => entry.id !== id),
        currentId: snapshot.currentId === id ? "" : snapshot.currentId,
        ended: { ...snapshot.ended, [id]: reason },
        lastExit: notice,
      });
      return notice;
    };
  },
  create(subjectLabel: string) {
    if (!isMockPreviewEnabled) return null;
    const space: CareSpaceView = {
      id: `mock-created-${crypto.randomUUID()}`,
      subjectLabel,
      role: "owner",
      empty: true,
      members: [{ id: "self", name: "나", role: "owner", self: true }],
    };
    publish({
      ...snapshot,
      spaces: [...snapshot.spaces, space],
      currentId: space.id,
    });
    return space;
  },
  joinInvitation(token: string) {
    if (!isMockPreviewEnabled) return null;
    const targetId =
      token === "mock-family"
        ? "mock-invited-space"
        : token.startsWith("mock-to-")
          ? token.slice("mock-to-".length).split("~")[0]
          : undefined;
    const existing = snapshot.spaces.find((space) => space.id === targetId);
    if (targetId && snapshot.ended[targetId] === "deleted") return null;
    if (token.startsWith("mock-to-")) {
      const issuedAt = Number(token.split("~")[1]);
      if (
        !issuedAt ||
        issuedAt > Date.now() ||
        Date.now() - issuedAt >= 24 * 60 * 60 * 1000
      )
        return null;
    }
    if (existing) {
      publish({ ...snapshot, currentId: existing.id });
      return { space: existing, alreadyMember: true };
    }
    const departed = targetId ? departedSpaces.get(targetId) : undefined;
    if (departed) {
      const ended = { ...snapshot.ended };
      delete ended[departed.id];
      departedSpaces.delete(departed.id);
      publish({
        ...snapshot,
        spaces: [...snapshot.spaces, departed],
        currentId: departed.id,
        ended,
      });
      return { space: departed, alreadyMember: false };
    }
    if (token !== "mock-family") return null;
    const space: CareSpaceView = {
      id: "mock-invited-space",
      subjectLabel: "어머니",
      role: "member",
      empty: false,
      members: [
        { id: "member-1", name: "민수", role: "owner" },
        { id: "member-2", name: "지연", role: "member" },
        { id: "self", name: "수진", role: "member", self: true },
      ],
    };
    publish({
      ...snapshot,
      spaces: [...snapshot.spaces, space],
      currentId: space.id,
    });
    return { space, alreadyMember: false };
  },
};
