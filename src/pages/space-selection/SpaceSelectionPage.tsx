import { Link } from "react-router";
import { DetailLayout } from "@/components/layout";
import { PagePlaceholder } from "@/components/feedback/PagePlaceholder";
import { paths, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function SpaceSelectionPage() {
  const onBack = useBackNavigation(paths.landing);
  return (
    <DetailLayout
      title="돌봄 공간"
      onBack={onBack}
    >
      <PagePlaceholder title="돌봄 공간 선택" />
      {import.meta.env.DEV && (
        <nav
          aria-label="개발용 Mock 공간"
          className="flex flex-col gap-hm-12"
        >
          <p className="text-hm-caption-default text-hm-text-secondary">
            아래 공간은 탭 이동 검증용 예시이며 실제 참여 공간이 아니에요.
          </p>
          {["mock-space-1", "mock-space-2"].map((id, index) => (
            <Link
              key={id}
              to={spacePath(id)}
              className="hm-focus-ring rounded-hm-10 bg-hm-bg-brand-subtle p-hm-16 text-hm-text-brand"
            >
              Mock 공간 {index + 1} 열기
            </Link>
          ))}
        </nav>
      )}
    </DetailLayout>
  );
}
