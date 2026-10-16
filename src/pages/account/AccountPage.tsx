import { useNavigate, useSearchParams } from "react-router";
import { ErrorState, LoadingState } from "@/components/feedback";
import { MenuRow } from "@/components/ui";
import { useMockAccount } from "@/features/user/model/mockAccount";
import { AccountInfoCard } from "@/features/user/ui/AccountInfoCard";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { AccountPageLayout } from "@/routes/layouts/AccountPageLayout";
import { paths, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "계정 정보" },
  { value: "loading", label: "불러오는 중" },
  { value: "error", label: "조회 실패" },
] as const;
export function AccountPage() {
  const account = useMockAccount();
  const { spaces } = useMockCareSpaces();
  const [params] = useSearchParams();
  const space = spaces.find((entry) => entry.id === params.get("space"));
  const navigate = useNavigate();
  const onBack = useBackNavigation(
    space ? spacePath(space.id, "all") : paths.spaces,
  );
  const [state, setState] = useMockScreenState(states, "default");
  return (
    <AccountPageLayout
      title="내 계정"
      onBack={onBack}
      spaceId={space?.id}
      preview={{ value: state, options: states, onChange: setState }}
    >
      <h1 className="text-hm-title-page">내 계정</h1>
      {state === "loading" ? (
        <LoadingState label="계정 정보를 불러오고 있어요" />
      ) : state === "error" ? (
        <ErrorState
          reason="load-error"
          title="계정 정보를 불러오지 못했어요"
          onAction={() => setState("default")}
        />
      ) : (
        <>
          <p className="text-hm-body-default text-hm-text-secondary">
            로그인한 계정 정보를 확인해요.
          </p>
          <AccountInfoCard>
            <dl className="flex flex-col gap-hm-20">
              <div>
                <dt className="text-hm-body-small text-hm-text-secondary">
                  이름
                </dt>
                <dd className="mt-hm-8 text-hm-body-default">{account.name}</dd>
              </div>
              <div>
                <dt className="text-hm-body-small text-hm-text-secondary">
                  로그인 방식
                </dt>
                <dd className="mt-hm-8 text-hm-body-default">
                  {account.provider === "google" ? "Google" : "카카오"}
                </dd>
              </div>
            </dl>
          </AccountInfoCard>
          <MenuRow
            icon="grid-brand"
            title="참여 중인 돌봄 공간"
            description="내가 함께하는 공간 확인"
            onClick={() => void navigate(paths.spaces)}
          />
          <h2 className="text-hm-heading-section">계정 관리</h2>
          <MenuRow
            tone="danger"
            icon="chevron-right-error"
            title="로그아웃"
            description="계정과 돌봄 기록은 유지돼요"
            onClick={() => void navigate(paths.logout)}
          />
          <MenuRow
            tone="danger"
            icon="chevron-right-error"
            title="회원 탈퇴"
            description="계정 정보와 참여 권한 삭제"
            onClick={() => void navigate(paths.withdrawal)}
          />
        </>
      )}
    </AccountPageLayout>
  );
}
