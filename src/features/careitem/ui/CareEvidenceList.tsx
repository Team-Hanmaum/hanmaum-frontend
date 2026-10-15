import { Notice } from "@/components/feedback";
import { Source } from "@/features/record/ui/Source";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import type { CareItemView } from "../model/careItemViewTypes";

export function CareEvidenceList({
  item,
  records,
  onSource,
}: {
  item: CareItemView;
  records: readonly RecordView[];
  onSource: (id: string) => void;
}) {
  if (!item.evidence.length)
    return (
      <Notice
        title="유효한 근거가 없어요"
        body="삭제된 원문과 인용 내용은 다시 표시하지 않아요."
      />
    );
  return item.evidence.map((evidence) => {
    const record = records.find((entry) => entry.id === evidence.recordId);
    return record ? (
      <Source
        key={evidence.id}
        state="available"
        heading="소식에서 확인한 근거"
        meta={`${record.author.name} · ${formatRecordDate(record.createdAt)}`}
        quote={record.body}
        onViewOriginal={() => onSource(record.id)}
      />
    ) : evidence.directContent ? (
      <section
        key={evidence.id}
        className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20"
      >
        <h2 className="text-hm-heading-section">직접 확인한 근거</h2>
        <p className="text-hm-body-small text-hm-text-secondary">
          {evidence.author} · {formatRecordDate(evidence.createdAt)}
        </p>
        <p className="text-hm-body-reading whitespace-pre-wrap">
          {evidence.directContent}
        </p>
      </section>
    ) : (
      <Notice
        key={evidence.id}
        title="원본이 삭제됐어요"
        body="삭제된 원문과 인용 내용은 표시하지 않아요."
      />
    );
  });
}
