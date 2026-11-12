import { useRef } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { BottomSheet, LoadingState, Notice } from "@/components/feedback";
import { Button, Field, TextAction } from "@/components/ui";
import { careSpaceName } from "@/features/carespace/model/careSpaceViewTypes";
import { useInvitationLink } from "@/features/carespace/model/useInvitationLink";
import { InvitationLinkCard } from "@/features/carespace/ui/InvitationLinkCard";
import { ApiError } from "@/lib/api";
import { SpaceBottomNavigation } from "@/routes/layouts/SpaceBottomNavigation";
import { spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useConnectedSpace } from "@/routes/useConnectedSpace";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function ConnectedSpaceInvitePage() {
  const { space } = useConnectedSpace();
  return (
    <SpaceInviteContent
      key={space.spaceId}
      spaceId={space.spaceId}
      subjectLabel={space.subjectLabel}
      memberCount={space.memberCount}
    />
  );
}

function SpaceInviteContent({
  spaceId,
  subjectLabel,
  memberCount,
}: {
  spaceId: string;
  subjectLabel: string;
  memberCount: number;
}) {
  const { withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(spacePath(spaceId));
  const invitation = useInvitationLink(spaceId);
  const {
    link,
    expired,
    loading,
    failed,
    copied,
    sharing,
    fallbackOpen,
    setFallbackOpen,
    feedback,
  } = invitation;
  // 404는 발급할 수 없는 공간이다. 403은 CSRF 실패일 수 있어 다시 시도할 수 있게 둔다.
  const denied =
    invitation.error instanceof ApiError && invitation.error.status === 404;
  const field = useRef<HTMLInputElement>(null);
  return (
    <>
      <DetailLayout
        title="가족 초대"
        onBack={withdrawing ? returnToWithdrawal : onBack}
        footer={
          <FixedBottomArea position="fixed">
            <div className="flex flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
              <Button
                className="w-full"
                disabled={denied}
                loading={loading || sharing}
                loadingLabel={
                  loading
                    ? "초대 링크를 준비하고 있어요"
                    : "링크를 복사하고 있어요"
                }
                onClick={
                  failed
                    ? invitation.retry
                    : expired
                      ? invitation.reissue
                      : () => void invitation.copy()
                }
              >
                {failed
                  ? "다시 시도"
                  : expired
                    ? "새 초대 링크 만들기"
                    : copied
                      ? "초대 링크 다시 복사"
                      : "초대 링크 복사"}
              </Button>
              {!expired && (
                <TextAction
                  className="w-full"
                  disabled={loading || sharing}
                  onClick={
                    failed
                      ? () => void navigate(spacePath(spaceId, "family"))
                      : () => void invitation.share()
                  }
                >
                  {failed ? "가족 화면으로" : "링크 공유"}
                </TextAction>
              )}
            </div>
            {withdrawing && (
              <TextAction
                className="w-full bg-hm-bg-surface pb-hm-20"
                onClick={returnToWithdrawal}
              >
                탈퇴 절차로 돌아가기
              </TextAction>
            )}
            <SpaceBottomNavigation
              spaceId={spaceId}
              active="family"
            />
          </FixedBottomArea>
        }
      >
        <Notice
          visible={copied}
          role="status"
          title="초대 링크를 복사했어요"
          body="가족과 대화하는 곳에 붙여넣어 보내 주세요."
        />
        <h1 className="text-hm-title-page">
          {failed ? (
            <>
              초대 링크를
              <br />
              만들지 못했어요
            </>
          ) : expired ? (
            <>
              초대 링크가
              <br />
              만료됐어요
            </>
          ) : (
            <>
              초대 링크를
              <br />
              가족에게 보내세요
            </>
          )}
        </h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          {failed
            ? denied
              ? "이 공간에서 초대 링크를 만들 수 없어요. 참여 중인 공간인지 확인해 주세요."
              : "연결 상태를 확인한 뒤 다시 시도해 주세요."
            : expired
              ? "다시 초대하려면 새 링크를 만들어 보내 주세요."
              : "링크를 받은 가족은 로그인한 뒤 같은 돌봄 공간에 참여할 수 있어요."}
        </p>
        <div className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-20">
          <p className="text-hm-body-small text-hm-text-secondary">
            초대할 공간
          </p>
          <p className="text-hm-body-default wrap-anywhere">
            {careSpaceName({ subjectLabel })}
            {!failed && ` · 함께하는 가족 ${memberCount}명`}
          </p>
        </div>
        {loading && !link ? (
          <LoadingState label="초대 링크를 준비하고 있어요" />
        ) : (
          link && (
            <InvitationLinkCard
              expiresAt={Date.parse(link.expiresAt)}
              expired={expired}
            />
          )
        )}
        <Notice
          tone={failed ? "error" : expired || copied ? "neutral" : "info"}
          title={
            failed
              ? "새 링크가 준비되면 공유할 수 있어요"
              : expired
                ? "이 링크로는 참여할 수 없어요"
                : copied
                  ? "가족이 참여하면"
                  : "참여하면 함께 볼 수 있어요"
          }
          body={
            failed
              ? "새 초대 링크를 준비한 뒤 복사하거나 공유해 주세요."
              : expired
                ? "새 링크를 받은 가족이 로그인하고 참여하면 가족 목록에서 확인할 수 있어요."
                : copied
                  ? "가족 탭의 목록에서 새 구성원을 확인할 수 있어요."
                  : "가족은 이 공간의 소식·돌봄 항목·근거와 이력을 확인하고 소식을 남길 수 있어요."
          }
        />
        {feedback && (
          <p
            role="status"
            className="text-hm-body-small text-hm-text-secondary"
          >
            {feedback}
          </p>
        )}
      </DetailLayout>
      <BottomSheet
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
        title="초대 링크 복사"
      >
        <p className="text-hm-body-small text-hm-text-secondary">{feedback}</p>
        <Field
          ref={field}
          label="초대 링크"
          value={link?.invitationUrl ?? ""}
          readOnly
          onFocus={(event) => event.target.select()}
        />
        <Button
          variant="secondary"
          onClick={() => {
            field.current?.focus();
            field.current?.select();
          }}
        >
          링크 선택
        </Button>
      </BottomSheet>
    </>
  );
}
