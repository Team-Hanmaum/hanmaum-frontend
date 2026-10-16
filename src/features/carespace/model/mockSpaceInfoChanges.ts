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
export type SpaceInfoChangeFailure = {
  ok: false;
  reason:
    | "permission"
    | "missing"
    | "stale"
    | "validation"
    | "unchanged"
    | "processed";
  message: string;
};
export type SpaceInfoChangeResult =
  { ok: true; change: SpaceInfoChange } | SpaceInfoChangeFailure;

function failure(
  reason: SpaceInfoChangeFailure["reason"],
  message: string,
): SpaceInfoChangeFailure {
  return { ok: false, reason, message };
}
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
function currentSpace(
  id: string,
): { ok: true; space: CareSpaceView } | SpaceInfoChangeFailure {
  const space = mockCareSpaces
    .getSnapshot()
    .spaces.find((entry) => entry.id === id);
  if (!isMockPreviewEnabled)
    return failure("permission", "Mock 화면에서만 변경할 수 있어요.");
  if (!space) return failure("missing", "공간을 찾을 수 없어요.");
  if (
    !space.members.some((member) => member.self && member.role === space.role)
  )
    return failure("permission", "지금은 이 공간에 접근할 수 없어요.");
  return { ok: true, space };
}
export function validateSubjectLabel(value: string) {
  const label = value.trim();
  return !label ||
    Array.from(label).length > 30 ||
    /[\r\n\u2028\u2029]/u.test(label)
    ? "이름 또는 호칭을 줄바꿈 없이 1~30자로 입력해 주세요."
    : "";
}
function applyLabel(
  space: CareSpaceView,
  label: string,
  version: number,
  mockOwnerId?: string,
) {
  // 공간 이름을 바꿔도 기존 Mock 소식·돌봄 예시를 재생성하지 않는다.
  mockRecords.retain(space);
  mockProposals.getForSpace(space);
  mockCareSpaces.updateSubjectLabel(space.id, label, version, mockOwnerId);
}
export const mockSpaceInfoChanges = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  discardSpace(spaceId: string) {
    if (!isMockPreviewEnabled) return;
    publish(snapshot.filter((change) => change.spaceId !== spaceId));
  },
  submit(
    id: string,
    value: string,
    version: number,
    role: CareSpaceView["role"],
  ): SpaceInfoChangeResult {
    const current = currentSpace(id);
    if (!current.ok) return current;
    const { space } = current;
    const error = validateSubjectLabel(value);
    if (error) return failure("validation", error);
    if (space.role !== role)
      return failure(
        "permission",
        "내 역할이 바뀌었어요. 현재 역할을 다시 확인해 주세요.",
      );
    if ((space.infoVersion ?? 0) !== version)
      return failure(
        "stale",
        "공간 정보가 바뀌었어요. 변경 내용을 다시 확인해 주세요.",
      );
    const label = value.trim();
    if (label === space.subjectLabel)
      return failure("unchanged", "변경한 내용이 없어요.");
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
    return { ok: true, change };
  },
  decide(
    id: string,
    apply: boolean,
    version: number,
    reviewAsOwner = false,
  ): SpaceInfoChangeResult {
    const change = snapshot.find((entry) => entry.id === id);
    if (!change) return failure("missing", "요청을 찾을 수 없어요.");
    const current = currentSpace(change.spaceId);
    if (!current.ok) return current;
    const { space } = current;
    // 같은 요청의 승인 결과를 확인하는 명시적인 Mock 소유자 미리보기.
    const mockOwnerId = reviewAsOwner
      ? space.members.find((member) => member.role === "owner")?.id
      : undefined;
    if (space.role !== "owner" && !mockOwnerId)
      return failure("permission", "현재 소유자만 최종 처리할 수 있어요.");
    if (change.status !== "requested")
      return failure(
        "processed",
        "이미 처리된 요청이에요. 결과를 다시 확인해 주세요.",
      );
    // 화면을 나중에 열어도 요청 당시 버전을 최신 버전으로 대체할 수 없다.
    if (
      (space.infoVersion ?? 0) !== change.version ||
      (space.infoVersion ?? 0) !== version
    )
      return failure(
        "stale",
        "요청 이후 공간 정보가 바뀌었어요. 이 요청은 처리할 수 없어요. 현재 정보를 확인해 주세요.",
      );
    if (apply) applyLabel(space, change.after, version, mockOwnerId);
    const result: SpaceInfoChange = {
      ...change,
      status: apply ? "applied" : "rejected",
      decidedAt: Date.now(),
    };
    publish(snapshot.map((entry) => (entry.id === id ? result : entry)));
    return { ok: true, change: result };
  },
};
export function useMockSpaceInfoChanges(spaceId: string) {
  return useSyncExternalStore(
    mockSpaceInfoChanges.subscribe,
    mockSpaceInfoChanges.getSnapshot,
    mockSpaceInfoChanges.getSnapshot,
  ).filter((change) => change.spaceId === spaceId);
}
export function pendingSpaceInfoCount(
  changes: readonly SpaceInfoChange[],
  space: CareSpaceView,
) {
  const selfId = space.members.find((member) => member.self)?.id;
  return changes.filter(
    (change) =>
      change.status === "requested" &&
      (space.role === "owner" || change.authorId === selfId),
  ).length;
}
