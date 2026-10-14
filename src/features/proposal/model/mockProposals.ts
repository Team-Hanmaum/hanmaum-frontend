import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { mockRecords } from "@/features/record/model/mockRecords";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { getMockProposalData } from "./mockProposalData";
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
      return !target || target.version !== selection[index].version;
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
      beforeValue: current.items.find((item) => item.id === proposal.targetId)!
        .value,
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
          ? current.items.map((item) => {
              const proposal = selected.find(
                (entry) => entry.targetId === item.id,
              );
              return proposal
                ? {
                    ...item,
                    value: proposal.afterValue,
                    version: item.version + 1,
                  }
                : item;
            })
          : current.items,
    });
    return { ok: true, id };
  },
};
