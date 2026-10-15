import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { mockRecords } from "@/features/record/model/mockRecords";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getMockProposalData } from "./mockProposalData";
import {
  careMeta,
  careValue,
  validateCareFields,
} from "@/features/careitem/model/careItemFields";
import type { CareItemFields } from "@/features/careitem/model/careItemViewTypes";
import {
  reviseProposal,
  retargetProposal,
  isConfirmedQuestionChange,
} from "./proposalDrafts";
import { isConfirmedQuestion } from "@/features/careitem/model/careItemStatus";
import { applyMockProposals } from "./applyMockProposals";
import { recordImpact, removeRecordEvidence } from "./removeRecordEvidence";
import type { RecordDeletion } from "@/features/record/model/recordDeletionTypes";
import type {
  ProposalFailure,
  ProposalOutcome,
  ProposalSelection,
  ProposalSpaceState,
  ProposalView,
} from "./proposalViewTypes";

let snapshot: Record<string, ProposalSpaceState> = {};
const seeds = new Map<string, ProposalSpaceState>();
const listeners = new Set<() => void>();
function publish(spaceId: string, state: ProposalSpaceState) {
  snapshot = { ...snapshot, [spaceId]: state };
  listeners.forEach((listener) => listener());
}
const failure = (
  reason: ProposalFailure["reason"],
  proposalIds: readonly string[] = [],
): ProposalFailure => ({ ok: false, reason, proposalIds });

// 직접 변경과 제안 반영이 같은 현재 항목을 갱신하도록 하나의 Mock 저장소 사용.
export function publishMockCareState(
  spaceId: string,
  state: ProposalSpaceState,
) {
  if (isMockPreviewEnabled) publish(spaceId, state);
}

// 메모리 기반 화면 검증 전용. 권한·버전·원본·멱등성의 최종 보장은 BE에서 처리한다.
export const mockProposals = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getForSpace(space: CareSpaceView): ProposalSpaceState {
    if (!seeds.has(space.id)) seeds.set(space.id, getMockProposalData(space));
    return snapshot[space.id] ?? seeds.get(space.id)!;
  },
  removeSource(space: CareSpaceView, recordId: string): RecordDeletion | null {
    if (!isMockPreviewEnabled) return null;
    const current = mockProposals.getForSpace(space);
    const existing = current.deletions?.find(
      (entry) => entry.recordId === recordId,
    );
    if (existing) return existing;
    const self = space.members.find(
      (member) => member.self && member.role === space.role,
    );
    const record = mockRecords
      .getForSpace(space)
      .find((entry) => entry.id === recordId);
    if (
      !self ||
      !record ||
      (space.role !== "owner" && record.author.id !== self.id)
    )
      return null;
    const deletion: RecordDeletion = {
      id: `mock-deletion-${crypto.randomUUID()}`,
      recordId,
      actor: { id: self.id, name: self.name },
      createdAt: Date.now(),
      itemIds: recordImpact(current, recordId).map((item) => item.id),
    };
    publish(space.id, removeRecordEvidence(current, deletion));
    return deletion;
  },
  reconfirm(
    space: CareSpaceView,
    itemId: string,
    version: number,
    fields: CareItemFields,
    evidence: string,
  ): ProposalOutcome {
    const current = mockProposals.getForSpace(space);
    const item = current.items.find((entry) => entry.id === itemId);
    const actor = space.members.find(
      (member) => member.self && member.role === "owner",
    );
    if (!isMockPreviewEnabled || space.role !== "owner" || !actor)
      return failure("permission");
    if (!item?.needsReconfirmation || item.version !== version)
      return failure("changed");
    if (isConfirmedQuestion(item)) return failure("confirmed-question");
    if (
      !evidence.trim() ||
      Object.keys(validateCareFields(item.kind, fields)).length ||
      (fields.assigneeId &&
        !space.members.some((member) => member.id === fields.assigneeId))
    )
      return failure("selection");
    const id = `mock-reconfirmation-${crypto.randomUUID()}`;
    const createdAt = Date.now();
    publish(space.id, {
      ...current,
      reconfirmations: [
        ...(current.reconfirmations ?? []),
        {
          id,
          itemId,
          actor: actor.name,
          createdAt,
          fields: { ...fields },
          evidence,
        },
      ],
      items: current.items.map((entry) =>
        entry.id === itemId
          ? {
              ...entry,
              fields: { ...fields },
              title: fields.title || fields.content,
              value: careValue(item.kind, fields),
              meta: careMeta(item.kind, fields, item.status),
              needsReconfirmation: false,
              version: entry.version + 1,
              evidence: [
                ...entry.evidence,
                {
                  id,
                  author: actor.name,
                  createdAt,
                  directContent: evidence,
                  fields: { ...fields },
                },
              ],
            }
          : entry,
      ),
    });
    return { ok: true, id };
  },
  revise(
    space: CareSpaceView,
    proposalId: string,
    revision: number,
    change: { fields: CareItemFields } | { targetId: string },
  ): ProposalOutcome {
    const current = mockProposals.getForSpace(space);
    const proposal = current.proposals.find((item) => item.id === proposalId);
    if (
      !isMockPreviewEnabled ||
      !space.members.some((member) => member.self && member.role === space.role)
    )
      return failure("permission");
    if (!proposal || proposal.status !== "review" || proposal.sourceDeleted)
      return failure("selection");
    if ((proposal.revision ?? 0) !== revision)
      return failure("changed", [proposalId]);
    if (
      !mockRecords
        .getForSpace(space)
        .some((record) => record.id === proposal.recordId)
    )
      return failure("source", [proposalId]);
    let updated: ProposalView;
    if ("fields" in change) {
      const target = current.items.find(
        (item) => item.id === proposal.targetId,
      );
      if (isConfirmedQuestionChange(proposal, target))
        return failure("confirmed-question", [proposalId]);
      if (
        proposal.operation !== "create" &&
        (!target ||
          target.needsReconfirmation ||
          target.version !== proposal.targetVersion)
      )
        return failure("changed", [proposalId]);
      if (
        proposal.operation === "link" ||
        Object.keys(validateCareFields(proposal.kind, change.fields)).length
      )
        return failure("selection");
      if (
        change.fields.assigneeId &&
        !space.members.some((member) => member.id === change.fields.assigneeId)
      )
        return failure("changed", [proposalId]);
      updated = reviseProposal(proposal, change.fields, space);
    } else {
      const target = current.items.find(
        (item) =>
          item.id === change.targetId &&
          item.kind === proposal.kind &&
          !item.needsReconfirmation,
      );
      if (!target || proposal.operation === "create")
        return failure("changed", [proposalId]);
      if (isConfirmedQuestionChange(proposal, target))
        return failure("confirmed-question", [proposalId]);
      updated = retargetProposal(proposal, target, space);
    }
    publish(space.id, {
      ...current,
      proposals: current.proposals.map((item) =>
        item.id === proposalId ? updated : item,
      ),
    });
    return { ok: true, id: proposalId };
  },
  submit(
    space: CareSpaceView,
    selection: readonly ProposalSelection[],
    decision: "request" | "applied" | "rejected",
  ): ProposalOutcome {
    const actor = space.members.find(
      (member) => member.self && member.role === space.role,
    );
    if (
      !isMockPreviewEnabled ||
      !actor ||
      (decision === "request"
        ? space.role !== "member"
        : space.role !== "owner")
    )
      return failure("permission");
    const current = mockProposals.getForSpace(space);
    const ids = selection.map((item) => item.id);
    if (!ids.length || new Set(ids).size !== ids.length)
      return failure("selection");
    const proposals = ids.map((id) =>
      current.proposals.find((item) => item.id === id),
    );
    if (proposals.some((item) => !item)) return failure("selection");
    const selected = proposals as ProposalView[];
    if (selected.some((proposal) => proposal.sourceDeleted))
      return failure("source", ids);

    // 같은 선택의 재전송은 기존 결과로 이동하고 중복 요청·이력을 만들지 않는다.
    const existing =
      decision === "request"
        ? current.requests
        : current.results.filter((result) => result.decision === decision);
    const repeated = existing.find(
      (entry) =>
        entry.proposals.length === ids.length &&
        entry.proposals.every((item) => ids.includes(item.id)),
    );
    if (repeated) return { ok: true, id: repeated.id };
    const allowed = selected.every((item) =>
      decision === "request"
        ? item.status === "review"
        : item.status === "review" || item.status === "requested",
    );
    if (!allowed) return failure("selection", ids);
    const records = mockRecords.getForSpace(space);
    const missingSource = selected.filter(
      (item) => !records.some((record) => record.id === item.recordId),
    );
    if (missingSource.length)
      return failure(
        "source",
        missingSource.map((item) => item.id),
      );
    const changed = selected.filter((proposal, index) => {
      const target = current.items.find(
        (item) => item.id === proposal.targetId,
      );
      return (
        proposal.sourceDeleted ||
        (proposal.revision ?? 0) !== (selection[index].revision ?? 0) ||
        (proposal.operation === "create"
          ? Boolean(target) || selection[index].version !== 0
          : !target ||
            target.needsReconfirmation ||
            target.version !== proposal.targetVersion ||
            target.version !== selection[index].version)
      );
    });
    if (changed.length)
      return failure(
        "changed",
        changed.map((item) => item.id),
      );
    if (new Set(selected.map((item) => item.targetId)).size !== selected.length)
      return failure("conflict", ids);
    if (decision !== "rejected") {
      const locked = selected.filter((proposal) =>
        isConfirmedQuestionChange(
          proposal,
          current.items.find((item) => item.id === proposal.targetId),
        ),
      );
      if (locked.length)
        return failure(
          "confirmed-question",
          locked.map((proposal) => proposal.id),
        );
    }
    const id = `mock-${decision}-${crypto.randomUUID()}`;
    const createdAt = Date.now();
    const author = { id: actor.id, name: actor.name };
    let items = current.items;
    if (decision === "applied") {
      const application = applyMockProposals(
        items,
        selected,
        author,
        createdAt,
      );
      if (!application.ok) return application;
      items = application.items;
    }
    const copies = selected.map((proposal) => ({
      ...proposal,
      beforeValue:
        current.items.find((item) => item.id === proposal.targetId)?.value ??
        proposal.beforeValue,
      beforeFields: current.items.find((item) => item.id === proposal.targetId)
        ?.fields,
    }));
    const nextStatus = decision === "request" ? "requested" : decision;
    // 전체 검증 후 한 번만 갱신한다. 실패 시 일부만 반영하지 않는다.
    publish(space.id, {
      ...current,
      proposals: current.proposals.map((proposal) =>
        ids.includes(proposal.id)
          ? {
              ...proposal,
              status: nextStatus,
              ...(decision === "request"
                ? { requestId: id }
                : { resultId: id }),
            }
          : proposal,
      ),
      requests:
        decision === "request"
          ? [...current.requests, { id, author, createdAt, proposals: copies }]
          : current.requests,
      results:
        decision !== "request"
          ? [
              ...current.results,
              { id, decision, actor: author, createdAt, proposals: copies },
            ]
          : current.results,
      items,
    });
    return { ok: true, id };
  },
};
