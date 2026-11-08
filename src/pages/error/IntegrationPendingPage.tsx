import { DetailLayout } from "@/components/layout";
import { Notice } from "@/components/feedback";
import { Button } from "@/components/ui";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { paths } from "@/routes/paths";

export function IntegrationPendingPage({ title }: { title: string }) {
  const navigate = useAppNavigate();
  const toSpaces = () => void navigate(paths.spaces);
  return (
    <DetailLayout
      title={title}
      onBack={toSpaces}
    >
      <Notice
        title="아직 준비 중인 기능이에요"
        body="현재 로그인과 참여 공간 확인을 이용할 수 있어요. 이 기능은 연결 후 이용할 수 있어요."
      />
      <Button onClick={toSpaces}>참여 공간 확인</Button>
    </DetailLayout>
  );
}
