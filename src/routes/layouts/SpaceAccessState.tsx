import { useAppNavigate } from "@/routes/useAppNavigate";

import { Header, PageLayout, ActionBar } from "@/components/layout";
import { Notice } from "@/components/feedback";
import { MockNotice } from "@/components/feedback/MockNotice";
import { paths } from "../paths";
export function SpaceAccessState() {
  const navigate = useAppNavigate();
  return (
    <PageLayout
      header={<Header variant="main" />}
      notice={<MockNotice message="Mock 참여 상태 · 실제 서버 권한 확인 전" />}
      footer={
        <ActionBar
          position="fixed"
          primary={{
            label: "참여 공간 확인",
            onClick: () => void navigate(paths.spaces, { replace: true }),
          }}
        />
      }
    >
      <h1 className="text-hm-title-page">
        이 공간에
        <br />
        접근할 수 없어요
      </h1>
      <p className="text-hm-body-default text-hm-text-secondary">
        현재 참여 중인 다른 공간을 확인해 주세요.
      </p>
      <Notice
        title="함께하는 공간에서 계속할 수 있어요"
        body="참여 가능한 공간을 다시 확인해 주세요. 새로고침하면 Mock 변경 사항은 초기화돼요."
      />
    </PageLayout>
  );
}
