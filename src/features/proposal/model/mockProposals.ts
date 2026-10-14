import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { mockRecords } from "@/features/record/model/mockRecords";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getMockProposalData } from "./mockProposalData";
import { validateCareFields } from "@/features/careitem/model/careItemFields";
import type { CareItemFields } from "@/features/careitem/model/careItemViewTypes";
import { reviseProposal, retargetProposal } from "./proposalDrafts";
import { applyMockProposals } from "./applyMockProposals";
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
    const id = `mock-${decision}-${crypto.randomUUID()}`;
    const createdAt = Date.now();
    const author = { id: actor.id, name: actor.name };
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
      items:
        decision === "applied"
          ? applyMockProposals(current.items, selected, author, createdAt)
          : current.items,
    });
    return { ok: true, id };
  },
};
