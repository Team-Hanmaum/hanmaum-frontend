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
let snapshot = { spaces: isMockPreviewEnabled ? examples : [], currentId: "" };
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
  create(subjectLabel: string) {
    if (!isMockPreviewEnabled) return null;
    const space: CareSpaceView = {
      id: `mock-created-${crypto.randomUUID()}`,
      subjectLabel,
      role: "owner",
      empty: true,
      members: [{ id: "self", name: "나", role: "owner", self: true }],
    };
    publish({ spaces: [...snapshot.spaces, space], currentId: space.id });
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
    if (existing) {
      publish({ ...snapshot, currentId: existing.id });
      return { space: existing, alreadyMember: true };
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
    publish({ spaces: [...snapshot.spaces, space], currentId: space.id });
    return { space, alreadyMember: false };
  },
};
