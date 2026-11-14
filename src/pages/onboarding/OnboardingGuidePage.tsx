import { useAppNavigate } from "@/routes/useAppNavigate";

import { ActionBar, DetailLayout } from "@/components/layout";
import { Notice } from "@/components/feedback";
import { paths } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function OnboardingGuidePage() {
  const onBack = useBackNavigation(paths.spaces);
  const navigate = useAppNavigate();

  return (
    <>
      <DetailLayout
        title="시작 전 안내"
        onBack={onBack}
        footer={
          <ActionBar
            position="fixed"
            primary={{
              label: "안내 확인하고 계속",
              onClick: () => void navigate(paths.spaceCreate),
            }}
          />
        }
      >
        <h1 className="text-hm-title-page">
          기록하기 전에
          <br />
          함께 확인해 주세요
        </h1>
        <Notice
          tone="neutral"
          title="어떤 정보가 남나요?"
          body={"가족이 남긴 소식과 돌봄 일정,\n할 일 등을 함께 관리해요."}
        />
        <Notice
          tone="neutral"
          title="누가 볼 수 있나요?"
          body={
            "같은 돌봄 공간에 참여한 가족이\n기록과 현재 돌봄 정보를 볼 수 있어요."
          }
        />
        <Notice
          title="부모님께 먼저 알려주세요"
          body={
            "기록할 내용과 함께 볼 가족을 알리고,\n부모님의 동의를 받아 주세요."
          }
        />
      </DetailLayout>
    </>
  );
}
