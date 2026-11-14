import { useState, type ComponentProps } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui";
import { EmptyState } from "@/components/feedback";
import { useCareItem } from "@/features/careitem/model/useCareQueries";
import { CareReconfirmationForm } from "@/features/careitem/ui/CareReconfirmationForm";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";
import { careItemPath } from "@/routes/paths";

export function ConnectedCareReconfirmPage() {
  const { space } = useConnectedSpace();
  const { itemId = "" } = useParams();
  const query = useCareItem(space.spaceId, itemId);
  const [revision, setRevision] = useState(0);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const back = () =>
    void navigate(withReturn(careItemPath(space.spaceId, itemId)), {
      motion: "back",
    });
  if (space.role === "OWNER" && query.data)
    return (
      <ReconfirmationEntry
        key={`${itemId}:${revision}`}
        space={space}
        item={query.data}
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
      title="다시 확인하기"
      spaceId={space.spaceId}
      onBack={back}
      actions={<Button onClick={back}>항목 상세로</Button>}
    >
      {space.role !== "OWNER" ? (
        <EmptyState
          title="소유자가 다시 확인할 항목이에요"
          body="구성원은 근거와 현재 상태를 확인할 수 있어요. 최종 재확인은 소유자가 진행해요."
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
function ReconfirmationEntry(
  props: ComponentProps<typeof CareReconfirmationForm> & { onBack: () => void },
) {
  const eligible =
    props.item.needsReconfirmation && props.item.visibility !== "DELETED";
  const [opened, setOpened] = useState(eligible);
  if (!opened && eligible) setOpened(true);
  // 열린 폼은 재조회 오류/변경으로 언마운트하지 않고, 저장 차단과 명시적 재시작을 제공한다.
  if (opened || eligible) return <CareReconfirmationForm {...props} />;
  return (
    <ProposalPageLayout
      title="다시 확인하기"
      spaceId={props.space.spaceId}
      onBack={props.onBack}
      actions={<Button onClick={props.onBack}>항목 상세로</Button>}
    >
      <EmptyState
        title="재확인이 필요한 항목이 아니에요"
        body="현재 상태와 변경 이력을 확인해 주세요."
      />
    </ProposalPageLayout>
  );
}
