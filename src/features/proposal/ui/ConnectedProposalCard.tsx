import { Badge, Button, SelectionRow, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import {
  itemLabels,
  authorName,
  formatServerTime,
} from "@/features/careitem/model/careReadView";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import type { ProposalDetail } from "../api/proposalReadTypes";
import type { ProposalDraft } from "../model/proposalDraft";
import { draftKeys } from "../model/proposalDraft";
import { actionLabels, proposalStatusLabels } from "../model/reviewLabels";
export function ConnectedProposalCard({
  proposal,
  draft,
  members,
  selected,
  onSelect,
  onEdit,
  onTarget,
  onEvidence,
  onRecord,
  readonly = false,
}: {
  proposal: ProposalDetail;
  draft: ProposalDraft;
  members?: SpaceMember[];
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onEdit?: () => void;
  onTarget?: () => void;
  onEvidence?: () => void;
  onRecord?: (id: string) => void;
  readonly?: boolean;
}) {
  const invalid = proposal.status === "INVALIDATED";
  return (
    <article className="flex min-w-0 flex-col gap-hm-16 rounded-hm-14 bg-hm-bg-surface p-hm-20 wrap-anywhere">
      <Badge
        label={`${itemLabels[proposal.itemType]} · ${actionLabels[proposal.action]}`}
      />
      {onSelect ? (
        <SelectionRow
          label={proposal.title ?? "내용이 제거된 제안"}
          checked={selected}
          disabled={invalid || !proposal.reviewToken}
          onChange={(e) => onSelect(e.target.checked)}
        />
      ) : (
        <h2 className="text-hm-heading-section">
          {proposal.title ?? "내용이 제거된 제안"}
        </h2>
      )}
      {invalid ? (
        <Notice
          tone="neutral"
          title="이 제안은 검토할 수 없어요"
          body="원본이 삭제되었거나 유효하지 않은 제안이에요. 제거된 내용은 표시하지 않아요."
        />
      ) : (
        <>
          {proposal.needsConflictReview && (
            <Notice
              title="서로 다른 내용이 있어요"
              body="근거와 현재 정보를 비교한 뒤 선택해 주세요."
            />
          )}
          {proposal.action === "LINK_EVIDENCE" ? (
            <p className="text-hm-body-default">
              현재 내용은 유지하고 소식 근거만 연결해요.
            </p>
          ) : (
            <CareValuesView
              values={draft.values}
              before={
                proposal.action === "CREATE_ITEM" ? undefined : draft.before
              }
              keys={draftKeys(proposal).filter(
                (key) =>
                  proposal.action === "CREATE_ITEM" ||
                  (draft.values[key] ?? null) !== (draft.before[key] ?? null),
              )}
              members={members}
            />
          )}
          {proposal.clearFields.length > 0 && (
            <Notice
              tone="neutral"
              title="지워지는 정보가 있어요"
              body="변경 후 미정으로 표시된 항목을 확인해 주세요."
            />
          )}
          {proposal.evidence.map((e) => (
            <section
              key={e.evidenceId}
              className="flex flex-col gap-hm-8 border-t border-hm-divider-default pt-hm-16"
            >
              <p className="text-hm-caption-default">
                {authorName(e.author)} · {formatServerTime(e.recordedAt)}
              </p>
              <p className="text-hm-body-default whitespace-pre-wrap">
                {e.valid ? e.quote : "제거된 근거"}
              </p>
              {e.valid && onRecord && (
                <TextAction onClick={() => onRecord(e.recordId)}>
                  소식 원본 보기
                </TextAction>
              )}
            </section>
          ))}
          <div className="flex flex-wrap gap-hm-16">
            {onEvidence && (
              <TextAction onClick={onEvidence}>근거 비교</TextAction>
            )}
            {!readonly &&
              onTarget &&
              proposal.action !== "CREATE_ITEM" &&
              !proposal.targetItemId && (
                <TextAction onClick={onTarget}>
                  {draft.targetItemId ? "연결 대상 다시 선택" : "대상 선택"}
                </TextAction>
              )}
          </div>
          {!readonly && onEdit && proposal.action !== "LINK_EVIDENCE" && (
            <Button
              variant="secondary"
              onClick={onEdit}
            >
              제안 내용 수정
            </Button>
          )}
        </>
      )}
      {readonly && <Badge label={proposalStatusLabels[proposal.status]} />}
    </article>
  );
}
