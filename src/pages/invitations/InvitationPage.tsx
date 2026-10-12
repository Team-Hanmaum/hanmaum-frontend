import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ActionBar, Header, PageLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import type { SocialProvider } from "@/components/ui";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import { InvitationContent } from "@/features/carespace/ui/InvitationContent";
import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useMockAction } from "@/lib/useMockAction";
import { paths, spacePath } from "@/routes/paths";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "초대 안내" },
  { value: "expired", label: "만료" },
  { value: "unavailable", label: "사용 불가" },
  { value: "error", label: "참여 오류" },
] as const;
export function InvitationPage() {
  const { invitationToken = "" } = useParams();
  // 다른 초대 주소로 이동할 때 공급자·진행 상태가 섞이지 않도록 분리한다.
  return (
    <InvitationPreview
      key={invitationToken}
      token={invitationToken}
    />
  );
}
function InvitationPreview({ token }: { token: string }) {
  const navigate = useNavigate();
  const [state, setState] = useMockScreenState(states, "default");
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const { pending, run } = useMockAction();
  const invalid = state === "expired" || state === "unavailable";
  function proceed(nextProvider: SocialProvider) {
    if (!isMockPreviewEnabled || pending) return;
    setProvider(nextProvider);
    run(() => {
      setProvider(null);
      if (token === "mock-expired") {
        setState("expired");
        return;
      }
      const result = mockCareSpaces.joinInvitation(token);
      if (!result) {
        setState("unavailable");
        return;
      }
      void navigate(
        `${spacePath(result.space.id)}${result.alreadyMember ? "" : "?mockState=joined"}`,
        { replace: true },
      );
    });
  }
  return (
    <PageLayout
      header={<Header variant="main" />}
      notice={
        <MockStateSelect
          message="화면 확인용 · 실제 로그인·가족 참여 없음"
          value={state}
          options={states}
          onChange={(value) => {
            if (!pending) setState(value);
          }}
        />
      }
      footer={
        invalid ? (
          <ActionBar
            position="fixed"
            primary={{
              label: "시작 화면으로",
              onClick: () => void navigate(paths.landing),
            }}
          />
        ) : (
          <FixedBottomArea position="fixed">
            <div className="bg-hm-bg-surface px-hm-20 pt-hm-20 pb-[calc(var(--hm-spacing-20)+env(safe-area-inset-bottom))]">
              <SocialLoginOptions
                order={["google", "kakao"]}
                disabled={!isMockPreviewEnabled}
                loadingProvider={provider}
                onLogin={proceed}
                helperAlign="left"
                helper={
                  <>
                    처음이라면 계정이 함께 만들어져요.
                    <br />
                    이미 참여한 가족은 기존 공간으로 이어져요.
                  </>
                }
              />
            </div>
          </FixedBottomArea>
        )
      }
    >
      <InvitationContent state={state} />
    </PageLayout>
  );
}
