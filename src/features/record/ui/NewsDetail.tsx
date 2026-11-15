import { LoadingState, Notice } from "@/components/feedback";
import { Button, MenuRow } from "@/components/ui";
import type { RecordView } from "../model/recordViewTypes";
import type { NewsStatus } from "./NewsCard";
import { RecordOriginalCard } from "./RecordOriginalCard";

const statusLabels: Partial<Record<NewsStatus, string>> = {
  "analysis-discarded": "이 소식의 분석이 종료됐어요.",
  "no-change": "추가로 확인할 제안이 없어요.",
  pending: "소유자의 확인을 기다리고 있어요.",
  applied: "제안 검토를 마쳤어요.",
  rejected: "제안을 반영하지 않았어요.",
};

export function NewsDetail({
  record,
  status,
  owner,
  onDelete,
  proposalAction,
}: {
  record: RecordView;
  status: NewsStatus;
  owner: boolean;
  onDelete?: () => void;
  proposalAction?: { label: string; onClick: () => void; disabled?: boolean };
}) {
  const statusLabel = statusLabels[status];
  return (
    <>
      <h1 className="sr-only">소식 상세</h1>
      <RecordOriginalCard record={record} />
      {proposalAction && (
        <MenuRow
          tone="brand"
          icon="news-brand"
          className="min-h-hm-touch-min py-hm-12"
          title={proposalAction.label}
          onClick={proposalAction.onClick}
          disabled={proposalAction.disabled}
        />
      )}
      {statusLabel && (
        <p className="text-hm-body-small text-hm-text-secondary">
          {statusLabel}
        </p>
      )}
      {status === "analyzing" && (
        <LoadingState
          variant="more"
          label="소식에서 돌봄 정보를 정리하고 있어요"
        />
      )}
      {status === "failed" && (
        <Notice
          tone="error"
          title="소식 분석을 마치지 못했어요"
          body="남긴 소식은 계속 볼 수 있어요."
        />
      )}
      {onDelete && (owner || record.author.self) && (
        <Button
          variant="outline"
          className="min-h-hm-touch-min self-start border-hm-feedback-error-text px-hm-16 py-hm-8 text-hm-feedback-error-text hover:bg-hm-feedback-error-bg"
          onClick={onDelete}
        >
          소식 원본 삭제
        </Button>
      )}
    </>
  );
}
