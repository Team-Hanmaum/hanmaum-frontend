import {
  Badge,
  Button,
  Comparison,
  SelectionRow,
  TextAction,
  type ComparisonProps,
} from "@/components/ui";
export type ProposalProps = {
  title: string;
  badgeLabel: string;
  context: string;
  comparison: ComparisonProps;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  disabled?: boolean;
  onViewSource?: () => void;
  viewSourceLabel?: string;
  onChangeTarget?: () => void;
  onEdit?: () => void;
  className?: string;
};
export function Proposal({
  title,
  badgeLabel,
  context,
  comparison,
  selected,
  onSelectedChange,
  disabled = false,
  onViewSource,
  viewSourceLabel = "현재 정보 · 근거 보기",
  onChangeTarget,
  onEdit,
  className = "",
}: ProposalProps) {
  return (
    <article
      className={`flex w-full min-w-0 flex-col items-start gap-hm-16 rounded-hm-14 bg-hm-bg-surface p-hm-20 wrap-anywhere ${className}`}
    >
      <SelectionRow
        label="이 제안 선택"
        aria-label={`${title} 제안 선택`}
        checked={selected}
        onChange={(event) => onSelectedChange(event.target.checked)}
        disabled={disabled}
      />
      <Badge label={badgeLabel} />
      <h3 className="w-full text-hm-heading-section">{title}</h3>
      <Comparison {...comparison} />
      <p className="w-full text-hm-body-small whitespace-pre-wrap text-hm-text-secondary">
        {context}
      </p>
      {onViewSource && (
        <TextAction
          className="w-full"
          onClick={onViewSource}
        >
          {viewSourceLabel}
        </TextAction>
      )}
      {onChangeTarget && (
        <TextAction
          className="w-full"
          onClick={onChangeTarget}
          disabled={disabled}
        >
          연결 대상 확인·변경
        </TextAction>
      )}
      {onEdit && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onEdit}
          disabled={disabled}
        >
          제안 내용 수정
        </Button>
      )}
    </article>
  );
}
