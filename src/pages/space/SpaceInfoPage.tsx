import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext } from "react-router";
import { Button, MenuRow } from "@/components/ui";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { FamilyInfoCard } from "@/features/carespace/ui/FamilyInfoCard";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import {
  spaceInfoPath,
  spaceInfoRequestsPath,
  spacePath,
} from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";
const states = [
  { value: "default", label: "기본" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "조회 오류" },
  { value: "forbidden", label: "접근 불가" },
] as const;
export function SpaceInfoPage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(spacePath(space.id, "all"));
  const [state, setState] = useMockScreenState(states, "default");
  return (
    <AccountPageLayout
      title="공간 정보"
      onBack={onBack}
      spaceId={space.id}
      preview={{ value: state, options: states, onChange: setState }}
      actions={
        state === "default" && (
          <Button
            onClick={() => void navigate(`${spaceInfoPath(space.id)}/edit`)}
          >
            {space.role === "owner" ? "정보 수정" : "수정 요청 작성"}
          </Button>
        )
      }
    >
      {state === "loading" ? (
        <LoadingState label="공간 정보를 불러오고 있어요" />
      ) : state !== "default" ? (
        <ErrorState
          reason={state === "forbidden" ? "no-permission" : "load-error"}
          onAction={() => setState("default")}
          actionLabel="다시 확인"
        />
      ) : (
        <>
          <h1 className="text-hm-title-page">
            지금 함께하는
            <br />
            돌봄 공간이에요
          </h1>
          <FamilyInfoCard title="부모님 이름 또는 호칭">
            {space.subjectLabel}
          </FamilyInfoCard>
          <FamilyInfoCard title="공간 이름">
            {careSpaceName(space)}
          </FamilyInfoCard>
          <FamilyInfoCard title="내 역할">
            {space.role === "owner" ? "소유자" : "구성원"} · 함께하는 가족{" "}
            {space.members.length}명
          </FamilyInfoCard>
          <MenuRow
            icon="family-brand"
            title="함께하는 가족"
            onClick={() => void navigate(spacePath(space.id, "family"))}
          />
          <MenuRow
            icon="edit"
            title="공간 정보 요청·변경"
            onClick={() => void navigate(spaceInfoRequestsPath(space.id))}
          />
          <Notice
            title={
              space.role === "owner"
                ? "가족에게 함께 보이는 이름이에요"
                : "소유자가 확인한 뒤 바뀌어요"
            }
            body={
              space.role === "owner"
                ? "수정해도 소식과 돌봄 기록은 그대로예요."
                : "수정 요청만으로 현재 공간 정보가 바뀌지는 않아요."
            }
          />
        </>
      )}
    </AccountPageLayout>
  );
}
