import { Notice } from "@/components/feedback";
import type { ProposalView } from "../model/proposalViewTypes";

export function CarePendingNotice({
  proposals,
  onOpen,
}: {
  proposals: readonly ProposalView[];
  onOpen: (proposal: ProposalView) => void;
}) {
  if (!proposals.length) return null;
  return (
    <div className="flex w-full flex-col gap-hm-12">
      {proposals.map((proposal) => (
        <Notice
          key={proposal.id}
          title={
            proposal.status === "requested"
              ? "승인을 기다리는 요청이 있어요"
              : proposal.operation === "link"
                ? "근거 연결 제안이 있어요"
                : "변경 제안이 있어요"
          }
          body="확정 전까지 현재 정보가 유지돼요."
          action={{
            label:
              proposal.status === "requested"
                ? "요청 내용 보기"
                : "변경 제안 보기",
            onClick: () => onOpen(proposal),
          }}
        />
      ))}
    </div>
  );
}
