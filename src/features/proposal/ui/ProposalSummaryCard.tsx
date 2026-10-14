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
