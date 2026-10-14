import { useState } from "react";
import { BottomSheet, Notice } from "@/components/feedback";
import { Button, Icon } from "@/components/ui";
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
}) {
  const [sheet, setSheet] = useState<{
    kind: "current" | "future";
    proposal: ProposalView;
  } | null>(null);
  const current =
    sheet && data.items.find((item) => item.id === sheet.proposal.targetId);
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
            onViewSource={() => setSheet({ kind: "current", proposal })}
            onChangeTarget={() => setSheet({ kind: "future", proposal })}
            onEdit={() => setSheet({ kind: "future", proposal })}
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
      <BottomSheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
        title={
          sheet?.kind === "current" ? "현재 정보 · 근거" : "후속 화면 준비 중"
        }
      >
        {sheet?.kind === "current" ? (
          <div className="flex flex-col gap-hm-16">
            <h2 className="text-hm-heading-section">
              {current?.title ?? "현재 항목을 확인할 수 없어요"}
            </h2>
            <p className="text-hm-body-default">{current?.value}</p>
            <p className="text-hm-body-small text-hm-text-secondary">
              {current?.meta}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                const id = sheet.proposal.recordId;
                setSheet(null);
                onSource(id);
              }}
            >
              근거 소식 보기
            </Button>
          </div>
        ) : (
          <p className="text-hm-body-default text-hm-text-secondary">
            제안 내용 수정과 연결 대상 변경은 다음 작업에서 연결해요. 현재는
            준비된 제안을 선택해 요청·반영하는 Mock 흐름을 확인할 수 있어요.
          </p>
        )}
      </BottomSheet>
    </>
  );
}
