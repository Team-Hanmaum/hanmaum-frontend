import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import {
  mockProposals,
  publishMockCareState,
} from "@/features/proposal/model/mockProposals";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { careMeta, careValue } from "./careItemFields";
import {
  canApplyCareChange,
  careDraftError,
  nextCareStatus,
} from "./careChangeRules";
import type {
  CareChange,
  CareChangeDraft,
  CareChangeOutcome,
} from "./careChangeTypes";
import type { CareItemView } from "./careItemViewTypes";

function applyChange(
  draft: CareChangeDraft,
  item: CareItemView | undefined,
  actor: { id: string; name: string },
  now: number,
): CareItemView {
  const fields =
    draft.operation === "create" || draft.operation === "edit"
      ? { ...draft.fields }
      : draft.operation === "assignee"
        ? { ...item!.fields, assigneeId: draft.fields.assigneeId }
        : { ...item!.fields };
  const status = nextCareStatus(draft, item);
  const evidence = [...(item?.evidence ?? [])];
  const directContent = draft.evidence.trim();
  if (
    directContent &&
    draft.operation !== "status" &&
    draft.operation !== "delete"
  ) {
    evidence.push({
      id: `direct-${draft.id}`,
      author: actor.name,
      createdAt: now,
      directContent,
      fields: { ...fields },
      // 기존 필드가 포함된 변경은 원본 삭제 시 함께 재검토한다.
      dependsOnRecordIds: [
        ...new Set(
          item?.evidence.flatMap((entry) => [
            ...(entry.recordId ? [entry.recordId] : []),
            ...(entry.dependsOnRecordIds ?? []),
          ]) ?? [],
        ),
      ],
    });
  }
  return {
    ...item,
    id: draft.itemId,
    kind: draft.kind,
    createdAt: item?.createdAt ?? now,
    fields,
    status,
    title: fields.title || fields.content,
    value: careValue(draft.kind, fields),
    meta: careMeta(draft.kind, fields, status),
    version: (item?.version ?? 0) + 1,
    statusChangedAt: status !== item?.status ? now : item?.statusChangedAt,
    answer:
      draft.operation === "answer"
        ? { content: draft.answer.trim(), confirmedBy: actor.name }
        : item?.answer,
    deletedAt: draft.operation === "delete" ? now : undefined,
    evidence,
  };
}
export const mockCareChanges = {
  submit(space: CareSpaceView, draft: CareChangeDraft): CareChangeOutcome {
    if (!isMockPreviewEnabled)
      return { ok: false, message: "Mock 화면 확인이 꺼져 있어요." };
    const state = mockProposals.getForSpace(space);
    const existing = state.careChanges?.find(
      (change) => change.id === draft.id,
    );
    if (existing) return { ok: true, id: existing.id };
    const item = state.items.find((entry) => entry.id === draft.itemId);
    const message = careDraftError(draft, item, space);
    if (message) return { ok: false, message };
    const self = space.members.find((member) => member.self)!;
    const actor = { id: self.id, name: self.name };
    const now = Date.now();
    const direct = canApplyCareChange(space, draft, item);
    const after = direct ? applyChange(draft, item, actor, now) : undefined;
    const change: CareChange = {
      id: draft.id,
      draft: structuredClone(draft),
      status: direct ? "applied" : "requested",
      author: actor,
      createdAt: now,
      before: item ? structuredClone(item) : undefined,
      after,
      ...(direct ? { decidedBy: actor, decidedAt: now } : {}),
    };
    publishMockCareState(space.id, {
      ...state,
      careChanges: [...(state.careChanges ?? []), change],
      items: after
        ? item
          ? state.items.map((entry) => (entry.id === item.id ? after : entry))
          : [...state.items, after]
        : state.items,
    });
    return { ok: true, id: change.id };
  },
  decide(
    space: CareSpaceView,
    changeId: string,
    decision: "applied" | "rejected",
  ): CareChangeOutcome {
    const actor = space.members.find(
      (member) => member.self && member.role === "owner",
    );
    if (!isMockPreviewEnabled || space.role !== "owner" || !actor)
      return { ok: false, message: "소유자만 최종 반영할 수 있어요." };
    const state = mockProposals.getForSpace(space);
    const change = state.careChanges?.find((entry) => entry.id === changeId);
    if (!change) return { ok: false, message: "요청을 찾을 수 없어요." };
    if (change.status === decision) return { ok: true, id: change.id };
    if (change.status !== "requested")
      return { ok: false, message: "이미 처리된 요청이에요." };
    const item = state.items.find((entry) => entry.id === change.draft.itemId);
    if (decision === "applied") {
      const message = change.redacted
        ? "원본이 삭제된 요청은 반영할 수 없어요."
        : careDraftError(change.draft, item, space);
      if (message) return { ok: false, message };
    }
    const now = Date.now();
    const after =
      decision === "applied"
        ? applyChange(change.draft, item, actor, now)
        : undefined;
    publishMockCareState(space.id, {
      ...state,
      careChanges: state.careChanges!.map((entry) =>
        entry.id === change.id
          ? {
              ...entry,
              status: decision,
              decidedBy: { id: actor.id, name: actor.name },
              decidedAt: now,
              after,
            }
          : entry,
      ),
      items: after
        ? item
          ? state.items.map((entry) => (entry.id === item.id ? after : entry))
          : [...state.items, after]
        : state.items,
    });
    return { ok: true, id: change.id };
  },
};
