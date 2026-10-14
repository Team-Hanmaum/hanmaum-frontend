import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import type { ProposalSpaceState } from "./proposalViewTypes";

export function getPendingProposalCount(
  data: ProposalSpaceState,
  space: CareSpaceView,
) {
  const selfId = space.members.find((member) => member.self)?.id;
  const visibleRequests = data.requests.filter(
    (request) => space.role === "owner" || request.author.id === selfId,
  );
  return data.proposals.filter(
    (proposal) =>
      proposal.status === "review" ||
      (proposal.status === "requested" &&
        visibleRequests.some((request) => request.id === proposal.requestId)),
  ).length;
}

// 원본·분석 저장 상태를 수정하지 않고 목록/상세/홈에 같은 처리 상태를 투영한다.
export function getRecordsWithProposals(
  records: readonly RecordView[],
  data: ProposalSpaceState,
): readonly RecordView[] {
  return records.map((record) => {
    const proposals = data.proposals.filter(
      (item) => item.recordId === record.id,
    );
    if (!proposals.length) return record;
    const review = proposals.filter((item) => item.status === "review");
    const requested = proposals.filter((item) => item.status === "requested");
    const applied = proposals.filter((item) => item.status === "applied");
    const rejected = proposals.filter((item) => item.status === "rejected");
    const status = review.length
      ? "review"
      : requested.length
        ? "pending"
        : applied.length
          ? "applied"
          : "rejected";
    const proposal = review[0];
    return {
      ...record,
      proposalSummary: {
        status,
        count: review.length || requested.length || proposals.length,
        message: [
          review.length && `검토 대기 ${review.length}건`,
          requested.length && `승인 요청 ${requested.length}건`,
          applied.length && `반영 ${applied.length}건`,
          rejected.length && `미적용 ${rejected.length}건`,
        ]
          .filter(Boolean)
          .join(" · "),
      },
      proposal: proposal
        ? {
            typeLabel: proposal.typeLabel,
            title: proposal.title,
            beforeLabel: proposal.beforeLabel,
            beforeValue:
              data.items.find((item) => item.id === proposal.targetId)?.value ??
              proposal.beforeValue,
            afterLabel: proposal.afterLabel,
            afterValue: proposal.afterValue,
            meta: proposal.context,
          }
        : undefined,
    };
  });
}
