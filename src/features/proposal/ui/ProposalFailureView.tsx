import { Badge, Button, Comparison } from "@/components/ui";
import { Notice } from "@/components/feedback";
import type {
  ProposalFailure,
  ProposalSpaceState,
  ProposalView,
} from "../model/proposalViewTypes";

export function ProposalFailureView({
  failure,
  proposals,
  data,
  onReview,
}: {
  failure: ProposalFailure;
  proposals: readonly ProposalView[];
  data: ProposalSpaceState;
  onReview: () => void;
}) {
  const changed = failure.reason === "changed";
  const message = changed
    ? "검토 중 현재 정보가 변경됐어요."
    : failure.reason === "confirmed-question"
      ? "이미 확인된 질문은 내용을 수정하거나 변경을 요청할 수 없어요."
      : failure.reason === "source"
        ? "유효한 원본 근거를 확인할 수 없어요."
        : failure.reason === "permission"
          ? "현재 역할과 공간 참여 상태를 다시 확인해 주세요."
          : "이미 처리됐거나 함께 반영할 수 없는 선택이에요.";
  return (
    <>
      <Badge
        label={changed ? "재확인 필요" : "반영되지 않음"}
        tone="error"
      />
      <h1 className="text-hm-title-page whitespace-pre-line">
        {proposals.length > 1
          ? `${proposals.length}건 모두\n반영하지 않았어요`
          : changed
            ? "현재 정보가 달라졌어요"
            : "반영하지 않았어요"}
      </h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        {message} 현재 돌봄 정보는 그대로예요.
      </p>
      {proposals.map((proposal) => {
        const problem = failure.proposalIds.includes(proposal.id);
        return (
          <article
            key={proposal.id}
            className="flex flex-col items-start gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20"
          >
            <Badge label={problem ? "확인 필요" : "미반영"} />
            <h2 className="text-hm-heading-section">{proposal.title}</h2>
            <p className="text-hm-body-default">
              {problem ? message : "함께 선택한 묶음이어서 반영하지 않았어요."}
            </p>
            {proposals.length === 1 && (
              <Comparison
                beforeLabel="현재 정보"
                beforeValue={
                  data.items.find((item) => item.id === proposal.targetId)
                    ?.value ?? "확인 필요"
                }
                afterLabel="기존 제안"
                afterValue={proposal.afterValue}
              />
            )}
            {problem && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={onReview}
              >
                문제가 된 제안 확인
              </Button>
            )}
          </article>
        );
      })}
      <Notice
        tone="neutral"
        title="선택을 다시 확인해 주세요"
        body="최신 내용과 근거를 확인한 뒤 다시 검토해 주세요. 문제 제안을 선택 해제하고 나머지만 다시 검토할 수 있어요."
      />
    </>
  );
}
