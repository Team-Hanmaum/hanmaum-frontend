import { Link } from "react-router";
import { ErrorState } from "@/components/feedback";
import { PageLayout } from "@/components/layout";
import { paths } from "@/routes/paths";

export function NotFoundPage() {
  return (
    <PageLayout mainClassName="flex flex-col justify-center gap-hm-20 p-hm-20">
      <h1 className="text-hm-title-page">페이지를 찾을 수 없어요</h1>
      <ErrorState
        reason="load-error"
        title="주소를 확인해 주세요"
        body="주소가 잘못되었거나 아직 준비되지 않은 페이지예요."
      />
      <Link
        to={paths.landing}
        replace
        className="hm-focus-ring rounded-hm-8 p-hm-12 text-center text-hm-text-brand underline"
      >
        시작 화면으로
      </Link>
    </PageLayout>
  );
}
