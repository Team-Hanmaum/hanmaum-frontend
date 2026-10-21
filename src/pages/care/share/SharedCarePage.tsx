import { useAppNavigate } from "@/routes/useAppNavigate";
import { useOutletContext, useParams } from "react-router";
import { Notice } from "@/components/feedback";
import { Button, SocialLoginButton } from "@/components/ui";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useMockProposals } from "@/features/proposal/model/useMockProposals";
import { sharedCareStates } from "@/features/sharing/model/useMockCareShare";
import { ProposalPageLayout } from "@/routes/layouts/ProposalPageLayout";
import { useMockScreenState } from "@/routes/useMockScreenState";
import { careItemPath, paths } from "@/routes/paths";

export function SharedCarePage() {
  const space = useOutletContext<CareSpaceView>();
  const { itemId = "" } = useParams();
  const data = useMockProposals(space);
  const item = data.items.find((entry) => entry.id === itemId);
  const [state, setState] = useMockScreenState(sharedCareStates, "login");
  const navigate = useAppNavigate();
  const unavailable =
    !item ||
    item.deletedAt ||
    item.needsReconfirmation ||
    state === "unavailable";
  const login = !unavailable && state === "login";
  const member = !unavailable && state === "member";
  return (
    <ProposalPageLayout
      title="한마음"
      spaceId={space.id}
      onBack={() => void navigate(paths.spaces, { motion: "back" })}
      preview={{ value: state, options: sharedCareStates, onChange: setState }}
      actions={
        !login && (
          <Button
            onClick={() =>
              void navigate(
                member ? careItemPath(space.id, itemId) : paths.spaces,
              )
            }
          >
            {member ? "Mock · 현재 항목 보기" : "내 참여 공간으로"}
          </Button>
        )
      }
    >
      <h1 className="text-hm-title-page">
        {unavailable
          ? "지금은 이 정보를 열 수 없어요"
          : login
            ? "공유된 정보를 보려면 로그인이 필요해요"
            : member
              ? "참여 중인 공간의 정보예요"
              : "이 정보를 볼 수 있는 참여 권한이 없어요"}
      </h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        {unavailable
          ? "항목이나 공간이 삭제되었거나 접근 권한이 달라졌을 수 있어요."
          : "내가 참여한 돌봄 공간의 정보만 확인할 수 있어요."}
      </p>
      <Notice
        title={
          login ? "가족의 정보를 보호해요" : "현재 상태를 기준으로 안내해요"
        }
        body={
          unavailable
            ? "이전 제목·내용은 표시하지 않아요."
            : login
              ? "로그인과 현재 참여 여부를 확인한 뒤 상세 내용을 보여드려요."
              : member
                ? "Mock 참여 확인 예시예요. 실제 접근 권한은 API 연결 후 확인해요."
                : "공유 링크를 받았다고 공간에 참여하는 것은 아니에요."
        }
      />
      {login && (
        <>
          <SocialLoginButton
            provider="kakao"
            onClick={() => setState("member")}
          />
          <SocialLoginButton
            provider="google"
            onClick={() => setState("member")}
          />
          <p className="text-hm-caption text-hm-text-secondary">
            Mock · 실제 로그인 없이 참여 확인 예시로 이동해요.
          </p>
        </>
      )}
    </ProposalPageLayout>
  );
}
