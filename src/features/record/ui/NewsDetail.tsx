import { LoadingState, Notice } from "@/components/feedback";
import { Badge, Comparison, TextAction } from "@/components/ui";
import type {
  RecordAnalysisStatus,
  RecordView,
} from "../model/recordViewTypes";
import { RecordOriginalCard } from "./RecordOriginalCard";

const presentations = {
  analyzing: {
    badge: "소식 저장 완료",
    title: "소식을 저장했어요",
    description:
      "이 소식에서 돌봄 정보를 정리하고 있어요. 결과는 나중에 확인해도 괜찮아요.",
  },
  review: {
    badge: "분석 완료",
    title: "확인할 제안이\n1건 있어요",
    description: "제안은 아직 돌봄 정보에 반영되지 않았어요.",
  },
  "no-change": {
    badge: "분석 완료",
    title: "추가로 확인할\n제안이 없어요",
    description: "남긴 소식은 가족과 계속 함께 볼 수 있어요.",
  },
  failed: {
    badge: "소식 저장 완료",
    title: "분석을 마치지\n못했어요",
    description: "남긴 소식은 그대로 있어요.",
  },
  applied: {
    badge: "반영",
    title: "검토한 제안이\n반영됐어요",
    description: "남긴 소식은 가족과 계속 함께 볼 수 있어요.",
  },
} satisfies Record<
  RecordAnalysisStatus,
  { badge: string; title: string; description: string }
>;

export function NewsDetail({
  record,
  status,
  owner,
  onDelete,
}: {
  record: RecordView;
  status: RecordAnalysisStatus;
  owner: boolean;
  onDelete: () => void;
}) {
  const presentation = presentations[status];
  const proposal = status === "review" ? record.proposal : undefined;
  return (
    <>
      <div className="flex flex-col items-start gap-hm-12">
        <Badge
          label={presentation.badge}
          tone="brand"
        />
        <h1 className="text-hm-title-page whitespace-pre-line">
          {presentation.title}
        </h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          {presentation.description}
        </p>
      </div>
      {status === "analyzing" && (
        <LoadingState
          variant="more"
          label="분석 중이에요"
        />
      )}
      {status === "failed" && (
        <Notice
          tone="error"
          title="분석을 다시 시도해 주세요"
          body="기존 돌봄 정보는 바뀌지 않았어요."
        />
      )}
      <RecordOriginalCard record={record} />
      {proposal && (
        <section
          className="flex flex-col items-start gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20 wrap-anywhere"
          aria-label="분석 제안 예시"
        >
          <Badge label={proposal.typeLabel} />
          <h2 className="text-hm-heading-section">{proposal.title}</h2>
          <Comparison
            beforeLabel={proposal.beforeLabel}
            beforeValue={proposal.beforeValue}
            afterLabel={proposal.afterLabel}
            afterValue={proposal.afterValue}
          />
          <p className="text-hm-body-small text-hm-text-secondary">
            {proposal.meta}
          </p>
        </section>
      )}
      {status === "analyzing" && (
        <Notice
          tone="neutral"
          title="검토 후 반영해요"
          body="분석 결과가 나와도 일정·할 일·질문은 바로 바뀌지 않아요."
        />
      )}
      {proposal && (
        <Notice
          tone="neutral"
          title="현재 일정은 그대로예요"
          body={
            owner
              ? "제안을 검토한 뒤 소유자가 최종 반영해요."
              : "제안을 검토해 반영을 요청할 수 있어요. 최종 반영은 소유자가 진행해요."
          }
        />
      )}
      {(owner || record.author.self) && (
        <TextAction
          tone="danger"
          onClick={onDelete}
        >
          소식 원본 삭제
        </TextAction>
      )}
    </>
  );
}
