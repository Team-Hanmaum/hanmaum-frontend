import { emptyCareFields } from "@/features/careitem/model/careItemFields";
import type { RecordDeletion } from "@/features/record/model/recordDeletionTypes";
import type { ProposalSpaceState, ProposalView } from "./proposalViewTypes";

export function recordImpact(state: ProposalSpaceState, recordId: string) {
  return state.items.filter((item) =>
    item.evidence.some(
      (evidence) =>
        evidence.recordId === recordId ||
        evidence.dependsOnRecordIds?.includes(recordId),
    ),
  );
}
function redact(proposal: ProposalView): ProposalView {
  return {
    id: proposal.id,
    recordId: proposal.recordId,
    targetId: proposal.targetId,
    kind: proposal.kind,
    operation: proposal.operation,
    status: proposal.status,
    requestId: proposal.requestId,
    resultId: proposal.resultId,
    targetVersion: proposal.targetVersion,
    revision: (proposal.revision ?? 0) + 1,
    sourceDeleted: true,
    title: "원본 삭제로 내용 제거",
    typeLabel: "원본 삭제",
    beforeLabel: "변경 전",
    beforeValue: "삭제된 내용",
    afterLabel: "변경 후",
    afterValue: "삭제된 내용",
    context: "원본 삭제로 복사된 내용을 표시하지 않아요.",
  };
}
// Mock에서 원문 사본을 보관하지 않는다. 실제 필드별 출처 추적과 삭제 범위 확정은 BE 책임이다.
export function removeRecordEvidence(
  state: ProposalSpaceState,
  deletion: RecordDeletion,
): ProposalSpaceState {
  const affected = new Set(deletion.itemIds);
  const sanitize = (proposal: ProposalView) =>
    proposal.recordId === deletion.recordId || affected.has(proposal.targetId)
      ? redact(proposal)
      : proposal;
  const items = state.items.map((item) => {
    if (!affected.has(item.id)) return item;
    const evidence = item.evidence.filter(
      (entry) =>
        entry.recordId !== deletion.recordId &&
        !entry.dependsOnRecordIds?.includes(deletion.recordId),
    );
    const supported = evidence.some((entry) =>
      (Object.keys(emptyCareFields) as (keyof typeof emptyCareFields)[]).every(
        (key) => entry.fields[key] === item.fields[key],
      ),
    );
    return supported
      ? { ...item, evidence, version: item.version + 1 }
      : {
          ...item,
          title: "재확인이 필요한 항목",
          value: "",
          meta: "재확인 필요",
          fields: { ...emptyCareFields },
          answer: undefined,
          evidence,
          needsReconfirmation: true,
          version: item.version + 1,
        };
  });
  const unsupported = new Set(
    items
      .filter((item) => item.needsReconfirmation && affected.has(item.id))
      .map((item) => item.id),
  );
  return {
    ...state,
    deletions: [...(state.deletions ?? []), deletion],
    proposals: state.proposals.map((proposal) =>
      proposal.recordId === deletion.recordId ||
      unsupported.has(proposal.targetId)
        ? redact(proposal)
        : proposal,
    ),
    requests: state.requests.map((request) => ({
      ...request,
      proposals: request.proposals.map(sanitize),
    })),
    results: state.results.map((result) => ({
      ...result,
      proposals: result.proposals.map(sanitize),
    })),
    items,
  };
}
