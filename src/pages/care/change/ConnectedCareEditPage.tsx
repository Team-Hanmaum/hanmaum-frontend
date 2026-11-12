import { useState, type ComponentProps } from "react";
import { useMatches, useParams } from "react-router";
import { EmptyState } from "@/components/feedback";
import { Button } from "@/components/ui";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import { careWriteUnavailable } from "@/features/careitem/model/careEditDraft";
import { CareEditForm } from "@/features/careitem/ui/CareEditForm";
import type { EditOperation } from "@/features/careitem/model/useCareEdit";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath } from "@/routes/paths";

export function ConnectedCareEditPage() {
  const { space } = useConnectedSpace();
  const { itemId = "" } = useParams();
  const query = useCareItem(space.spaceId, itemId);
  const matches = useMatches();
  const operation = (matches.at(-1)?.handle as { operation: EditOperation })
    .operation;
  const [revision, setRevision] = useState(0);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const back = () =>
    void navigate(withReturn(careItemPath(space.spaceId, itemId)), {
      motion: "back",
    });
  if (query.data)
    return (
      <CareEditEntry
        key={`${itemId}:${operation}:${revision}`}
        space={space}
        item={query.data}
        operation={operation}
        queryError={query.error}
        onBack={back}
        reload={() =>
          void query.refetch().then((result) => {
            if (!result.error) setRevision((value) => value + 1);
          })
        }
      />
    );
  return (
    <ProposalPageLayout
      connected
      title="돌봄 변경"
      spaceId={space.spaceId}
      onBack={back}
      actions={<Button onClick={back}>항목 상세로</Button>}
    >
      <ReviewQueryState
        error={query.error}
        retry={() => void query.refetch()}
      />
    </ProposalPageLayout>
  );
}

function CareEditEntry({
  onBack,
  ...props
}: ComponentProps<typeof CareEditForm> & { onBack: () => void }) {
  // 차단 중에는 최신 상태를 확인하되, 한 번 열린 폼은 재조회로 해제하지 않는다.
  const [unavailable, setUnavailable] = useState(() =>
    careWriteUnavailable(props.item, props.operation),
  );
  const currentUnavailable =
    unavailable && props.operation !== "delete"
      ? careWriteUnavailable(props.item, props.operation)
      : unavailable;
  if (unavailable && !currentUnavailable) setUnavailable("");
  return currentUnavailable ? (
    <ProposalPageLayout
      connected
      title="돌봄 변경"
      spaceId={props.space.spaceId}
      onBack={onBack}
      actions={<Button onClick={onBack}>항목 상세로</Button>}
    >
      <EmptyState
        title="지금은 변경할 수 없어요"
        body={currentUnavailable}
      />
    </ProposalPageLayout>
  ) : (
    <CareEditForm {...props} />
  );
}
