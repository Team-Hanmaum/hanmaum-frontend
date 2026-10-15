import { Notice } from "@/components/feedback";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { Source } from "@/features/record/ui/Source";
import type { ProposalView } from "../model/proposalViewTypes";

export function ProposalSources({
  proposals,
  records,
  onSource,
}: {
  proposals: readonly ProposalView[];
  records: readonly RecordView[];
  onSource: (id: string) => void;
}) {
  return [...new Set(proposals.map((proposal) => proposal.recordId))].map(
    (id) => {
      const record = records.find((item) => item.id === id);
      return record ? (
        <Source
          key={id}
          state="available"
          heading="변경을 제안한 근거"
          meta={`${record.author.name} · ${formatRecordDate(record.createdAt)}`}
          quote={record.body}
          onViewOriginal={() => onSource(id)}
        />
      ) : (
        <Notice
          key={id}
          tone="error"
          title="원본을 확인할 수 없어요"
          body="유효한 근거를 확인하기 전에는 반영할 수 없어요."
        />
      );
    },
  );
}
