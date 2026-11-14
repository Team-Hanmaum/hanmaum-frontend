import { useState } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button, SelectionRow } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import { getCareItem } from "@/features/careitem/api/careReadApi";
import { careKeys } from "@/features/careitem/model/useCareQueries";
import { useSession } from "@/features/auth/model/useSession";
import { useProposal } from "@/features/proposal/model/useProposalQueries";
import { useProposalDrafts } from "@/features/proposal/model/useProposalDrafts";
import { initialProposalDraft } from "@/features/proposal/model/proposalDraft";
import { reviewFailure } from "@/features/proposal/model/reviewFailure";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { proposalListPath } from "@/routes/paths";
export function ConnectedProposalTargetPage() {
  const { space } = useConnectedSpace();
  const { proposalId = "" } = useParams();
  const query = useProposal(space.spaceId, proposalId);
  const { save } = useProposalDrafts(space.spaceId);
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(withReturn(proposalListPath(space.spaceId)));
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const client = useQueryClient();
  const session = useSession();
  async function choose() {
    if (
      !query.data ||
      !query.data.reviewToken ||
      busy ||
      !query.data.candidates.some((c) => c.itemId === selected)
    )
      return;
    setBusy(true);
    setError("");
    try {
      const item = await getCareItem(space.spaceId, selected);
      if (item.itemType !== query.data.itemType || item.redactedFields.length)
        throw new Error("선택한 대상의 내용을 확인할 수 없어요.");
      client.setQueryData(
        careKeys.detail(session.accountId, space.spaceId, selected),
        item,
      );
      save(proposalId, initialProposalDraft(query.data, item));
      back();
    } catch (e) {
      setError(reviewFailure(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <ProposalPageLayout
      title="연결 대상 선택"
      spaceId={space.spaceId}
      onBack={back}
      actions={
        <Button
          disabled={!selected || query.isError || !query.data?.reviewToken}
          loading={busy}
          onClick={() => void choose()}
        >
          이 대상으로 선택
        </Button>
      }
    >
      <h1 className="text-hm-title-page">어느 돌봄 정보에 연결할까요?</h1>
      <Notice
        title="제안에 포함된 후보만 선택해요"
        body="현재 정보와 비교한 뒤 변경 내용을 다시 확인해 주세요. 대상을 바꾸면 이전 수정 초안은 초기화돼요."
      />
      {error && (
        <Notice
          tone="error"
          title="대상을 선택하지 못했어요"
          body={error}
        />
      )}
      {!query.data || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : query.data.candidates.length ? (
        query.data.candidates.map((c) => (
          <SelectionRow
            key={c.itemId}
            control="radio"
            name="target"
            label={c.title ?? "제목 없는 항목"}
            checked={selected === c.itemId}
            onChange={() => setSelected(c.itemId)}
            disabled={busy || !!query.data?.targetItemId}
          />
        ))
      ) : (
        <EmptyState
          title="선택할 후보가 없어요"
          body="대상을 임의로 만들거나 연결하지 않아요. 이 제안은 나중에 다시 확인해 주세요."
        />
      )}
    </ProposalPageLayout>
  );
}
