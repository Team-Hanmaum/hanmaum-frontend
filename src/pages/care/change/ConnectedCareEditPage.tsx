import { useState } from "react";
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
  const unavailable = query.data && careWriteUnavailable(query.data, operation);
  if (query.data && !unavailable)
    return (
      <CareEditForm
        key={`${itemId}:${operation}:${revision}`}
        space={space}
        item={query.data}
        operation={operation}
        queryError={query.error}
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
      {unavailable ? (
        <EmptyState
          title="지금은 변경할 수 없어요"
          body={unavailable}
        />
      ) : (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      )}
    </ProposalPageLayout>
  );
}
