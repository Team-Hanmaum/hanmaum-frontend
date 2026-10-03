import { Badge, Button, type BadgeProps } from "@/components/ui";
import { Notice } from "@/components/feedback";
export type CareCardProps = {
  title: string;
  meta: string;
  body?: string;
  statusLabel: string;
  statusTone?: BadgeProps["tone"];
  state?: "default" | "needs-check" | "locked";
  action?: { label: string; onClick: () => void; disabled?: boolean };
  className?: string;
};
export function CareCard({
  title,
  meta,
  body,
  statusLabel,
  statusTone = "neutral",
  state = "default",
  action,
  className = "",
}: CareCardProps) {
  return (
    <article
      className={`flex w-full min-w-0 flex-col items-start gap-hm-12 rounded-hm-14 bg-hm-bg-surface p-hm-20 wrap-anywhere ${className}`}
    >
      <Badge
        label={statusLabel}
        tone={statusTone}
      />
      <h3 className="w-full text-hm-heading-section">{title}</h3>
      <p className="w-full text-hm-body-small text-hm-text-secondary">{meta}</p>
      {body && (
        <p className="w-full text-hm-body-default whitespace-pre-wrap">
          {body}
        </p>
      )}
      {state !== "default" && (
        <Notice
          title={
            state === "locked"
              ? "다른 가족이 편집 중이에요"
              : "확인할 제안이 있어요"
          }
          body={
            state === "locked"
              ? "내용은 볼 수 있어요. 수정은 편집이 끝난 뒤 가능해요."
              : "검토가 끝나기 전까지 현재 정보가 유지돼요."
          }
        />
      )}
      {action && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      )}
    </article>
  );
}
