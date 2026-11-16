import { useId, useState } from "react";
import { Badge, Icon, SelectionRow, TextAction } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import {
  itemLabels,
  authorName,
  formatServerTime,
  readCareText,
} from "@/features/careitem/model/careReadView";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import type { ProposalDetail } from "../api/proposalReadTypes";
import type { ProposalDraft } from "../model/proposalDraft";
import { draftKeys } from "../model/proposalDraft";
import { actionLabels, proposalStatusLabels } from "../model/reviewLabels";
export function ProposalCard({
  proposal,
  draft,
  members,
  selected,
  selectionDisabled,
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
  selectionDisabled?: boolean;
  onSelect?: (checked: boolean) => void;
  onEdit?: () => void;
  onTarget?: () => void;
  onEvidence?: () => void;
  onRecord?: (id: string) => void;
  readonly?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const invalid = proposal.status === "INVALIDATED";
  const create = proposal.action === "CREATE_ITEM";
  const fallbackTitle = proposal.title ?? "내용이 제거된 제안";
  const title =
    !invalid && create && readonly
      ? (readCareText(draft.values.title) ?? fallbackTitle)
      : fallbackTitle;
  const kind = `${itemLabels[proposal.itemType]} · ${actionLabels[proposal.action]}`;
  const fields = draftKeys(proposal).filter((key) =>
    create
      ? !(
          (key === "title" && draft.values.title === title) ||
          (key === "description" &&
            draft.values.description === draft.values.title)
        )
      : (draft.values[key] ?? null) !== (draft.before[key] ?? null),
  );
  const selecting = Boolean(onSelect);
  return (
    <article
      className={`min-w-0 rounded-hm-14 border bg-hm-bg-surface wrap-anywhere ${selected ? "border-hm-border-focus" : "border-hm-divider-default"}`}
    >
      {onSelect ? (
        <div className="flex items-center gap-hm-4 px-hm-12 py-hm-4">
          <SelectionRow
            className="min-h-hm-touch-min flex-1 border-0 bg-transparent px-hm-4 py-hm-8"
            label={title}
            description={
              proposal.needsConflictReview ? `${kind} · 근거 비교 필요` : kind
            }
            checked={selected}
            disabled={
              selectionDisabled ||
              proposal.status !== "REVIEW_PENDING" ||
              !proposal.reviewToken
            }
            onChange={(e) => onSelect(e.target.checked)}
          />
          <TextAction
            className="shrink-0 gap-hm-4 px-hm-4 text-hm-text-brand hover:bg-hm-bg-brand-subtle"
            aria-label={`${title} 세부 정보`}
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded(!expanded)}
          >
            상세
            <span
              className={expanded ? "inline-flex rotate-180" : "inline-flex"}
            >
              <Icon name="chevron-down-secondary" />
            </span>
          </TextAction>
        </div>
      ) : (
        <header className="flex flex-col gap-hm-4 px-hm-16 pt-hm-16">
          <div className="flex flex-wrap items-center justify-between gap-hm-8">
            <p className="text-hm-caption-default text-hm-text-secondary">
              {kind}
            </p>
            {proposal.status !== "REVIEW_PENDING" && (
              <Badge label={proposalStatusLabels[proposal.status]} />
            )}
          </div>
          <h2 className="text-hm-heading-section">{title}</h2>
        </header>
      )}
      <div
        id={detailsId}
        hidden={selecting && !expanded}
      >
        <div
          className={`flex min-w-0 flex-col gap-hm-12 px-hm-16 pb-hm-16 ${selecting ? "border-t border-hm-divider-default pt-hm-12" : "pt-hm-8"}`}
        >
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
              ) : create ? (
                <CareFieldList
                  values={draft.values}
                  keys={fields}
                  members={members}
                />
              ) : (
                fields.length > 0 && (
                  <CareValuesView
                    values={draft.values}
                    before={draft.before}
                    keys={fields}
                    members={members}
                  />
                )
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
                    <TextAction
                      className="self-start text-hm-text-brand"
                      onClick={() => onRecord(e.recordId)}
                    >
                      소식 원본 보기
                    </TextAction>
                  )}
                </section>
              ))}
              {(onEvidence || onTarget || onEdit) && (
                <div className="flex flex-wrap gap-x-hm-8">
                  {onEvidence && (
                    <TextAction
                      className="px-hm-8 text-hm-text-brand"
                      onClick={onEvidence}
                    >
                      근거 비교
                    </TextAction>
                  )}
                  {!readonly &&
                    onTarget &&
                    proposal.action !== "CREATE_ITEM" &&
                    !proposal.targetItemId && (
                      <TextAction
                        className="px-hm-8 text-hm-text-brand"
                        onClick={onTarget}
                      >
                        {draft.targetItemId
                          ? "연결 대상 다시 선택"
                          : "대상 선택"}
                      </TextAction>
                    )}
                  {!readonly &&
                    onEdit &&
                    proposal.action !== "LINK_EVIDENCE" && (
                      <TextAction
                        className="px-hm-8 text-hm-text-brand"
                        onClick={onEdit}
                      >
                        제안 내용 수정
                      </TextAction>
                    )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
