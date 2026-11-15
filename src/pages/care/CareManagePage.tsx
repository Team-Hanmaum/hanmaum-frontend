import { useState } from "react";
import { useParams } from "react-router";
import { Badge, Button, MenuRow } from "@/components/ui";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import {
  canChangeDirectly,
  careWriteUnavailable,
  itemStatusChoices,
} from "@/features/careitem/model/careEditDraft";
import {
  careItemTitle,
  displayCareValue,
} from "@/features/careitem/model/careReadView";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import { CareReconfirmationMetadata } from "@/features/careitem/ui/CareReconfirmationMetadata";
import { CareStatusDialog } from "@/features/careitem/ui/CareStatusDialog";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath, proposalRequestPath } from "@/routes/paths";

const actions = [
  { operation: "edit", label: "내용 수정" },
  { operation: "assignee", label: "담당자 변경" },
  { operation: "answer", label: "답변 남기기" },
  { operation: "delete", label: "항목 삭제" },
] as const;

export function CareManagePage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const query = useCareItem(space.spaceId, itemId);
  const item = query.data;
  const [statusChange, setStatusChange] = useState<{
    itemId: string;
    status: string;
  }>();
  const [savedItemId, setSavedItemId] = useState("");
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const base = careItemPath(space.spaceId, itemId);
  const back = useBackNavigation(withReturn(base));
  const availableActions = item
    ? actions.filter(({ operation }) => !careWriteUnavailable(item, operation))
    : [];
  const statusChoices =
    item && !careWriteUnavailable(item, "status")
      ? itemStatusChoices(item)
      : [];
  return (
    <ProposalPageLayout
      title="항목 관리"
      spaceId={space.spaceId}
      onBack={back}
    >
      {!item || query.isError ? (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      ) : (
        <>
          <div className="flex flex-col gap-hm-8">
            <h1 className="text-hm-title-page wrap-anywhere">
              {careItemTitle(item)}
            </h1>
            {item.needsReconfirmation && (
              <CareReconfirmationMetadata item={item} />
            )}
            {item.status && !item.needsReconfirmation && (
              <p className="flex flex-wrap items-center gap-hm-8 text-hm-body-small text-hm-text-secondary">
                현재 상태
                <Badge
                  label={displayCareValue("status", item.status)}
                  tone="brand"
                  className="rounded-hm-full px-hm-12 text-hm-body-small font-bold"
                />
              </p>
            )}
            <CareFieldList
              values={item}
              keys={["description"]}
            />
          </div>
          {item.needsReconfirmation && (
            <p className="text-hm-body-small text-hm-text-secondary">
              원본을 바탕으로 기록한 정보가 가려졌어요. 재확인은 항목 상세에서
              진행할 수 있어요.
            </p>
          )}
          {savedItemId === itemId && (
            <p
              role="status"
              className="text-hm-body-small text-hm-text-brand"
            >
              상태가 변경됐어요.
            </p>
          )}
          {statusChoices.length > 0 && (
            <section className="flex flex-col gap-hm-8">
              <h2 className="text-hm-heading-section">
                {canChangeDirectly(space, item, "status")
                  ? "상태 변경"
                  : "상태 변경 요청"}
              </h2>
              <div className="flex flex-wrap gap-hm-8">
                {statusChoices.map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    className="min-h-hm-touch-min rounded-hm-full px-hm-16 py-hm-8"
                    onClick={() => {
                      setSavedItemId("");
                      setStatusChange({ itemId, status });
                    }}
                  >
                    {status === "CANCELED"
                      ? "취소 처리"
                      : displayCareValue("status", status)}
                  </Button>
                ))}
              </div>
            </section>
          )}
          {availableActions.length > 0 && (
            <div className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
              {availableActions.map(({ operation, label }) => (
                <MenuRow
                  key={operation}
                  icon={null}
                  tone={operation === "delete" ? "danger" : "default"}
                  className="min-h-hm-touch-min rounded-none px-hm-16 py-hm-12 first:rounded-t-hm-16 last:rounded-b-hm-16 hover:bg-hm-bg-subtle"
                  title={`${label}${operation === "answer" || canChangeDirectly(space, item, operation) ? "" : " 요청"}`}
                  onClick={() =>
                    void navigate(withReturn(`${base}/${operation}`))
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
      {item && statusChange?.itemId === itemId && (
        <CareStatusDialog
          key={itemId}
          space={space}
          item={item}
          status={statusChange.status}
          queryError={query.error}
          onClose={() => setStatusChange(undefined)}
          onComplete={(requestId) => {
            setStatusChange(undefined);
            if (requestId)
              void navigate(
                withReturn(proposalRequestPath(space.spaceId, requestId)),
              );
            else setSavedItemId(itemId);
          }}
        />
      )}
    </ProposalPageLayout>
  );
}
