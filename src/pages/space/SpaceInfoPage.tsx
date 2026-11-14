import { Button, MenuRow } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useSpaceDetail } from "@/features/carespace/model/useSpaceDetail";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { ReviewQueryState } from "@/features/proposal/ui/ReviewQueryState";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import {
  spaceInfoPath,
  spaceInfoRequestsPath,
  spacePath,
} from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function SpaceInfoPage() {
  const { space } = useConnectedSpace();
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
      <h1 className="text-hm-title-page">
        지금 함께하는
        <br />
        돌봄 공간이에요
      </h1>
      {query.error && (
        <ReviewQueryState
          error={query.error}
          retry={() => void query.refetch()}
        />
      )}
      <FamilyInfoCard title="부모님 이름 또는 호칭">
        {space.subjectLabel}
      </FamilyInfoCard>
      <FamilyInfoCard title="공간 이름">
        {space.subjectLabel}의 돌봄
      </FamilyInfoCard>
      <FamilyInfoCard title="내 역할">
        {space.role === "OWNER" ? "소유자" : "구성원"} · 함께하는 가족{" "}
        {space.memberCount}명
      </FamilyInfoCard>
      <MenuRow
        icon="family-brand"
        title="함께하는 가족"
        onClick={go(spacePath(space.spaceId, "family"))}
      />
      <MenuRow
        icon="edit"
        title="공간 정보 수정 요청"
        onClick={go(spaceInfoRequestsPath(space.spaceId))}
      />
      <Notice
        title={
          space.role === "OWNER"
            ? "가족에게 함께 보이는 이름이에요"
            : "소유자가 확인한 뒤 바뀌어요"
        }
        body={
          space.role === "OWNER"
            ? "수정해도 소식과 돌봄 기록은 그대로예요."
            : "수정 요청만으로 현재 공간 정보가 바뀌지는 않아요."
        }
      />
    </AccountPageLayout>
  );
}
