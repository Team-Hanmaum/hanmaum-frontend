import { Badge, Button, Comparison } from "@/components/ui";
import type { ProposalView } from "../model/proposalViewTypes";
import { ProposalFieldChanges } from "./ProposalFieldChanges";

export function ProposalSummaryCard({
  proposal,
  label,
  meta,
  action,
  afterLabel,
}: {
  proposal: ProposalView;
  label: string;
  meta?: string;
  afterLabel?: string;
  action?: { label: string; onClick: () => void };
}) {
  if (proposal.sourceDeleted)
    return (
      <article className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
        <Badge label="원본 삭제" />
        <h2 className="text-hm-heading-section">
          삭제된 내용은 표시하지 않아요
        </h2>
        <p className="text-hm-body-small text-hm-text-secondary">
          원본에서 복사된 제목과 변경 전후 내용을 제거했어요.
        </p>
        {meta && (
          <p className="text-hm-body-small text-hm-text-secondary">{meta}</p>
        )}
        {action && (
          <Button
            variant="secondary"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </article>
    );
  return (
    <article className="flex min-w-0 flex-col items-start gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20 wrap-anywhere">
      <Badge label={label} />
      <h2 className="text-hm-heading-section">{proposal.title}</h2>
      <Comparison
        beforeLabel={proposal.beforeLabel}
        beforeValue={proposal.beforeValue}
        afterLabel={afterLabel ?? proposal.afterLabel}
        afterValue={proposal.afterValue}
      />
      {proposal.edited && <ProposalFieldChanges proposal={proposal} />}
      {meta && (
        <p className="text-hm-body-small whitespace-pre-wrap text-hm-text-secondary">
          {meta}
        </p>
      )}
      {action && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </article>
  );
}
