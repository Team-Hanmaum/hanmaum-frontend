import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import {
  BottomSheet,
  ErrorState,
  LoadingState,
  Notice,
} from "@/components/feedback";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { Button, Field, TextAction } from "@/components/ui";
import { InvitationLinkCard } from "@/features/carespace/ui/InvitationLinkCard";
import {
  careSpaceName,
  type CareSpaceView,
} from "@/features/carespace/model/careSpaceViewTypes";
import { useMockCareSpaces } from "@/features/carespace/model/useMockCareSpaces";
import { useMockInvitationLink } from "@/features/carespace/model/useMockInvitationLink";
import { invitationScreenStates } from "@/features/carespace/model/invitationScreenStates";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { invitationPath, paths, spacePath } from "@/routes/paths";
import { SpaceBottomNavigation } from "@/routes/layouts/SpaceBottomNavigation";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { SpaceAccessState } from "@/routes/layouts/SpaceAccessState";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

function invitationUrl(token: string) {
  return new URL(invitationPath(token), window.location.origin).href;
}
export function SpaceInvitePage() {
  const { careSpaceId } = useParams();
  const { spaces, ended } = useMockCareSpaces();
  const navigate = useNavigate();
  const onBack = useBackNavigation(paths.spaces);
  const space = spaces.find((item) => item.id === careSpaceId);
  if (careSpaceId && ended[careSpaceId]) return <SpaceAccessState />;
  if (!space)
    return (
      <DetailLayout
        title="가족 초대"
        onBack={onBack}
      >
        <h1 className="sr-only">가족 초대</h1>
        <ErrorState
          reason="load-error"
          title="화면 확인용 공간이 없어요"
          body="새로고침으로 초기화된 Mock 공간은 다시 선택해 주세요."
          onAction={() => void navigate(paths.spaces)}
          actionLabel="공간 선택"
        />
      </DetailLayout>
    );
  return (
    <SpaceInvitePreview
      key={space.id}
      space={space}
    />
  );
}
function SpaceInvitePreview({ space }: { space: CareSpaceView }) {
  const { withdrawing, returnToWithdrawal } = useWithdrawalReturn();
  const navigate = useNavigate();
  const onBack = useBackNavigation(spacePath(space.id));
  const [state, setState] = useMockScreenState(
    invitationScreenStates,
    "default",
  );
  const {
    url,
    expiresAt,
    failed,
    expired,
    loading,
    sharing,
    unavailable,
    fallbackOpen,
    setFallbackOpen,
    feedback,
    changeState,
    reissue,
    copy,
    share,
  } = useMockInvitationLink({
    spaceId: space.id,
    state,
    onStateChange: setState,
    createUrl: invitationUrl,
  });
  const field = useRef<HTMLInputElement>(null);
  return (
    <>
      <DetailLayout
        title="가족 초대"
        onBack={withdrawing ? returnToWithdrawal : onBack}
        notice={
          <MockStateSelect
            message="화면 확인용 링크 · 실제 발급·참여 없음 · 새로고침 시 초기화"
            value={state}
            options={invitationScreenStates}
            onChange={changeState}
          />
        }
        footer={
          <FixedBottomArea position="fixed">
            <div className="flex flex-col gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-hm-24">
              <Button
                className="w-full"
                disabled={!isMockPreviewEnabled || state === "loading"}
                loading={loading || sharing}
                onClick={failed || expired ? reissue : () => void copy()}
              >
                {failed
                  ? "다시 시도"
                  : expired
                    ? "새 초대 링크 만들기"
                    : state === "copied"
                      ? "초대 링크 다시 복사"
                      : "초대 링크 복사"}
              </Button>
              {!expired && (
                <TextAction
                  className="w-full"
                  disabled={!isMockPreviewEnabled || loading || sharing}
                  onClick={
                    failed
                      ? () => void navigate(spacePath(space.id, "family"))
                      : () => void share()
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
              spaceId={space.id}
              active="family"
            />
          </FixedBottomArea>
        }
      >
        {state === "copied" && (
          <Notice
            role="status"
            title="초대 링크를 복사했어요"
            body="가족과 대화하는 곳에 붙여넣어 보내 주세요."
          />
        )}
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
            ? "연결 상태를 확인한 뒤 다시 시도해 주세요."
            : expired
              ? "다시 초대하려면 새 링크를 만들어 보내 주세요."
              : "링크를 받은 가족은 로그인한 뒤 같은 돌봄 공간에 참여할 수 있어요."}
        </p>
        <div className="flex flex-col gap-hm-8 rounded-hm-16 bg-hm-bg-surface p-hm-20">
          <p className="text-hm-body-small text-hm-text-secondary">
            초대할 공간
          </p>
          <p className="text-hm-body-default wrap-anywhere">
            {careSpaceName(space)}
            {!failed && ` · 함께하는 가족 ${space.members.length}명`}
          </p>
        </div>
        {loading ? (
          <LoadingState label="초대 링크를 준비하고 있어요" />
        ) : (
          !failed && (
            <InvitationLinkCard
              expiresAt={expiresAt}
              expired={expired}
            />
          )
        )}
        <Notice
          tone={
            failed
              ? "error"
              : expired || state === "copied"
                ? "neutral"
                : "info"
          }
          title={
            failed
              ? "새 링크가 준비되면 공유할 수 있어요"
              : expired
                ? "이 링크로는 참여할 수 없어요"
                : state === "copied"
                  ? "가족이 참여하면"
                  : "참여하면 함께 볼 수 있어요"
          }
          body={
            failed
              ? "새 초대 링크를 준비한 뒤 복사하거나 공유해 주세요."
              : expired
                ? "새 링크를 받은 가족이 로그인하고 참여하면 가족 목록에서 확인할 수 있어요."
                : state === "copied"
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
        {!unavailable && (
          <TextAction onClick={() => void navigate(new URL(url).pathname)}>
            Mock 초대받은 화면 보기
          </TextAction>
        )}
      </DetailLayout>
      <BottomSheet
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
        title="Mock 초대 링크 복사"
      >
        <p className="text-hm-body-small text-hm-text-secondary">{feedback}</p>
        <Field
          ref={field}
          label="화면 확인용 링크"
          value={url}
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
