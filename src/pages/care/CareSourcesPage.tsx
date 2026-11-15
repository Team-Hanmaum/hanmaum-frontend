import { useParams } from "react-router";
import { CareEvidenceList } from "@/features/careitem/ui/CareEvidenceList";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { careItemPath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function CareSourcesPage() {
  const { space } = useSpaceContext();
  const { itemId = "" } = useParams();
  const { withReturn } = useWithdrawalReturn();
  const back = useBackNavigation(
    withReturn(careItemPath(space.spaceId, itemId)),
  );
  return (
    <ProposalPageLayout
      title="근거 보기"
      spaceId={space.spaceId}
      onBack={back}
    >
      <h1 className="text-hm-title-page">돌봄 정보의 근거</h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        기록할 때 참고한 자료라 현재 내용과 다를 수 있어요.
      </p>
      <CareEvidenceList
        spaceId={space.spaceId}
        itemId={itemId}
      />
    </ProposalPageLayout>
  );
}
