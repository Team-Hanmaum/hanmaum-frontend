import { Badge, Button, type BadgeProps } from "@/components/ui";
export type NewsStatus =
  "analyzing" | "review" | "pending" | "applied" | "no-change" | "failed";
const statuses: Record<
  NewsStatus,
  { label: string; tone: BadgeProps["tone"]; message: string }
> = {
  analyzing: {
    label: "분석 중",
    tone: "neutral",
    message: "소식은 저장됐어요. 분석 결과를 준비하고 있어요.",
  },
  review: {
    label: "검토 대기",
    tone: "brand",
    message: "변경 제안을 확인해 주세요.",
  },
  pending: {
    label: "승인 대기",
    tone: "neutral",
    message: "소유자가 요청을 확인하고 있어요.",
  },
  applied: {
    label: "반영",
    tone: "brand",
    message: "검토한 제안이 반영됐어요.",
  },
  "no-change": {
    label: "제안 없음",
    tone: "neutral",
    message: "현재 정보에 반영할 제안이 없어요.",
  },
  failed: {
    label: "분석 실패",
    tone: "error",
    message: "소식은 저장됐어요. 분석을 다시 시도할 수 있어요.",
  },
};
export type NewsCardProps = {
  title: string;
  author: string;
  body: string;
  status: NewsStatus;
  statusMessage?: string;
  onAction?: () => void;
  actionLabel?: string;
  actionLoading?: boolean;
  className?: string;
};
export function NewsCard({
  title,
  author,
  body,
  status,
  statusMessage,
  onAction,
  actionLabel,
  actionLoading = false,
  className = "",
}: NewsCardProps) {
  const presentation = statuses[status];
  return (
    <article
      className={`flex w-full min-w-0 flex-col items-start gap-hm-12 rounded-hm-14 bg-hm-bg-surface p-hm-20 wrap-anywhere ${className}`}
    >
      <p className="w-full text-hm-caption-default text-hm-text-secondary">
        {author}
      </p>
      <h3 className="w-full text-hm-heading-section">{title}</h3>
      <p className="w-full text-hm-body-reading whitespace-pre-wrap">{body}</p>
      <Badge
        label={presentation.label}
        tone={presentation.tone}
      />
      <p
        className={`w-full text-hm-body-small ${status === "failed" ? "text-hm-feedback-error-text" : "text-hm-text-secondary"}`}
      >
        {statusMessage ?? presentation.message}
      </p>
      {onAction && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={onAction}
          loading={actionLoading}
        >
          {actionLabel ??
            (status === "failed" ? "분석 다시 시도" : "소식 자세히 보기")}
        </Button>
      )}
    </article>
  );
}
