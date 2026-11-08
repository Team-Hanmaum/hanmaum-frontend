import { useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import { ActionBar, Header, PageLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { ErrorState, LoadingState, Notice } from "@/components/feedback";
import { useSession } from "@/features/auth/model/useSession";
import { useOAuthLogin } from "@/features/auth/model/useOAuthLogin";
import { SocialLoginOptions } from "@/features/auth/ui/SocialLoginOptions";
import {
  useInvitationPreview,
  useJoinInvitation,
} from "@/features/carespace/model/useInvitation";
import { InvitationContent } from "@/features/carespace/ui/InvitationContent";
import { ApiError } from "@/lib/api";
import { paths, spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";

type InvalidReason = "expired" | "unavailable";

// 410 INVITATION_EXPIRED는 만료, 404(INVITATION_UNAVAILABLE 등)·403은 사용할 수 없는 초대로 안내한다.
function invalidReason(error: unknown): InvalidReason | undefined {
  if (!(error instanceof ApiError)) return undefined;
  if (error.status === 410) return "expired";
  if (error.status === 404 || error.status === 403) return "unavailable";
  return undefined;
}

export function ConnectedInvitationPage() {
  const { invitationToken = "" } = useParams();
  const session = useSession();
  const oauth = useOAuthLogin();
  const location = useLocation();
  const navigate = useAppNavigate();
  const preview = useInvitationPreview(invitationToken);
  const join = useJoinInvitation(invitationToken);
  const [joinFailed, setJoinFailed] = useState(false);
  const [joinInvalid, setJoinInvalid] = useState<InvalidReason>();
  // 한 참여 시도의 요청 ID. 처리 중·통신 실패 재시도에는 같은 값을 다시 보낸다.
  const attempt = useRef<string | null>(null);
  const authenticated = session.status === "authenticated";
  const invalid = joinInvalid ?? invalidReason(preview.error);
  const loadFailed =
    authenticated && preview.isError && !invalid && !preview.data;
  const member = authenticated && preview.data?.isMember;
  const toStart = () =>
    void navigate(authenticated ? paths.spaces : paths.landing);

  function joinSpace() {
    if (join.isPending) return;
    if (!attempt.current) attempt.current = crypto.randomUUID();
    setJoinFailed(false);
    join.mutate(
      { clientRequestId: attempt.current },
      {
        onSuccess: ({ joined }) => {
          attempt.current = null;
          void navigate(spacePath(joined.spaceId), { replace: true });
        },
        onError: (error) => {
          const reason = invalidReason(error);
          if (reason) setJoinInvalid(reason);
          else {
            if (error.code === "IDEMPOTENCY_KEY_REUSED") attempt.current = null;
            setJoinFailed(true);
          }
        },
      },
    );
  }

  const footer =
    invalid || loadFailed ? (
      <ActionBar
        position="fixed"
        primary={{
          label: authenticated ? "참여 공간 목록으로" : "시작 화면으로",
          onClick: toStart,
        }}
      />
    ) : member && preview.data ? (
      <ActionBar
        position="fixed"
        primary={{
          label: "돌봄 공간으로 이동",
          onClick: () => void navigate(spacePath(preview.data.spaceId)),
        }}
      />
    ) : authenticated ? (
      <ActionBar
        position="fixed"
        primary={{
          label: joinFailed ? "다시 참여하기" : "가족 공간에 참여하기",
          loading: join.isPending,
          loadingLabel: "공간에 참여하고 있어요",
          disabled: !preview.data,
          onClick: joinSpace,
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
            helper="처음 로그인하면 한마음 계정이 만들어져요. 로그인 후 이 화면으로 돌아와 초대를 확인할 수 있어요."
          />
        </div>
      </FixedBottomArea>
    );

  return (
    <PageLayout
      header={
        <Header
          variant="main"
          brandAction={{ label: "한마음 시작 화면으로", onClick: toStart }}
        />
      }
      footer={footer}
    >
      {invalid ? (
        <InvitationContent state={invalid} />
      ) : !authenticated ? (
        <InvitationContent state="default" />
      ) : preview.isPending ? (
        <LoadingState label="초대 링크를 확인하고 있어요" />
      ) : loadFailed ? (
        <ErrorState
          reason={
            preview.error instanceof ApiError &&
            preview.error.kind === "network"
              ? "offline"
              : "load-error"
          }
          title="초대 링크를 확인하지 못했어요"
          loading={preview.isFetching}
          onAction={() => void preview.refetch()}
        />
      ) : member ? (
        <>
          <h1 className="text-hm-title-page">
            이미 참여 중인
            <br />
            돌봄 공간이에요
          </h1>
          <Notice
            title="바로 이용할 수 있어요"
            body="이 초대의 공간에 이미 참여하고 있어요. 돌봄 공간으로 이동해 주세요."
          />
        </>
      ) : (
        <InvitationContent
          state={joinFailed ? "error" : "default"}
          ready
          expiresAt={preview.data?.expiresAt}
        />
      )}
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
