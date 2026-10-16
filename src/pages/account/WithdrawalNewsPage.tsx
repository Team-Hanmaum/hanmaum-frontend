import { useNavigate } from "react-router";
import { Button, MenuRow } from "@/components/ui";
import { EmptyState, Notice } from "@/components/feedback";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { careSpaceName } from "@/features/carespace/model/careSpaceViewTypes";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { paths, spacePath } from "@/routes/paths";
export function WithdrawalNewsPage() {
  const { spaces } = useMockCareSpaces();
  const navigate = useNavigate();
  const back = () => void navigate(paths.withdrawal);
  return (
    <AccountPageLayout
      title="탈퇴 전 소식 확인"
      onBack={back}
      actions={<Button onClick={back}>탈퇴 절차로 돌아가기</Button>}
    >
      <h1 className="text-hm-title-page">
        소식을 확인할
        <br />
        공간을 선택해 주세요
      </h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        삭제할 소식이 있다면 탈퇴하기 전에 확인해 주세요.
      </p>
      {spaces.length ? (
        spaces.map((space) => (
          <MenuRow
            key={space.id}
            icon="news-brand"
            title={careSpaceName(space)}
            description="소식 확인하기"
            onClick={() =>
              void navigate(
                `${spacePath(space.id, "news")}?returnTo=withdrawal`,
              )
            }
          />
        ))
      ) : (
        <EmptyState
          title="참여 중인 공간이 없어요"
          body="확인할 소식이 없어요. 탈퇴 절차로 돌아가 주세요."
        />
      )}
      <Notice
        title="탈퇴와 소식 삭제는 별도예요"
        body="소식의 삭제 권한과 연결된 돌봄 정보의 영향을 기존 삭제 화면에서 확인해 주세요."
      />
    </AccountPageLayout>
  );
}
