import { useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import {
  Button,
  Comparison,
  MenuRow,
  SelectionRow,
  TextAction,
} from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import {
  retargetProposal,
  isConfirmedQuestionChange,
} from "@/features/proposal/model/proposalDrafts";
import { useMockRecords } from "@/features/record/model/useMockRecords";
import { ProposalSources } from "@/features/proposal/ui/ProposalSources";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import {
  careItemPath,
  newsDetailPath,
  proposalListPath,
  proposalReviewPath,
} from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";
const states = [
  { value: "default", label: "기본" },
  { value: "empty", label: "후보 없음" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "조회 실패" },
  { value: "invalid", label: "대상 유효하지 않음" },
] as const;
export function ProposalTargetPage() {
  const space = useOutletContext<CareSpaceView>();
  const { proposalId } = useParams();
  const data = useMockProposals(space);
  const records = useMockRecords(space);
  const proposal = data.proposals.find(
    (item) =>
      item.id === proposalId &&
      item.status === "review" &&
      item.operation !== "create" &&
      !item.sourceDeleted,
  );
  const [params, setParams] = useSearchParams();
  const selected = params.get("target") ?? "";
  const compare = params.get("view") === "compare";
  function selectTarget(id: string) {
    void setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("target", id);
        next.delete("view");
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }
  function setCompare(value: boolean) {
    void setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set("view", "compare");
        else next.delete("view");
        return next;
      },
      { replace: true },
    );
  }
  const [error, setError] = useState(false);
  const [state] = useMockScreenState(states, "default");
  function setState(value: string) {
    setError(false);
    // 두 번 탐색하면 이전 쿼리가 비교 화면을 되살리므로 한 번에 초기화한다.
    void setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("mockState", value);
        next.delete("view");
        return next;
      },
      { replace: true },
    );
  }
  const navigate = useNavigate();
  const back = () =>
    void navigate(
      proposal
        ? proposalReviewPath(space.id, proposal.recordId)
        : proposalListPath(space.id),
    );
  const candidates = data.items.filter(
    (item) =>
      proposal &&
      item.kind === proposal.kind &&
      !item.deletedAt &&
      !item.needsReconfirmation &&
      !isConfirmedQuestionChange(proposal, item),
  );
  const target = candidates.find((item) => item.id === selected);
  const projected =
    proposal && target ? retargetProposal(proposal, target, space) : undefined;
  function confirm() {
    if (!proposal || !target) return;
    const result = mockProposals.revise(
      space,
      proposal.id,
      proposal.revision ?? 0,
      { targetId: target.id },
    );
    if (result.ok) back();
    else setError(true);
  }
  const ready =
    state === "default" && proposal && !error && (!compare || target);
  return (
    <ProposalPageLayout
      title={compare ? "연결 대상 확인" : "연결 대상 선택"}
      spaceId={space.id}
      onBack={() => (compare ? setCompare(false) : back())}
      preview={{
        value: state,
        options: states,
        onChange: setState,
      }}
      actions={
        ready && (
          <>
            <Button
              disabled={!target}
              onClick={() => (compare ? confirm() : setCompare(true))}
            >
              {compare ? "이 대상으로 검토 계속" : "선택한 대상 비교"}
            </Button>
            <TextAction onClick={() => (compare ? setCompare(false) : back())}>
              {compare ? "다른 대상 고르기" : "맞는 항목이 없거나 모르겠어요"}
            </TextAction>
          </>
        )
      }
    >
      {!proposal ? (
        <EmptyState
          title="연결할 제안을 확인할 수 없어요"
          body="이미 요청·처리됐거나 근거가 삭제된 제안이에요."
          action={{ label: "확인할 내용으로", onClick: back }}
        />
      ) : state === "loading" ? (
        <LoadingState label="연결 후보를 불러오고 있어요" />
      ) : state === "error" ? (
        <ErrorState
          reason="load-error"
          onAction={() => setState("default")}
        />
      ) : state === "invalid" || error || (compare && !target) ? (
        <EmptyState
          title="대상을 다시 확인해 주세요"
          body="선택한 항목을 더 이상 연결할 수 없어요. 아직 반영되지 않았어요."
          action={{
            label: "후보 다시 확인",
            onClick: () => setState("default"),
          }}
        />
      ) : state === "empty" || !candidates.length ? (
        <EmptyState
          title="연결할 후보가 없어요"
          body="맞는 항목을 확인할 때까지 제안을 검토 대기로 남겨요."
          action={{ label: "지금은 보류하기", onClick: back }}
        />
      ) : compare && target && projected ? (
        <>
          <h1 className="text-hm-title-page">이 항목에 대한 소식이 맞나요?</h1>
          <section className="flex flex-col gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20">
            <h2 className="text-hm-heading-section">선택한 대상</h2>
            <p className="text-hm-body-default">
              {target.title}
              <br />
              {target.value} · {target.meta}
            </p>
          </section>
          <MenuRow
            icon="link-brand"
            title="현재 항목의 근거·이력"
            onClick={() => void navigate(careItemPath(space.id, target.id))}
          />
          <Comparison
            beforeLabel="현재 내용"
            beforeValue={target.value}
            afterLabel={
              proposal.operation === "link"
                ? "연결 후 · 값 유지"
                : "반영할 제안"
            }
            afterValue={projected.afterValue}
          />
          <p className="text-hm-body-small whitespace-pre-wrap text-hm-text-secondary">
            {projected.context}
          </p>
          <ProposalSources
            proposals={[proposal]}
            records={records}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
          />
        </>
      ) : (
        <>
          <h1 className="text-hm-title-page">어떤 항목을 말하는 걸까요?</h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            이름과 내용을 보고 하나를 골라 주세요.
          </p>
          <ProposalSources
            proposals={[proposal]}
            records={records}
            onSource={(id) => void navigate(newsDetailPath(space.id, id))}
          />
          {candidates.map((item) => (
            <SelectionRow
              key={item.id}
              control="radio"
              name="target"
              label={item.title}
              description={`${item.value} · ${item.meta}`}
              checked={selected === item.id}
              onChange={() => selectTarget(item.id)}
            />
          ))}
          <Notice
            title="선택만으로 현재 정보가 바뀌지 않아요"
            body="대상을 고른 뒤 비교하고 검토를 계속해 주세요."
          />
        </>
      )}
    </ProposalPageLayout>
  );
}
