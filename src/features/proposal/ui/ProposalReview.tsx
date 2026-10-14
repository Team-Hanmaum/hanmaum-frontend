import { Notice } from "@/components/feedback";
import { Icon } from "@/components/ui";
import type { RecordView } from "@/features/record/model/recordViewTypes";
import type {
  ProposalSelection,
  ProposalSpaceState,
  ProposalView,
} from "../model/proposalViewTypes";
import { Proposal } from "./Proposal";
import { ProposalSources } from "./ProposalSources";

export function ProposalReview({
  subjectLabel,
  owner,
  proposals,
  data,
  records,
  selected,
  onSelect,
  onSource,
  busy,
  requestError,
  onEdit,
  onTarget,
  onCompare,
}: {
  subjectLabel: string;
  owner: boolean;
  proposals: readonly ProposalView[];
  data: ProposalSpaceState;
  records: readonly RecordView[];
  selected: readonly ProposalSelection[];
  onSelect: (id: string, selected: boolean) => void;
  onSource: (id: string) => void;
  busy: boolean;
  requestError: boolean;
  onEdit?: (id: string) => void;
  onTarget?: (id: string) => void;
  onCompare?: (id: string) => void;
}) {
  return (
    <>
      {requestError && (
        <Notice
          role="alert"
          tone="error"
          title="반영을 요청하지 못했어요"
          body="선택한 내용은 그대로 있어요. 연결 상태를 확인한 뒤 다시 시도해 주세요."
        />
      )}
      <div className="flex flex-col gap-hm-12">
        <p className="text-hm-body-small text-hm-text-secondary">
          {subjectLabel}의 돌봄
        </p>
        <h1 className="text-hm-title-page">무엇을 반영할까요?</h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          현재 정보와 근거를 확인한 뒤<br />
          반영할 제안을 선택해 주세요.
        </p>
      </div>
      {proposals.map((proposal) => {
        const item = data.items.find((entry) => entry.id === proposal.targetId);
        return (
          <Proposal
            key={proposal.id}
            title={proposal.title}
            badgeLabel={proposal.typeLabel}
            context={proposal.context}
            comparison={{
              beforeLabel: proposal.beforeLabel,
              beforeValue: item?.value ?? proposal.beforeValue,
              afterLabel: proposal.afterLabel,
              afterValue: proposal.afterValue,
            }}
            selected={selected.some((entry) => entry.id === proposal.id)}
            onSelectedChange={(checked) => onSelect(proposal.id, checked)}
            disabled={busy}
            onViewSource={
              item && onCompare ? () => onCompare(proposal.id) : undefined
            }
            onChangeTarget={
              onTarget && proposal.operation !== "create"
                ? () => onTarget(proposal.id)
                : undefined
            }
            onEdit={
              onEdit && proposal.operation !== "link"
                ? () => onEdit(proposal.id)
                : undefined
            }
          />
        );
      })}
      <ProposalSources
        proposals={proposals}
        records={records}
        onSource={onSource}
      />
      <Notice
        title={owner ? "확인한 내용만 반영해요" : "현재 돌봄 정보는 그대로예요"}
        body={
          owner
            ? "선택한 제안은 반영 전 확인을 거쳐 현재 돌봄 정보에 반영할 수 있어요."
            : "선택한 내용은 소유자에게 요청돼요. 최종 반영 전까지 현재 정보는 유지돼요."
        }
      />
      <p
        className="flex items-center gap-hm-8 text-hm-body-small text-hm-text-brand"
        aria-live="polite"
      >
        {selected.length > 0 && <Icon name="check" />}선택한 제안{" "}
        {selected.length}건
      </p>
      {selected.length === 0 && (
        <p className="text-hm-body-small text-hm-text-secondary">
          {owner ? "반영할" : "요청할"} 제안을 선택해 주세요.
        </p>
      )}
    </>
  );
}
