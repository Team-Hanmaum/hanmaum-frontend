import { useSyncExternalStore } from "react";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { mockRecords } from "@/features/record/model/mockRecords";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import { mockCareSpaces } from "./mockCareSpaces";
import type { CareSpaceView } from "./careSpaceViewTypes";

export type SpaceInfoChange = {
  id: string;
  spaceId: string;
  before: string;
  after: string;
  version: number;
  authorId: string;
  author: string;
  createdAt: number;
  status: "requested" | "applied" | "rejected";
  decidedAt?: number;
};
// 소유자가 다른 가족의 요청을 검토할 수 있는 UI 예시.
let snapshot: SpaceInfoChange[] = isMockPreviewEnabled
  ? [
      {
        id: "mock-space-info-request",
        spaceId: "mock-space-1",
        before: "엄마",
        after: "어머니",
        version: 0,
        authorId: "member-1",
        author: "민수",
        createdAt: Date.now(),
        status: "requested",
      },
    ]
  : [];
const listeners = new Set<() => void>();
function publish(next: SpaceInfoChange[]) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}
function currentSpace(id: string) {
  const space = mockCareSpaces
    .getSnapshot()
    .spaces.find((entry) => entry.id === id);
  if (!isMockPreviewEnabled || !space?.members.some((member) => member.self))
    throw new Error("지금은 이 공간에 접근할 수 없어요.");
  return space;
}
export function validateSubjectLabel(value: string) {
  const label = value.trim();
  return !label ||
    Array.from(label).length > 30 ||
    /[\r\n\u2028\u2029]/u.test(label)
    ? "이름 또는 호칭을 줄바꿈 없이 1~30자로 입력해 주세요."
    : "";
}
function applyLabel(space: CareSpaceView, label: string, version: number) {
  // 공간 이름을 바꿔도 기존 Mock 소식·돌봄 예시를 재생성하지 않는다.
  mockRecords.retain(space);
  mockProposals.getForSpace(space);
  mockCareSpaces.updateSubjectLabel(space.id, label, version);
}
export const mockSpaceInfoChanges = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  submit(
    id: string,
    value: string,
    version: number,
    role: CareSpaceView["role"],
  ) {
    const space = currentSpace(id);
    const error = validateSubjectLabel(value);
    if (error) throw new Error(error);
    if (space.role !== role || (space.infoVersion ?? 0) !== version)
      throw new Error(
        "공간 정보나 내 역할이 바뀌었어요. 변경 내용을 다시 확인해 주세요.",
      );
    const label = value.trim();
    if (label === space.subjectLabel) throw new Error("변경한 내용이 없어요.");
    const actor = space.members.find((member) => member.self)!;
    const change: SpaceInfoChange = {
      id: crypto.randomUUID(),
      spaceId: id,
      before: space.subjectLabel,
      after: label,
      version,
      authorId: actor.id,
      author: actor.name,
      createdAt: Date.now(),
      status: role === "owner" ? "applied" : "requested",
      decidedAt: role === "owner" ? Date.now() : undefined,
    };
    if (role === "owner") applyLabel(space, label, version);
    publish([change, ...snapshot]);
    return change;
  },
  decide(id: string, apply: boolean, version: number) {
    const change = snapshot.find((entry) => entry.id === id);
    if (!change) throw new Error("요청을 찾을 수 없어요.");
    const space = currentSpace(change.spaceId);
    if (space.role !== "owner")
      throw new Error("현재 소유자만 최종 처리할 수 있어요.");
    if (change.status !== "requested")
      throw new Error("이미 처리된 요청이에요. 결과를 다시 확인해 주세요.");
    if ((space.infoVersion ?? 0) !== version)
      throw new Error(
        "공간 정보가 바뀌었어요. 현재 이름과 다시 비교해 주세요.",
      );
    if (apply) applyLabel(space, change.after, version);
    const result: SpaceInfoChange = {
      ...change,
      status: apply ? "applied" : "rejected",
      decidedAt: Date.now(),
    };
    publish(snapshot.map((entry) => (entry.id === id ? result : entry)));
    return result;
  },
};
export function useMockSpaceInfoChanges(spaceId: string) {
  return useSyncExternalStore(
    mockSpaceInfoChanges.subscribe,
    mockSpaceInfoChanges.getSnapshot,
    mockSpaceInfoChanges.getSnapshot,
  ).filter((change) => change.spaceId === spaceId);
}
