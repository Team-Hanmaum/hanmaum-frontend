import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext, useSearchParams } from "react-router";
import { EmptyState, Notice } from "@/components/feedback";
import { MenuRow, Tabs } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { careChangeTitle } from "@/features/careitem/model/careChangeRules";
import { formatRecordDate } from "@/features/record/model/recordDates";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careChangePath, careListPath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

const filters = [
  { value: "requested", label: "확인 중" },
  { value: "applied", label: "반영됨" },
  { value: "rejected", label: "미적용" },
] as const;
export function CareRequestsPage() {
  const space = useOutletContext<CareSpaceView>();
  const data = useMockProposals(space);
  const [params, setParams] = useSearchParams();
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const onBack = useBackNavigation(withReturn(careListPath(space.id)));
  const status =
    filters.find((entry) => entry.value === params.get("status"))?.value ??
    "requested";
  const self = space.members.find((member) => member.self);
  const changes = (data.careChanges ?? [])
    .filter(
      (change) =>
        change.status === status &&
        (space.role === "owner" ||
          change.author.id === self?.id ||
          change.status === "applied") &&
        (!params.get("item") || change.draft.itemId === params.get("item")),
    )
    .sort(
      (a, b) => (b.decidedAt ?? b.createdAt) - (a.decidedAt ?? a.createdAt),
    );
  const content = (
    <div className="flex flex-col gap-hm-16">
      {" "}
      {changes.map((change) => (
        <MenuRow
          key={change.id}
          icon="news-brand"
          title={
            change.redacted
              ? "원본이 삭제된 요청·변경"
              : careChangeTitle(change.draft)
          }
          description={`${change.author.name} · ${formatRecordDate(change.decidedAt ?? change.createdAt)}`}
          onClick={() =>
            void navigate(withReturn(careChangePath(space.id, change.id)))
          }
        />
      ))}
      {!changes.length && (
        <EmptyState
          title="아직 해당하는 내용이 없어요"
          body="항목을 추가하거나 변경하면 이곳에서 요청과 결과를 확인할 수 있어요."
        />
      )}
    </div>
  );
  return (
    <ProposalPageLayout
      title="돌봄 요청·변경"
      spaceId={space.id}
      onBack={onBack}
      tabs
      activeTab="care"
    >
      <h1 className="text-hm-title-page">
        {space.role === "owner"
          ? "가족의 요청을 확인해 주세요"
          : "내 요청은 어떻게 되었나요?"}
      </h1>
      <Notice
        title="확인 중인 요청은 현재 정보와 달라요"
        body="소유자가 최종 반영한 뒤 돌봄 목록과 홈이 함께 바뀌어요. 내가 담당한 할 일의 상태는 직접 바꿀 수 있어요."
      />
      <Tabs
        items={filters.map((filter) => ({
          ...filter,
          content: filter.value === status ? content : null,
        }))}
        value={status}
        onValueChange={(value) =>
          void setParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set("status", value);
            return next;
          })
        }
        label="돌봄 요청 상태"
      />
    </ProposalPageLayout>
  );
}
