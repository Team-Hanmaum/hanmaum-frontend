import { useState } from "react";
import { Link } from "react-router";
import { ActionBar, DetailLayout } from "@/components/layout";
import { BottomSheet, Notice } from "@/components/feedback";
import { MockNotice } from "@/components/feedback/MockNotice";
import { Button } from "@/components/ui";
import { paths } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function OnboardingGuidePage() {
  const onBack = useBackNavigation(paths.login);
  const [showNextStep, setShowNextStep] = useState(false);

  return (
    <>
      <DetailLayout
        title="시작 전 안내"
        onBack={onBack}
        notice={<MockNotice message="실제 로그인·동의 기록 없음" />}
        footer={
          <ActionBar
            position="fixed"
            primary={{
              label: "안내 확인하고 계속",
              onClick: () => setShowNextStep(true),
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
      <BottomSheet
        open={showNextStep}
        onOpenChange={setShowNextStep}
        title="다음 화면 준비 중"
        footer={
          <Button
            className="w-full"
            onClick={() => setShowNextStep(false)}
          >
            확인
          </Button>
        }
      >
        <p className="text-hm-body-default text-hm-text-secondary">
          공간 생성은 후속 작업에서 연결해요. 지금은 실제 동의나 공간 생성을
          처리하지 않아요.
        </p>
        {import.meta.env.DEV && (
          <Link
            to={paths.spaces}
            className="hm-focus-ring rounded-hm-8 p-hm-12 text-center text-hm-text-brand underline"
          >
            개발용 Mock 공간 보기
          </Link>
        )}
      </BottomSheet>
    </>
  );
}
