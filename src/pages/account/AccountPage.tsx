import { useSearchParams } from "react-router";
import { DetailLayout } from "@/components/layout";
import { Avatar, MenuRow } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import { AccountInfoCard } from "@/features/user/ui/AccountInfoCard";
import { paths, spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function AccountPage() {
  const session = useSession();
  const navigate = useAppNavigate();
  const [params] = useSearchParams();
  const spaceId = params.get("space");
  const onBack = useBackNavigation(
    spaceId ? spacePath(spaceId, "all") : paths.spaces,
  );
  if (session.status !== "authenticated") return null;
  const displayName = session.user.displayName ?? "이름 미등록";
  return (
    <DetailLayout
      title="내 계정"
      onBack={onBack}
    >
      <h1 className="sr-only">내 계정</h1>
      <AccountInfoCard>
        <dl className="flex flex-col gap-hm-20">
          <div>
            <dt className="text-hm-body-small text-hm-text-secondary">이름</dt>
            <dd className="mt-hm-8 flex items-center gap-hm-12 text-hm-body-default">
              <Avatar
                name={displayName}
                profileImageUrl={session.user.profileImageUrl}
                emphasis="self"
                decorative
              />
              {displayName}
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
        onClick={() =>
          void navigate(paths.spaces, { state: { fromAccount: { spaceId } } })
        }
      />
      <MenuRow
        icon="logout"
        title="로그아웃"
        onClick={() => void navigate(paths.logout)}
      />
      <MenuRow
        tone="danger"
        title="회원 탈퇴"
        onClick={() => void navigate(paths.withdrawal)}
      />
    </DetailLayout>
  );
}
