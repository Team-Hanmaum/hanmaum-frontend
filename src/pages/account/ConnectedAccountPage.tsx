import { DetailLayout } from "@/components/layout";
import { MenuRow } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import { AccountInfoCard } from "@/features/user/ui/AccountInfoCard";
import { paths } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function ConnectedAccountPage() {
  const session = useSession();
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(paths.spaces);
  if (session.status !== "authenticated") return null;
  return (
    <DetailLayout
      title="내 계정"
      onBack={onBack}
    >
      <h1 className="text-hm-title-page">내 계정</h1>
      <AccountInfoCard>
        <dl className="flex flex-col gap-hm-20">
          <div>
            <dt className="text-hm-body-small text-hm-text-secondary">이름</dt>
            <dd className="mt-hm-8 text-hm-body-default">
              {session.user.displayName ?? "이름 미등록"}
            </dd>
          </div>
          <div>
            <dt className="text-hm-body-small text-hm-text-secondary">
              로그인 방식
            </dt>
            <dd className="mt-hm-8 text-hm-body-default">
              {session.user.providers
                .map((provider) =>
                  provider === "GOOGLE" ? "Google" : "카카오",
                )
                .join(", ") || "연결된 계정 없음"}
            </dd>
          </div>
        </dl>
      </AccountInfoCard>
      <MenuRow
        icon="grid-brand"
        title="참여 중인 돌봄 공간"
        onClick={() => void navigate(paths.spaces)}
      />
      <MenuRow
        tone="danger"
        icon="chevron-right-error"
        title="로그아웃"
        description="계정과 돌봄 기록은 유지돼요"
        onClick={() => void navigate(paths.logout)}
      />
      <MenuRow
        tone="danger"
        title="회원 탈퇴"
        description="계정 정보 삭제와 모든 참여 공간의 접근 종료"
        onClick={() => void navigate(paths.withdrawal)}
      />
    </DetailLayout>
  );
}
