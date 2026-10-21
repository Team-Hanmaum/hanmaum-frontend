import { IconButton } from "@/components/ui";
import { usePwaInstall } from "@/lib/pwa/installContext";

export function PwaInstalledBanner() {
  const { showInstalledBanner, dismissInstalledBanner } = usePwaInstall();
  if (!showInstalledBanner) return null;

  return (
    <aside
      aria-label="한마음 설치 상태"
      className="flex items-start gap-hm-8 bg-hm-bg-brand-subtle py-hm-8 pr-hm-8 pl-hm-20 text-hm-text-brand"
    >
      <div
        role="status"
        className="min-w-0 flex-1 py-hm-8 break-keep"
      >
        <p className="text-hm-body-emphasis">한마음이 이미 설치되어 있어요</p>
        <p className="text-hm-body-small">
          홈 화면이나 앱 목록에서 열어보세요.
        </p>
      </div>
      <IconButton
        icon="close"
        label="설치됨 안내 닫기"
        className="shrink-0"
        onClick={() => {
          dismissInstalledBanner();
          document
            .querySelector<HTMLElement>("main")
            ?.focus({ preventScroll: true });
        }}
      />
    </aside>
  );
}
