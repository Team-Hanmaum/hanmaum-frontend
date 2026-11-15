import { useRef } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { BottomSheet, LoadingState } from "@/components/feedback";
import { Button, Field, TextAction } from "@/components/ui";
import { careSpaceName } from "@/features/carespace/model/careSpaceViewTypes";
import { useInvitationLink } from "@/features/carespace/model/useInvitationLink";
import { InvitationLinkCard } from "@/features/carespace/ui/InvitationLinkCard";
import { ApiError } from "@/lib/api";
import { SpaceBottomNavigation } from "@/routes/layouts/SpaceBottomNavigation";
import { spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function SpaceInvitePage() {
  const { space } = useSpaceContext();
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
            <div className="grid auto-cols-fr grid-flow-col gap-hm-8 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-8">
              {(!expired || failed) && (
                <Button
                  variant="outline"
                  disabled={loading || sharing}
                  onClick={
                    failed
                      ? () => void navigate(spacePath(spaceId, "family"))
                      : () => void invitation.share()
                  }
                >
                  {failed ? "가족 화면으로" : "링크 공유"}
                </Button>
              )}
              <Button
                className="px-hm-8"
                disabled={denied}
                loading={loading || sharing}
                loadingLabel={loading ? "링크 준비 중" : "링크 복사 중"}
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
                      ? "링크 다시 복사"
                      : "초대 링크 복사"}
              </Button>
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
        <div className="flex flex-col gap-hm-8">
          <h1 className="text-hm-title-page">
            {failed
              ? "초대 링크를 만들지 못했어요"
              : expired
                ? "초대 링크가 만료됐어요"
                : "가족에게 초대 링크 보내기"}
          </h1>
          <p className="text-hm-body-default text-hm-text-secondary">
            {failed
              ? denied
                ? "이 공간에서 초대 링크를 만들 수 없어요. 참여 중인 공간인지 확인해 주세요."
                : "연결 상태를 확인한 뒤 다시 시도해 주세요."
              : expired
                ? "다시 초대하려면 새 링크를 만들어 보내 주세요."
                : "가족이 링크를 열고 로그인하면 이 공간에 참여할 수 있어요."}
          </p>
        </div>
        <div className="overflow-hidden rounded-hm-16 bg-hm-bg-surface">
          <div className="flex items-baseline justify-between gap-hm-12 px-hm-16 py-hm-12">
            <p className="text-hm-body-emphasis wrap-anywhere">
              {careSpaceName({ subjectLabel })}
            </p>
            {!failed && (
              <p className="shrink-0 text-hm-body-small text-hm-text-secondary">
                가족 {memberCount}명
              </p>
            )}
          </div>
          {link && !failed && (
            <InvitationLinkCard
              expiresAt={Date.parse(link.expiresAt)}
              expired={expired}
            />
          )}
        </div>
        {loading && !link && (
          <LoadingState label="초대 링크를 준비하고 있어요" />
        )}
        {!failed && !expired && (
          <p className="text-hm-body-small text-hm-text-secondary">
            참여한 가족은 이 공간의 소식·돌봄 항목·근거와 이력을 확인하고 소식을
            남길 수 있어요.
          </p>
        )}
        {(feedback || copied) && (
          <p
            role="status"
            className="text-hm-body-small text-hm-text-secondary"
          >
            {feedback ||
              "초대 링크를 복사했어요. 가족과의 대화에 붙여넣어 보내세요."}
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
