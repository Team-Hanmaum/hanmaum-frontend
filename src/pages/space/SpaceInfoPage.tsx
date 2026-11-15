import { Badge, Button } from "@/components/ui";
import { MenuGroup } from "@/components/layout/MenuGroup";
import { Notice } from "@/components/feedback";
import { useSpaceDetail } from "@/features/carespace/model/useSpaceDetail";
import { careSpaceName } from "@/features/carespace/model/careSpaceViewTypes";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import {
  spaceInfoPath,
  spaceInfoRequestsPath,
  spacePath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function SpaceInfoPage() {
  const { space } = useSpaceContext();
  const query = useSpaceDetail(space.spaceId);
  const navigate = useAppNavigate();
  const { withReturn } = useWithdrawalReturn();
  const onBack = useBackNavigation(withReturn(spacePath(space.spaceId, "all")));
  const go = (path: string) => () => void navigate(withReturn(path));
  return (
    <AccountPageLayout
      title="공간 정보"
      onBack={onBack}
      spaceId={space.spaceId}
      actions={
        <Button
          disabled={!!query.error}
          onClick={go(`${spaceInfoPath(space.spaceId)}/edit`)}
        >
          {space.role === "OWNER" ? "정보 수정" : "수정 요청 작성"}
        </Button>
      }
    >
      <div className="flex flex-col gap-hm-8">
        <h1 className="text-hm-title-page wrap-anywhere">
          {careSpaceName(space)}
        </h1>
        <div className="flex items-center gap-hm-8">
          <Badge
            label={space.role === "OWNER" ? "소유자" : "구성원"}
            tone="brand"
          />
          <p className="text-hm-body-small text-hm-text-secondary">
            함께하는 가족 {space.memberCount}명
          </p>
        </div>
      </div>
      {query.error && (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      )}
      <MenuGroup
        items={[
          {
            icon: "family-brand",
            title: "함께하는 가족",
            onClick: go(spacePath(space.spaceId, "family")),
          },
          {
            icon: "edit",
            title: "공간 정보 수정 요청",
            onClick: go(spaceInfoRequestsPath(space.spaceId)),
          },
        ]}
      />
      {space.role !== "OWNER" && (
        <Notice
          title="소유자가 확인한 뒤 바뀌어요"
          body="수정 요청을 보내면 소유자가 검토한 뒤 공간 이름에 반영해요."
        />
      )}
    </AccountPageLayout>
  );
}
