import { useAppNavigate } from "@/routes/useAppNavigate";

import { ActionBar, DetailLayout } from "@/components/layout";
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
        <h1 className="text-hm-title-page">기록하기 전에</h1>
        <div className="divide-y divide-hm-divider-default break-keep">
          <section className="pb-hm-20">
            <h2 className="text-hm-heading-section">남기는 정보</h2>
            <p className="mt-hm-4 text-hm-body-default text-hm-text-secondary">
              가족이 남긴 소식, 돌봄 일정, 할 일을 함께 관리해요.
            </p>
          </section>
          <section className="py-hm-20">
            <h2 className="text-hm-heading-section">볼 수 있는 사람</h2>
            <p className="mt-hm-4 text-hm-body-default text-hm-text-secondary">
              같은 돌봄 공간에 참여한 가족이 기록과 현재 돌봄 정보를 볼 수
              있어요.
            </p>
          </section>
          <section className="pt-hm-20">
            <h2 className="text-hm-heading-section text-hm-text-brand">
              부모님 동의
            </h2>
            <p className="mt-hm-4 text-hm-body-default text-hm-text-secondary">
              기록할 내용과 누가 볼 수 있는지 부모님께 알려드리고, 기록 전에
              동의를 받아 주세요.
            </p>
          </section>
        </div>
      </DetailLayout>
    </>
  );
}
