import { useState } from "react";
import { useLocation } from "react-router";
import { ActionBar, Header, PageLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { Notice } from "@/components/feedback";
import { ExampleDisclosure } from "@/components/feedback/ExampleDisclosure";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { useSession } from "@/features/auth/model/useSession";
import { useOAuthLogin } from "@/features/auth/model/useOAuthLogin";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { InvitationContent } from "@/features/carespace/ui/InvitationContent";
import { paths } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { ExampleSurface } from "@/routes/layouts/ExampleSurface";
import { useMockAction } from "@/lib/useMockAction";
const states = [
  { value: "default", label: "초대 안내" },
  { value: "expired", label: "만료" },
  { value: "unavailable", label: "사용 불가" },
  { value: "error", label: "참여 오류" },
] as const;
export function ConnectedInvitationPage() {
  const session = useSession();
  const oauth = useOAuthLogin();
  const location = useLocation();
  const navigate = useAppNavigate();
  const [state, setState] = useMockScreenState(states, "default");
  const [complete, setComplete] = useState(false);
  const { pending, run } = useMockAction();
  const authenticated = session.status === "authenticated";
  const invalid = state === "expired" || state === "unavailable";
  const toStart = () =>
    void navigate(authenticated ? paths.spaces : paths.landing);
  return (
    <PageLayout
      header={
        <Header
          variant="main"
          brandAction={{ label: "한마음 시작 화면으로", onClick: toStart }}
        />
      }
      notice={
        <MockStateSelect
          message="초대 안내·참여 예시 / 소셜 로그인은 실제 API 사용"
          value={state}
          options={states}
          onChange={(value) => {
            if (!pending) {
              setState(value);
              setComplete(false);
            }
          }}
        />
      }
      footer={
        invalid || complete ? (
          <ActionBar
            position="fixed"
            primary={{
              label: authenticated ? "참여 공간 목록으로" : "시작 화면으로",
              onClick: toStart,
            }}
          />
        ) : authenticated ? (
          <ActionBar
            position="fixed"
            primary={{
              label: "가족 참여 확인 (예시)",
              loading: pending,
              onClick: () => run(() => setComplete(true)),
            }}
          />
        ) : (
          <FixedBottomArea position="fixed">
            <div className="bg-hm-bg-surface px-hm-20 pt-hm-20 pb-[calc(var(--hm-spacing-20)+env(safe-area-inset-bottom))]">
              <SocialLoginOptions
                disabled={session.status === "checking"}
                loadingProvider={oauth.provider}
                onLogin={(provider) =>
                  void oauth.start(
                    provider,
                    `${location.pathname}${location.search}${location.hash}`,
                  )
                }
                helperAlign="left"
                helper="소셜 로그인은 실제 계정으로 진행돼요. 로그인 후 이 주소로 돌아오며, 실제 공간 참여는 아직 연결되지 않았어요."
              />
            </div>
          </FixedBottomArea>
        )
      }
    >
      <ExampleSurface>
        <ExampleDisclosure
          result={complete}
          description="초대 내용과 참여 결과는 화면 확인용 예시예요. 링크 유효성 확인과 실제 공간 참여는 아직 연결되지 않았어요."
        />
        {complete ? (
          <>
            <h1 className="text-hm-title-page">
              가족의 돌봄 공간에 참여했어요
            </h1>
            <Notice
              title="참여 완료 화면 예시예요"
              body="실제 참여 공간은 바뀌지 않았어요. 참여 공간 목록에서 현재 이용 중인 공간을 확인할 수 있어요."
            />
          </>
        ) : (
          <InvitationContent state={state} />
        )}
      </ExampleSurface>
      {oauth.error && (
        <Notice
          tone="error"
          role="alert"
          title="로그인 시작 실패"
          body={oauth.error}
        />
      )}
    </PageLayout>
  );
}
