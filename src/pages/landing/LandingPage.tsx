import { useNavigate } from "react-router";
import { ActionBar, Header, PageLayout } from "@/components/layout";
import { Badge, Comparison } from "@/components/ui";
import { paths } from "@/routes/paths";

export function LandingPage() {
  const navigate = useNavigate();
  const openLogin = () => void navigate(paths.login);
  return (
    <PageLayout
      header={<Header variant="main" />}
      footer={
        <ActionBar
          position="fixed"
          primary={{ label: "시작하기", onClick: openLogin }}
          secondary={{ label: "이미 계정이 있어요", onClick: openLogin }}
        />
      }
    >
      <div className="flex flex-col gap-hm-8">
        <h1 className="text-hm-title-page">
          부모님 돌봄,
          <br />
          가족이 함께 이어가요
        </h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          흩어진 소식을 한곳에 남기고,
          <br />
          지금 챙길 일을 함께 확인해요.
        </p>
      </div>
      <section
        aria-labelledby="landing-example"
        className="flex flex-col items-start gap-hm-16 rounded-hm-16 bg-hm-bg-surface p-hm-20"
      >
        <Badge
          tone="brand"
          label="사용 예시"
        />
        <h2
          id="landing-example"
          className="text-hm-title-hero"
        >
          “엄마 재진 날짜가
          <br />
          20일로 바뀌었대.”
        </h2>
        <div
          className="h-px w-full bg-hm-divider-default"
          aria-hidden="true"
        />
        <p className="text-hm-body-emphasis">내과 재진</p>
        <Comparison
          beforeLabel="이전 날짜"
          beforeValue="10월 15일"
          afterLabel="반영된 날짜"
          afterValue="10월 20일"
        />
        <p className="text-hm-caption-default text-hm-text-secondary">
          소유자가 확인한 뒤 반영한 예시예요.
        </p>
      </section>
      <p className="text-hm-body-default text-hm-text-secondary">
        다른 가족도 같은 일정과 할 일을 보며
        <br />
        돌봄을 이어갈 수 있어요.
      </p>
    </PageLayout>
  );
}
