import { useAppNavigate } from "@/routes/useAppNavigate";
import { Navigate } from "react-router";
import { Button } from "@/components/ui";
import { Notice } from "@/components/feedback";
import { useMockAccount } from "@/features/user/model/mockAccount";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { paths } from "@/routes/paths";
export function WithdrawalCompletePage() {
  const account = useMockAccount();
  const navigate = useAppNavigate();
  const home = () =>
    void navigate(paths.landing, { replace: true, motion: "back" });
  if (account.status !== "withdrawn")
    return (
      <Navigate
        to={paths.withdrawal}
        replace
      />
    );
  return (
    <AccountPageLayout
      title="회원 탈퇴 완료"
      onBack={home}
      actions={<Button onClick={home}>처음으로</Button>}
    >
      <h1 className="text-hm-title-page">탈퇴가 완료됐어요</h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        한마음 계정 정보가 삭제되고 모든 참여 공간의 접근이 종료됐어요.
      </p>
      <Notice
        title="가족과 공유한 기록은 남아요"
        body="탈퇴만으로 공간 전체가 삭제되지는 않아요. 실제 계정 삭제가 아닌 Mock 완료 화면이에요."
      />
    </AccountPageLayout>
  );
}
